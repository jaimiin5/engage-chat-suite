import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CrawlRequest {
  chatbotId: string;
  websiteUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatbotId, websiteUrl } = (await req.json()) as CrawlRequest;

    if (!chatbotId || !websiteUrl) {
      return new Response(
        JSON.stringify({ error: "chatbotId and websiteUrl are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting crawl for chatbot ${chatbotId}: ${websiteUrl}`);

    // Format URL
    let formattedUrl = websiteUrl.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    // Get Firecrawl API key
    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      console.error("FIRECRAWL_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Crawling service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify chatbot exists
    const { data: chatbot, error: chatbotError } = await supabase
      .from("chatbots")
      .select("id, organization_id")
      .eq("id", chatbotId)
      .maybeSingle();

    if (chatbotError || !chatbot) {
      console.error("Chatbot not found:", chatbotError);
      return new Response(
        JSON.stringify({ error: "Chatbot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Crawl the website using Firecrawl
    console.log("Calling Firecrawl API...");
    const crawlResponse = await fetch("https://api.firecrawl.dev/v1/crawl", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        limit: 20, // Limit pages to crawl
        scrapeOptions: {
          formats: ["markdown"],
          onlyMainContent: true,
        },
      }),
    });

    const crawlData = await crawlResponse.json();
    console.log("Firecrawl response status:", crawlResponse.status);

    if (!crawlResponse.ok) {
      console.error("Firecrawl error:", crawlData);
      return new Response(
        JSON.stringify({ error: crawlData.error || "Failed to start crawling" }),
        { status: crawlResponse.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Firecrawl returns a job ID for async crawling
    const jobId = crawlData.id;
    console.log("Crawl job started:", jobId);

    // Poll for completion (max 60 seconds)
    let attempts = 0;
    const maxAttempts = 30;
    let crawlResult = null;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
        headers: {
          "Authorization": `Bearer ${firecrawlApiKey}`,
        },
      });

      const statusData = await statusResponse.json();
      console.log(`Poll attempt ${attempts + 1}: status = ${statusData.status}`);

      if (statusData.status === "completed") {
        crawlResult = statusData;
        break;
      } else if (statusData.status === "failed") {
        return new Response(
          JSON.stringify({ error: "Crawling failed" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      attempts++;
    }

    if (!crawlResult) {
      return new Response(
        JSON.stringify({ error: "Crawling timed out. Please try again." }),
        { status: 408, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Combine all crawled content
    const pages = crawlResult.data || [];
    let combinedContent = "";
    let title = "";

    for (const page of pages) {
      if (page.metadata?.title && !title) {
        title = page.metadata.title;
      }
      if (page.markdown) {
        combinedContent += `\n\n--- Page: ${page.metadata?.sourceURL || "Unknown"} ---\n\n`;
        combinedContent += page.markdown;
      }
    }

    if (!combinedContent.trim()) {
      return new Response(
        JSON.stringify({ error: "No content could be extracted from the website" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Extracted ${pages.length} pages, total content length: ${combinedContent.length}`);

    // Delete existing content for this chatbot
    await supabase
      .from("chatbot_website_content")
      .delete()
      .eq("chatbot_id", chatbotId);

    // Store the crawled content
    const { error: insertError } = await supabase
      .from("chatbot_website_content")
      .insert({
        chatbot_id: chatbotId,
        website_url: formattedUrl,
        content: combinedContent,
        title: title || null,
        crawled_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error storing content:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to store crawled content" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update chatbot with website URL
    await supabase
      .from("chatbots")
      .update({ website_url: formattedUrl })
      .eq("id", chatbotId);

    console.log("Successfully crawled and stored website content");

    return new Response(
      JSON.stringify({
        success: true,
        pagesScraped: pages.length,
        contentLength: combinedContent.length,
        title: title,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Crawl function error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
