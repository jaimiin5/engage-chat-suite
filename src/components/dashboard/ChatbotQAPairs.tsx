import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface QAPair {
  id: string;
  question: string;
  answer: string;
  match_type: string;
  priority: number;
  is_active: boolean;
}

interface ChatbotQAPairsProps {
  chatbotId: string;
}

const ChatbotQAPairs = ({ chatbotId }: ChatbotQAPairsProps) => {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPair, setNewPair] = useState({
    question: "",
    answer: "",
    match_type: "contains",
    priority: 0
  });

  useEffect(() => {
    fetchQAPairs();
  }, [chatbotId]);

  const fetchQAPairs = async () => {
    try {
      const { data, error } = await supabase
        .from("chatbot_qa_pairs")
        .select("*")
        .eq("chatbot_id", chatbotId)
        .order("priority", { ascending: false });

      if (error) throw error;
      setQaPairs(data || []);
    } catch (error) {
      console.error("Error fetching Q&A pairs:", error);
      toast.error("Failed to load Q&A pairs");
    } finally {
      setLoading(false);
    }
  };

  const addQAPair = async () => {
    if (!newPair.question.trim() || !newPair.answer.trim()) {
      toast.error("Please fill in both question and answer");
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("chatbot_qa_pairs")
        .insert({
          chatbot_id: chatbotId,
          question: newPair.question.trim(),
          answer: newPair.answer.trim(),
          match_type: newPair.match_type,
          priority: newPair.priority
        })
        .select()
        .single();

      if (error) throw error;

      setQaPairs([data, ...qaPairs]);
      setNewPair({ question: "", answer: "", match_type: "contains", priority: 0 });
      toast.success("Q&A pair added!");
    } catch (error) {
      console.error("Error adding Q&A pair:", error);
      toast.error("Failed to add Q&A pair");
    } finally {
      setSaving(false);
    }
  };

  const updateQAPair = async (id: string, updates: Partial<QAPair>) => {
    try {
      const { error } = await supabase
        .from("chatbot_qa_pairs")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setQaPairs(qaPairs.map(qa => qa.id === id ? { ...qa, ...updates } : qa));
      toast.success("Q&A pair updated!");
    } catch (error) {
      console.error("Error updating Q&A pair:", error);
      toast.error("Failed to update Q&A pair");
    }
  };

  const deleteQAPair = async (id: string) => {
    if (!confirm("Delete this Q&A pair?")) return;

    try {
      const { error } = await supabase
        .from("chatbot_qa_pairs")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setQaPairs(qaPairs.filter(qa => qa.id !== id));
      toast.success("Q&A pair deleted");
    } catch (error) {
      console.error("Error deleting Q&A pair:", error);
      toast.error("Failed to delete Q&A pair");
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
          <MessageSquare className="h-5 w-5" />
          Custom Q&A Pairs
        </CardTitle>
        <CardDescription>
          Add predefined responses that don't require AI. These are checked first before using AI.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add new Q&A pair */}
        <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
          <h4 className="font-medium">Add New Q&A Pair</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Question / Trigger</Label>
              <Input
                placeholder="e.g., how are you"
                value={newPair.question}
                onChange={(e) => setNewPair({ ...newPair, question: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Match Type</Label>
              <Select
                value={newPair.match_type}
                onValueChange={(value) => setNewPair({ ...newPair, match_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contains">Contains (anywhere in message)</SelectItem>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="starts_with">Starts With</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              placeholder="e.g., I'm doing great! How can I help you today?"
              rows={3}
              value={newPair.answer}
              onChange={(e) => setNewPair({ ...newPair, answer: e.target.value })}
            />
          </div>
          <Button onClick={addQAPair} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Plus className="h-4 w-4 mr-2" />
            Add Q&A Pair
          </Button>
        </div>

        {/* Existing Q&A pairs */}
        {qaPairs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No Q&A pairs yet. Add one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {qaPairs.map((qa) => (
              <div
                key={qa.id}
                className="p-4 border rounded-lg space-y-3 bg-background"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {qa.match_type}
                      </span>
                      <Switch
                        checked={qa.is_active}
                        onCheckedChange={(checked) => updateQAPair(qa.id, { is_active: checked })}
                      />
                      <span className="text-xs text-muted-foreground">
                        {qa.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-medium text-sm">Q: {qa.question}</p>
                    <p className="text-sm text-muted-foreground">A: {qa.answer}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => deleteQAPair(qa.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatbotQAPairs;
