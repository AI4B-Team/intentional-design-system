import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentOrganizationId } from "@/hooks/useOrganizationId";
import { toast } from "sonner";

interface ConversationSummary {
  id: string;
  title: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function useAIVAConversations() {
  const { user } = useAuth();
  const orgId = useCurrentOrganizationId();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch recent conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("aiva_conversations")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      setConversations((data as ConversationSummary[]) || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load a specific conversation's messages
  const loadConversation = useCallback(async (id: string): Promise<Message[] | null> => {
    try {
      const { data, error } = await supabase
        .from("aiva_conversations")
        .select("messages")
        .eq("id", id)
        .single();
      if (error) throw error;
      setActiveConversationId(id);
      return (data?.messages as unknown as Message[]) || [];
    } catch (err) {
      console.error("Failed to load conversation:", err);
      toast.error("Failed to load conversation");
      return null;
    }
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (messages: Message[], title: string): Promise<string | null> => {
    if (!user || !orgId) return null;
    try {
      const { data, error } = await supabase
        .from("aiva_conversations")
        .insert({
          user_id: user.id,
          organization_id: orgId,
          title: title.slice(0, 50),
          messages: messages as any,
        })
        .select("id")
        .single();
      if (error) throw error;
      const newId = data.id;
      setActiveConversationId(newId);
      // Prepend to list
      setConversations(prev => [{ id: newId, title: title.slice(0, 50), updated_at: new Date().toISOString() }, ...prev]);
      return newId;
    } catch (err) {
      console.error("Failed to create conversation:", err);
      return null;
    }
  }, [user, orgId]);

  // Update an existing conversation's messages
  const updateConversation = useCallback(async (id: string, messages: Message[]) => {
    try {
      const { error } = await supabase
        .from("aiva_conversations")
        .update({ messages: messages as any })
        .eq("id", id);
      if (error) throw error;
      // Update timestamp in local list
      setConversations(prev => prev.map(c => c.id === id ? { ...c, updated_at: new Date().toISOString() } : c));
    } catch (err) {
      console.error("Failed to update conversation:", err);
    }
  }, []);

  // Delete a conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("aiva_conversations")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) setActiveConversationId(null);
      toast.success("Conversation deleted");
    } catch (err) {
      console.error("Failed to delete conversation:", err);
      toast.error("Failed to delete conversation");
    }
  }, [activeConversationId]);

  // Start a new conversation (reset active)
  const startNewConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  return {
    conversations,
    activeConversationId,
    isLoadingHistory,
    fetchConversations,
    loadConversation,
    createConversation,
    updateConversation,
    deleteConversation,
    startNewConversation,
  };
}
