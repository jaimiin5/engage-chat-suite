import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  botId?: string;
}

interface ChatbotConfig {
  system_prompt: string;
  organization_id: string;
  is_active: boolean;
}

interface OrgSettings {
  ai_provider: string;
  api_key_encrypted: string | null;
  model_preference: string | null;
}

interface Organization {
  subscription_tier: string;
  messages_used: number;
  monthly_message_limit: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, botId } = (await req.json()) as ChatRequest;
    
    console.log(`Chat request received for bot: ${botId || 'default'}`);
    console.log(`Message count: ${messages.length}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let systemPrompt = "You are a helpful AI assistant. Be conversational but professional.";
    let aiProvider = "lovable";
    let apiKey: string | null = null;
    let model = "google/gemini-2.5-flash";
    let organizationId: string | null = null;
    let isPaidTier = false;

    // If botId is provided, fetch chatbot config
    if (botId) {
      const { data: chatbot, error: chatbotError } = await supabase
        .from("chatbots")
        .select("system_prompt, organization_id, is_active")
        .eq("id", botId)
        .maybeSingle();

      if (chatbotError) {
        console.error("Error fetching chatbot:", chatbotError);
      }

      if (!chatbot) {
        return new Response(
          JSON.stringify({ error: "Chatbot not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!chatbot.is_active) {
        return new Response(
          JSON.stringify({ error: "Chatbot is disabled" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      systemPrompt = chatbot.system_prompt || systemPrompt;
      organizationId = chatbot.organization_id;

      // Fetch organization settings
      const { data: orgSettings, error: orgError } = await supabase
        .from("organization_settings")
        .select("ai_provider, api_key_encrypted, model_preference")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (orgError) {
        console.error("Error fetching org settings:", orgError);
      }

      // Fetch organization to check tier
      const { data: org, error: orgDataError } = await supabase
        .from("organizations")
        .select("subscription_tier, messages_used, monthly_message_limit")
        .eq("id", organizationId)
        .maybeSingle();

      if (orgDataError) {
        console.error("Error fetching organization:", orgDataError);
      }

      if (org) {
        isPaidTier = org.subscription_tier !== "free";

        // Check message limits
        if (org.messages_used >= org.monthly_message_limit) {
          return new Response(
            JSON.stringify({ error: "Monthly message limit exceeded. Please upgrade your plan." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      if (orgSettings) {
        if (isPaidTier) {
          // Paid tier: use Lovable AI
          aiProvider = "lovable";
        } else {
          // Free tier: must use their own API key
          if (!orgSettings.api_key_encrypted) {
            return new Response(
              JSON.stringify({ error: "API key required. Please add your API key in settings or upgrade to a paid plan." }),
              { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
          aiProvider = orgSettings.ai_provider || "openai";
          apiKey = orgSettings.api_key_encrypted;
          model = orgSettings.model_preference || "gpt-4o-mini";
        }
      }

      // Increment usage
      if (organizationId) {
        await supabase
          .from("organizations")
          .update({ messages_used: (org?.messages_used || 0) + 1 })
          .eq("id", organizationId);

        // Log usage
        await supabase.from("usage_logs").insert({
          organization_id: organizationId,
          chatbot_id: botId,
          message_count: 1,
        });
      }
    }

    // Make API call based on provider
    let response: Response;

    if (aiProvider === "lovable" || isPaidTier) {
      // Use Lovable AI Gateway
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        console.error("LOVABLE_API_KEY is not configured");
        throw new Error("AI service not configured");
      }

      response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (aiProvider === "openai" && apiKey) {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      });
    } else if (aiProvider === "anthropic" && apiKey) {
      response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: model || "claude-3-haiku-20240307",
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })),
          stream: true,
        }),
      });
    } else if (aiProvider === "google" && apiKey) {
      // Google AI via their REST API
      const googleModel = model || "gemini-1.5-flash";
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${googleModel}:streamGenerateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: systemPrompt }] },
              ...messages.map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
            ],
          }),
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid AI provider configuration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI provider error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 401 || response.status === 403) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your settings." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Stream the response back
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
    
  } catch (error) {
    console.error("Chat function error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
