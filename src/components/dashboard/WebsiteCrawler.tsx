import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Loader2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface WebsiteCrawlerProps {
  chatbotId: string;
  websiteUrl: string | null;
  onUrlChange: (url: string | null) => void;
}

interface WebsiteContent {
  id: string;
  website_url: string;
  title: string | null;
  crawled_at: string;
  content: string;
}

const WebsiteCrawler = ({ chatbotId, websiteUrl, onUrlChange }: WebsiteCrawlerProps) => {
  const [url, setUrl] = useState(websiteUrl || "");
  const [crawling, setCrawling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [crawledContent, setCrawledContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrawledContent();
  }, [chatbotId]);

  useEffect(() => {
    setUrl(websiteUrl || "");
  }, [websiteUrl]);

  const fetchCrawledContent = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbot_website_content")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .maybeSingle();

      if (error) throw error;
      setCrawledContent(data);
    } catch (error) {
      console.error("Error fetching crawled content:", error);
    } finally {
      setLoading(false);
    }
  };

  const startCrawling = async () => {
    if (!url.trim()) {
      toast.error("Please enter a website URL");
      return;
    }

    setCrawling(true);
    setProgress(0);

    // Simulate progress while crawling
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 1000);

    try {
      const { data, error } = await supabase.functions.invoke("crawl-website", {
        body: {
          chatbotId,
          websiteUrl: url.trim(),
        },
      });

      clearInterval(progressInterval);

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setProgress(100);
      toast.success(`Successfully crawled ${data.pagesScraped} pages!`);
      onUrlChange(url.trim());
      await fetchCrawledContent();
    } catch (error: any) {
      console.error("Error crawling website:", error);
      toast.error(error.message || "Failed to crawl website");
    } finally {
      setCrawling(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const removeCrawledContent = async () => {
    if (!confirm("Are you sure you want to remove the crawled website data?")) return;

    try {
      const { error } = await supabase
        .from("chatbot_website_content")
        .delete()
        .eq("chatbot_id", chatbotId);

      if (error) throw error;

      // Also clear the website_url from chatbot
      await supabase
        .from("chatbots")
        .update({ website_url: null })
        .eq("id", chatbotId);

      setCrawledContent(null);
      setUrl("");
      onUrlChange(null);
      toast.success("Website data removed");
    } catch (error) {
      console.error("Error removing content:", error);
      toast.error("Failed to remove website data");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Website Knowledge
        </CardTitle>
        <CardDescription>
          Crawl a website to give your chatbot knowledge about its content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {crawledContent ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">
                  Website crawled successfully
                </p>
                <a
                  href={crawledContent.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {crawledContent.website_url}
                </a>
                {crawledContent.title && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {crawledContent.title}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Crawled on {new Date(crawledContent.crawled_at).toLocaleDateString()} •{" "}
                  {Math.round(crawledContent.content.length / 1000)}KB of content
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={removeCrawledContent}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                To update the content, remove the current data and crawl again.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="website-url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="website-url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={crawling}
                />
                <Button onClick={startCrawling} disabled={crawling || !url.trim()}>
                  {crawling ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Crawling...
                    </>
                  ) : (
                    "Crawl"
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the main URL of the website you want to crawl (up to 20 pages)
              </p>
            </div>

            {crawling && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Crawling website... This may take up to a minute.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WebsiteCrawler;
