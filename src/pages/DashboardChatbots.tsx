import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChatbotQAPairs from "@/components/dashboard/ChatbotQAPairs";
import ChatbotTest from "@/components/dashboard/ChatbotTest";
import WebsiteCrawler from "@/components/dashboard/WebsiteCrawler";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Plus, Trash2, Copy, Code, Loader2, Settings, MessageSquare, Play, Globe } from "lucide-react";
import { toast } from "sonner";

interface Chatbot {
  id: string;
  name: string;
  description: string | null;
  system_prompt: string;
  welcome_message: string | null;
  theme: string;
  position: string;
  is_active: boolean;
  website_url: string | null;
  primary_color: string;
  icon_type: string;
  icon_text: string | null;
}

const DashboardChatbots = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedBot, setSelectedBot] = useState<Chatbot | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const [newBot, setNewBot] = useState({ name: "", description: "" });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  useEffect(() => {
    const botId = searchParams.get("id");
    if (botId && chatbots.length > 0) {
      const bot = chatbots.find((b) => b.id === botId);
      if (bot) setSelectedBot(bot);
    }
  }, [searchParams, chatbots]);

  const fetchData = async () => {
    try {
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("owner_id", user?.id)
        .maybeSingle();

      if (orgError) throw orgError;
      setOrganizationId(orgData?.id || null);

      if (orgData) {
        const { data: botsData, error: botsError } = await supabase
          .from("chatbots")
          .select("*")
          .eq("organization_id", orgData.id)
          .order("created_at", { ascending: false });

        if (botsError) throw botsError;
        setChatbots(botsData || []);
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
      toast.error("Failed to load chatbots");
    } finally {
      setLoading(false);
    }
  };

  const createChatbot = async () => {
    if (!organizationId || !newBot.name.trim()) return;
    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("chatbots")
        .insert({
          organization_id: organizationId,
          name: newBot.name.trim(),
          description: newBot.description.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setChatbots([data, ...chatbots]);
      setSelectedBot(data);
      setCreateOpen(false);
      setNewBot({ name: "", description: "" });
      toast.success("Chatbot created!");
    } catch (error) {
      console.error("Error creating chatbot:", error);
      toast.error("Failed to create chatbot");
    } finally {
      setSaving(false);
    }
  };

  const updateChatbot = async () => {
    if (!selectedBot) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("chatbots")
        .update({
          name: selectedBot.name,
          description: selectedBot.description,
          system_prompt: selectedBot.system_prompt,
          welcome_message: selectedBot.welcome_message,
          theme: selectedBot.theme,
          position: selectedBot.position,
          is_active: selectedBot.is_active,
          primary_color: selectedBot.primary_color,
          icon_type: selectedBot.icon_type,
          icon_text: selectedBot.icon_text,
        })
        .eq("id", selectedBot.id);

      if (error) throw error;

      setChatbots(chatbots.map((b) => (b.id === selectedBot.id ? selectedBot : b)));
      toast.success("Chatbot updated!");
    } catch (error) {
      console.error("Error updating chatbot:", error);
      toast.error("Failed to update chatbot");
    } finally {
      setSaving(false);
    }
  };

  const deleteChatbot = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chatbot?")) return;

    try {
      const { error } = await supabase.from("chatbots").delete().eq("id", id);
      if (error) throw error;

      setChatbots(chatbots.filter((b) => b.id !== id));
      if (selectedBot?.id === id) {
        setSelectedBot(null);
        setSearchParams({});
      }
      toast.success("Chatbot deleted");
    } catch (error) {
      console.error("Error deleting chatbot:", error);
      toast.error("Failed to delete chatbot");
    }
  };

  const getEmbedCode = () => {
    if (!selectedBot) return "";
    const baseUrl = window.location.origin;
    return `<script src="${baseUrl}/widget.js" data-bot-id="${selectedBot.id}" data-theme="${selectedBot.theme}" data-position="${selectedBot.position}" data-primary-color="${selectedBot.primary_color || '#000000'}" data-icon-type="${selectedBot.icon_type || 'icon'}"${selectedBot.icon_type === 'alphabet' && selectedBot.icon_text ? ` data-icon-text="${selectedBot.icon_text}"` : ''}></script>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    toast.success("Embed code copied!");
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Chatbots | ChatFlow</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chatbots</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your AI chatbots
            </p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chatbot</DialogTitle>
                <DialogDescription>
                  Give your chatbot a name and description
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Support Bot"
                    value={newBot.name}
                    onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Input
                    id="description"
                    placeholder="Handles customer support queries"
                    value={newBot.description}
                    onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createChatbot} disabled={saving || !newBot.name.trim()}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chatbot list */}
          <div className="lg:col-span-1 space-y-2">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))
            ) : chatbots.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Bot className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No chatbots yet</p>
                </CardContent>
              </Card>
            ) : (
              chatbots.map((bot) => (
                <Card
                  key={bot.id}
                  className={`cursor-pointer transition-colors ${
                    selectedBot?.id === bot.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-secondary/50"
                  }`}
                  onClick={() => {
                    setSelectedBot(bot);
                    setSearchParams({ id: bot.id });
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{bot.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {bot.is_active ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatbot(bot.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Chatbot editor */}
          <div className="lg:col-span-2">
            {selectedBot ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Configure Chatbot</CardTitle>
                      <CardDescription>
                        Customize your chatbot's behavior and appearance
                      </CardDescription>
                    </div>
                    <Dialog open={embedOpen} onOpenChange={setEmbedOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Code className="h-4 w-4 mr-2" />
                          Get Embed Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Embed Code</DialogTitle>
                          <DialogDescription>
                            Add this script to your website to embed the chatbot
                          </DialogDescription>
                        </DialogHeader>
                        <div className="relative">
                          <pre className="p-4 pr-12 bg-muted rounded-lg text-sm overflow-x-auto whitespace-pre-wrap break-all">
                            <code className="block">{getEmbedCode()}</code>
                          </pre>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2"
                            onClick={copyEmbedCode}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="settings">
                    <TabsList className="mb-4">
                      <TabsTrigger value="settings" className="gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </TabsTrigger>
                      <TabsTrigger value="website" className="gap-2">
                        <Globe className="h-4 w-4" />
                        Website
                      </TabsTrigger>
                      <TabsTrigger value="qa" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Custom Q&A
                      </TabsTrigger>
                      <TabsTrigger value="test" className="gap-2">
                        <Play className="h-4 w-4" />
                        Test Chatbot
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="settings" className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="bot-name">Name</Label>
                          <Input
                            id="bot-name"
                            value={selectedBot.name}
                            onChange={(e) =>
                              setSelectedBot({ ...selectedBot, name: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bot-description">Description</Label>
                          <Input
                            id="bot-description"
                            value={selectedBot.description || ""}
                            onChange={(e) =>
                              setSelectedBot({ ...selectedBot, description: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="system-prompt">System Prompt</Label>
                        <Textarea
                          id="system-prompt"
                          rows={5}
                          placeholder="You are a helpful AI assistant..."
                          value={selectedBot.system_prompt}
                          onChange={(e) =>
                            setSelectedBot({ ...selectedBot, system_prompt: e.target.value })
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          This defines your chatbot's personality and behavior
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="welcome-message">Welcome Message</Label>
                        <Input
                          id="welcome-message"
                          placeholder="Hello! How can I help you today?"
                          value={selectedBot.welcome_message || ""}
                          onChange={(e) =>
                            setSelectedBot({ ...selectedBot, welcome_message: e.target.value })
                          }
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Theme</Label>
                          <Select
                            value={selectedBot.theme}
                            onValueChange={(value) =>
                              setSelectedBot({ ...selectedBot, theme: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="light">Light</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Position</Label>
                          <Select
                            value={selectedBot.position}
                            onValueChange={(value) =>
                              setSelectedBot({ ...selectedBot, position: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="bottom-right">Bottom Right</SelectItem>
                              <SelectItem value="bottom-left">Bottom Left</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Widget Appearance */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold">Widget Appearance</Label>
                        
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="primary-color">Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                id="primary-color"
                                type="color"
                                value={selectedBot.primary_color || "#000000"}
                                onChange={(e) =>
                                  setSelectedBot({ ...selectedBot, primary_color: e.target.value })
                                }
                                className="w-10 h-10 rounded-lg border border-border cursor-pointer p-0.5"
                              />
                              <Input
                                value={selectedBot.primary_color || "#000000"}
                                onChange={(e) =>
                                  setSelectedBot({ ...selectedBot, primary_color: e.target.value })
                                }
                                className="flex-1 font-mono text-sm"
                                placeholder="#000000"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Icon Type</Label>
                            <Select
                              value={selectedBot.icon_type || "icon"}
                              onValueChange={(value) =>
                                setSelectedBot({ ...selectedBot, icon_type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="icon">Bot Icon</SelectItem>
                                <SelectItem value="alphabet">Custom Letter</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {selectedBot.icon_type === "alphabet" && (
                          <div className="space-y-2">
                            <Label htmlFor="icon-text">Icon Letter(s)</Label>
                            <Input
                              id="icon-text"
                              value={selectedBot.icon_text || ""}
                              onChange={(e) =>
                                setSelectedBot({ ...selectedBot, icon_text: e.target.value.slice(0, 2) })
                              }
                              placeholder="AB"
                              maxLength={2}
                              className="w-32"
                            />
                            <p className="text-xs text-muted-foreground">
                              1-2 characters shown on the widget button and bot avatar
                            </p>
                          </div>
                        )}

                        {/* Preview */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                            style={{ backgroundColor: selectedBot.primary_color || "#000000" }}
                          >
                            {selectedBot.icon_type === "alphabet" && selectedBot.icon_text
                              ? selectedBot.icon_text.toUpperCase()
                              : <Bot className="w-6 h-6" />}
                          </div>
                          <span className="text-sm text-muted-foreground">Widget button preview</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Active</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable or disable this chatbot
                          </p>
                        </div>
                        <Switch
                          checked={selectedBot.is_active}
                          onCheckedChange={(checked) =>
                            setSelectedBot({ ...selectedBot, is_active: checked })
                          }
                        />
                      </div>

                      <Button onClick={updateChatbot} disabled={saving} className="w-full">
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </TabsContent>

                    <TabsContent value="website">
                      <WebsiteCrawler
                        chatbotId={selectedBot.id}
                        websiteUrl={selectedBot.website_url}
                        onUrlChange={(url) => {
                          setSelectedBot({ ...selectedBot, website_url: url });
                          setChatbots(
                            chatbots.map((b) =>
                              b.id === selectedBot.id ? { ...b, website_url: url } : b
                            )
                          );
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="qa">
                      <ChatbotQAPairs chatbotId={selectedBot.id} />
                    </TabsContent>

                    <TabsContent value="test">
                      <ChatbotTest
                        chatbotId={selectedBot.id}
                        chatbotName={selectedBot.name}
                        welcomeMessage={selectedBot.welcome_message || undefined}
                        theme={selectedBot.theme}
                        primaryColor={selectedBot.primary_color}
                        iconType={selectedBot.icon_type as "icon" | "alphabet"}
                        iconText={selectedBot.icon_text || undefined}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a chatbot to configure
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardChatbots;
