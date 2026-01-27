import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SkipTraceInput {
  firstName?: string;
  lastName?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyId?: string;
}

export interface PhoneResult {
  number: string;
  type: string;
  score: number;
  dnc: boolean;
  carrier?: string;
}

export interface EmailResult {
  address: string;
  score: number;
}

export interface SkipTraceResults {
  primaryPhone: PhoneResult | null;
  primaryEmail: EmailResult | null;
  allPhones: PhoneResult[];
  allEmails: EmailResult[];
  relatives: Array<{ name: string; phone?: string }>;
  flags: {
    deceased: boolean;
    bankruptcy: boolean;
  };
  totalPhonesFound: number;
  totalEmailsFound: number;
}

interface SkipTraceResponse {
  success: boolean;
  results?: SkipTraceResults;
  creditsUsed?: number;
  newBalance?: number;
  skipTraceId?: string;
  error?: string;
  code?: string;
  balance?: number;
  required?: number;
}

export function useSkipTrace() {
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<SkipTraceResults | null>(null);

  const runSkipTrace = async (input: SkipTraceInput): Promise<SkipTraceResponse> => {
    setLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("skip-trace", {
        body: input,
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === "INSUFFICIENT_CREDITS") {
          toast.error(
            `Insufficient credits. You need $${data.required?.toFixed(2)} but have $${data.balance?.toFixed(2)}.`
          );
          return {
            success: false,
            error: "INSUFFICIENT_CREDITS",
            balance: data.balance,
            required: data.required,
          };
        }
        throw new Error(data.error);
      }

      setResults(data.results);
      toast.success(
        `Skip trace complete! Found ${data.results.totalPhonesFound} phones, ${data.results.totalEmailsFound} emails.`
      );

      return {
        success: true,
        results: data.results,
        creditsUsed: data.creditsUsed,
        newBalance: data.newBalance,
        skipTraceId: data.skipTraceId,
      };
    } catch (error: any) {
      console.error("Skip trace error:", error);
      toast.error(error.message || "Skip trace failed");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => setResults(null);

  return { runSkipTrace, loading, results, clearResults };
}
