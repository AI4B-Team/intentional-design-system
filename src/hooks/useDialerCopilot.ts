import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  ContactContext,
  BriefingData,
  SuggestionsData,
  ObjectionData,
  SentimentData,
  PostCallData,
  CopilotPhase,
} from '@/components/dialer/copilot/types';

interface UseCopilotReturn {
  phase: CopilotPhase;
  setPhase: (phase: CopilotPhase) => void;
  briefing: BriefingData | null;
  suggestions: SuggestionsData | null;
  objectionResponse: ObjectionData | null;
  sentiment: SentimentData | null;
  postCallActions: PostCallData | null;
  isLoading: boolean;
  fetchBriefing: (context: ContactContext) => Promise<void>;
  fetchSuggestions: (context: ContactContext, transcript?: string) => Promise<void>;
  handleObjection: (objectionText: string, context: ContactContext) => Promise<void>;
  analyzeSentiment: (transcript: string) => Promise<void>;
  generatePostCallActions: (context: ContactContext, outcome: string, notes: string) => Promise<void>;
  clearObjection: () => void;
  reset: () => void;
}

export function useDialerCopilot(): UseCopilotReturn {
  const [phase, setPhase] = useState<CopilotPhase>('before');
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [objectionResponse, setObjectionResponse] = useState<ObjectionData | null>(null);
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [postCallActions, setPostCallActions] = useState<PostCallData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const callCopilot = async (type: string, payload: any) => {
    const { data, error } = await supabase.functions.invoke('dialer-copilot', {
      body: { type, ...payload },
    });

    if (error) {
      console.error('Copilot error:', error);
      if (error.message?.includes('429')) {
        toast.error('AI rate limit reached. Try again in a moment.');
      } else if (error.message?.includes('402')) {
        toast.error('AI credits exhausted. Please add credits.');
      }
      throw error;
    }

    return data;
  };

  const fetchBriefing = useCallback(async (context: ContactContext) => {
    setIsLoading(true);
    try {
      const data = await callCopilot('briefing', { context });
      setBriefing(data);
    } catch (error) {
      console.error('Failed to fetch briefing:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (context: ContactContext, transcript?: string) => {
    try {
      const data = await callCopilot('suggestions', { context, currentTranscript: transcript });
      setSuggestions(data);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  }, []);

  const handleObjection = useCallback(async (objectionText: string, context: ContactContext) => {
    setIsLoading(true);
    try {
      const data = await callCopilot('objection', { objectionText, context });
      setObjectionResponse(data);
    } catch (error) {
      console.error('Failed to handle objection:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeSentiment = useCallback(async (transcript: string) => {
    try {
      const data = await callCopilot('sentiment', { currentTranscript: transcript });
      setSentiment(data);
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
    }
  }, []);

  const generatePostCallActions = useCallback(async (context: ContactContext, outcome: string, notes: string) => {
    setIsLoading(true);
    try {
      const data = await callCopilot('post_call', { context, callOutcome: outcome, callNotes: notes });
      setPostCallActions(data);
    } catch (error) {
      console.error('Failed to generate post-call actions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearObjection = useCallback(() => {
    setObjectionResponse(null);
  }, []);

  const reset = useCallback(() => {
    setPhase('before');
    setBriefing(null);
    setSuggestions(null);
    setObjectionResponse(null);
    setSentiment(null);
    setPostCallActions(null);
    setIsLoading(false);
  }, []);

  return {
    phase,
    setPhase,
    briefing,
    suggestions,
    objectionResponse,
    sentiment,
    postCallActions,
    isLoading,
    fetchBriefing,
    fetchSuggestions,
    handleObjection,
    analyzeSentiment,
    generatePostCallActions,
    clearObjection,
    reset,
  };
}
