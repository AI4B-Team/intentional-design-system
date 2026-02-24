import { useState, useCallback } from "react";
import { toast } from "sonner";

const WRITER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-website-writer`;

interface UseAIWriterOptions {
  siteType: string;
  companyName: string;
}

export function useAIWriter({ siteType, companyName }: UseAIWriterOptions) {
  const [loadingField, setLoadingField] = useState<string | null>(null);

  const generateCopy = useCallback(
    async (fieldType: string, currentValue: string, context?: string): Promise<string | null> => {
      setLoadingField(fieldType);
      try {
        const response = await fetch(WRITER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ fieldType, currentValue, siteType, companyName, context }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          if (response.status === 429) {
            toast.error("Rate limit exceeded. Please wait a moment.");
          } else if (response.status === 402) {
            toast.error("AI credits exhausted.");
          } else {
            toast.error(data.error || "Failed to generate copy");
          }
          return null;
        }

        const data = await response.json();
        return data.suggestion || null;
      } catch (error) {
        console.error("AI writer error:", error);
        toast.error("Failed to generate copy");
        return null;
      } finally {
        setLoadingField(null);
      }
    },
    [siteType, companyName]
  );

  return { generateCopy, loadingField };
}
