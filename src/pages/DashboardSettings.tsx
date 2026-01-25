import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Key, Loader2, Check, AlertTriangle, Zap, Bot } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface Organization {
  id: string;
  name: string;
  subscription_tier: string;
  monthly_message_limit: number;
  messages_used: number;
}

interface OrgSettings {
  ai_provider: string;
  api_key_encrypted: string | null;
  model_preference: string | null;
  ai_enabled: boolean;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI", models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"] },
  { value: "anthropic", label: "Anthropic", models: ["claude-3-haiku-20240307", "claude-3-sonnet-20240229", "claude-3-opus-20240229"] },
  { value: "google", label: "Google AI", models: ["gemini-1.5-flash", "gemini-1.5-pro"] },
];

const TIERS = [
  { value: "free", label: "Free", price: "$0", features: ["100 messages/month", "Bring your own API key", "1 chatbot"] },
  { value: "starter", label: "Starter", price: "$19", features: ["2,000 messages/month", "Lovable AI included", "5 chatbots", "Priority support"] },
  { value: "pro", label: "Pro", price: "$49", features: ["10,000 messages/month", "Lovable AI included", "Unlimited chatbots", "Custom branding", "Analytics"] },
];

const DashboardSettings = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (orgError) throw orgError;
      setOrganization(orgData);

      if (orgData) {
        const { data: settingsData, error: settingsError } = await supabase
          .from("organization_settings")
          .select("*")
          .eq("organization_id", orgData.id)
          .maybeSingle();

        if (settingsError) throw settingsError;
        setSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!organization || !settings) return;
    setSaving(true);

    try {
      const updateData: any = {
        ai_provider: settings.ai_provider,
        model_preference: settings.model_preference,
        ai_enabled: settings.ai_enabled,
      };

      // Only update API key if a new one was entered
      if (apiKey.trim()) {
        updateData.api_key_encrypted = apiKey.trim();
      }

      const { error } = await supabase
        .from("organization_settings")
        .update(updateData)
        .eq("organization_id", organization.id);

      if (error) throw error;

      setApiKey("");
      await fetchData();
      toast.success("Settings saved!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const removeApiKey = async () => {
    if (!organization) return;
    if (!confirm("Are you sure you want to remove your API key?")) return;

    try {
      const { error } = await supabase
        .from("organization_settings")
        .update({ api_key_encrypted: null })
        .eq("organization_id", organization.id);

      if (error) throw error;

      await fetchData();
      toast.success("API key removed");
    } catch (error) {
      console.error("Error removing API key:", error);
      toast.error("Failed to remove API key");
    }
  };

  const currentProvider = PROVIDERS.find((p) => p.value === settings?.ai_provider);
  const isFree = organization?.subscription_tier === "free";
  const hasApiKey = !!settings?.api_key_encrypted;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Settings | ChatFlow</title>
      </Helmet>

      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization and AI configuration
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Subscription Plan
            </CardTitle>
            <CardDescription>
              Your current plan and usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-4 py-1 capitalize">
                {organization?.subscription_tier}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {organization?.messages_used} / {organization?.monthly_message_limit} messages used
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {TIERS.map((tier) => (
                <Card
                  key={tier.value}
                  className={`relative ${
                    organization?.subscription_tier === tier.value
                      ? "border-primary"
                      : ""
                  }`}
                >
                  {organization?.subscription_tier === tier.value && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-3 w-3" />
                      </div>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{tier.label}</CardTitle>
                    <div className="text-2xl font-bold">{tier.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm space-y-1">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-muted-foreground">• {feature}</li>
                      ))}
                    </ul>
                    {tier.value !== "free" && organization?.subscription_tier === "free" && (
                      <Button className="w-full mt-4" size="sm">
                        Upgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              Enable AI for intelligent responses, or use crawled website content for basic keyword matching
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* AI Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Enable AI Integration</Label>
                <p className="text-sm text-muted-foreground">
                  {settings?.ai_enabled 
                    ? "Chatbots will use AI for intelligent responses" 
                    : "Chatbots will use crawled website content and Q&A pairs only"}
                </p>
              </div>
              <Switch
                checked={settings?.ai_enabled || false}
                onCheckedChange={(checked) =>
                  setSettings((s) => s ? { ...s, ai_enabled: checked } : null)
                }
              />
            </div>

            {settings?.ai_enabled && !hasApiKey && isFree && (
              <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">API Key Required for AI</p>
                  <p className="text-sm text-muted-foreground">
                    Add your API key below to enable AI responses, or disable AI to use website content only.
                  </p>
                </div>
              </div>
            )}

            {settings?.ai_enabled && (
              <>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>AI Provider</Label>
                <Select
                  value={settings?.ai_provider || "openai"}
                  onValueChange={(value) =>
                    setSettings((s) => s ? { ...s, ai_provider: value, model_preference: PROVIDERS.find(p => p.value === value)?.models[0] || null } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={settings?.model_preference || currentProvider?.models[0] || ""}
                  onValueChange={(value) =>
                    setSettings((s) => s ? { ...s, model_preference: value } : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentProvider?.models.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="api-key">
                API Key {hasApiKey && <span className="text-emerald-500">(configured)</span>}
              </Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  placeholder={hasApiKey ? "••••••••••••••••" : "Enter your API key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono"
                />
                {hasApiKey && (
                  <Button variant="outline" onClick={removeApiKey}>
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key is stored securely and never exposed to the frontend
              </p>
            </div>

              </>
            )}

            <Button onClick={saveSettings} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input
                value={organization?.name || ""}
                onChange={(e) =>
                  setOrganization((o) => o ? { ...o, name: e.target.value } : null)
                }
              />
            </div>
            <Button
              onClick={async () => {
                if (!organization) return;
                try {
                  const { error } = await supabase
                    .from("organizations")
                    .update({ name: organization.name })
                    .eq("id", organization.id);
                  if (error) throw error;
                  toast.success("Organization updated");
                } catch (error) {
                  toast.error("Failed to update organization");
                }
              }}
            >
              Update Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
