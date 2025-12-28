import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, BarChart3, Plus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  subscription_tier: string;
  monthly_message_limit: number;
  messages_used: number;
}

interface Chatbot {
  id: string;
  name: string;
  is_active: boolean;
}

interface OrgSettings {
  ai_provider: string;
  api_key_encrypted: string | null;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [orgSettings, setOrgSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch organization
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (orgError) throw orgError;
      setOrganization(orgData);

      if (orgData) {
        // Fetch chatbots
        const { data: botsData, error: botsError } = await supabase
          .from("chatbots")
          .select("id, name, is_active")
          .eq("organization_id", orgData.id);

        if (botsError) throw botsError;
        setChatbots(botsData || []);

        // Fetch org settings
        const { data: settingsData, error: settingsError } = await supabase
          .from("organization_settings")
          .select("ai_provider, api_key_encrypted")
          .eq("organization_id", orgData.id)
          .maybeSingle();

        if (settingsError) throw settingsError;
        setOrgSettings(settingsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const needsApiKey = organization?.subscription_tier === "free" && !orgSettings?.api_key_encrypted;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard | ChatFlow</title>
      </Helmet>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your chatbots.
          </p>
        </div>

        {needsApiKey && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="flex items-center gap-4 p-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium">API Key Required</p>
                <p className="text-sm text-muted-foreground">
                  Free tier requires your own AI API key.{" "}
                  <Link to="/dashboard/settings" className="text-primary hover:underline">
                    Add your API key
                  </Link>{" "}
                  or{" "}
                  <Link to="/dashboard/settings" className="text-primary hover:underline">
                    upgrade to a paid plan
                  </Link>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatbots.length}</div>
              <p className="text-xs text-muted-foreground">
                {chatbots.filter(b => b.is_active).length} active
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages Used</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {organization?.messages_used || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                of {organization?.monthly_message_limit || 100} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Plan</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {organization?.subscription_tier || "Free"}
              </div>
              <p className="text-xs text-muted-foreground">
                <Link to="/dashboard/settings" className="hover:text-primary">
                  Upgrade plan →
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Chatbots section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Chatbots</h2>
            <Button asChild>
              <Link to="/dashboard/chatbots">
                <Plus className="h-4 w-4 mr-2" />
                Create Chatbot
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : chatbots.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <CardTitle className="text-lg mb-2">No chatbots yet</CardTitle>
                <CardDescription className="text-center mb-4">
                  Create your first AI chatbot to embed on your website
                </CardDescription>
                <Button asChild>
                  <Link to="/dashboard/chatbots">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chatbot
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {chatbots.map((bot) => (
                <Card key={bot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          bot.is_active
                            ? "bg-green-500/10 text-green-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {bot.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <CardDescription>
                      <Link
                        to={`/dashboard/chatbots?id=${bot.id}`}
                        className="text-primary hover:underline"
                      >
                        Configure →
                      </Link>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
