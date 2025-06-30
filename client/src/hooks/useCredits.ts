import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { getUserCredits } from "@/lib/goBackendApi";
import { useToast } from "./use-toast";

export const useCredits = () => {
  const { session } = useAuth();
  const { toast } = useToast();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getUserCredits(session.access_token);
      setCredits(response.credits);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch credits";
      setError(errorMessage);
      console.error("Error fetching credits:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const updateCredits = useCallback((newCredits: number) => {
    setCredits(newCredits);
  }, []);

  const decrementCredits = useCallback((amount: number = 1) => {
    setCredits((prev) => Math.max(0, prev - amount));
  }, []);

  const hasInsufficientCredits = useCallback(
    (required: number = 1) => {
      return credits < required;
    },
    [credits]
  );

  const showInsufficientCreditsError = useCallback(() => {
    toast({
      title: "Créditos Insuficientes",
      description: `Você precisa de 1 crédito para gerar flashcards. Você tem ${credits} créditos.`,
      variant: "destructive",
    });
  }, [credits, toast]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return {
    credits,
    loading,
    error,
    fetchCredits,
    updateCredits,
    decrementCredits,
    hasInsufficientCredits,
    showInsufficientCreditsError,
  };
};
