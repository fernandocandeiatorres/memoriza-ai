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

  const decrementCredits = useCallback(
    (amount: number = 1) => {
      setCredits((prev) => Math.max(0, prev - amount));
      toast({
        title: "Crédito Usado",
        description: `${amount} crédito${amount > 1 ? "s" : ""} consumido${
          amount > 1 ? "s" : ""
        }. Restam ${Math.max(0, credits - amount)} créditos.`,
        variant: "default",
      });
    },
    [credits, toast]
  );

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

  const showCreditsSuccess = useCallback(
    (remainingCredits: number, flashcardCount: number) => {
      toast({
        title: "✅ Flashcards Gerados!",
        description: `${flashcardCount} flashcards criados com sucesso! Restam ${remainingCredits} créditos.`,
        variant: "default",
      });
    },
    [toast]
  );

  const showCreditsWarning = useCallback(() => {
    if (credits <= 1) {
      toast({
        title: "⚠️ Poucos Créditos",
        description: `Você tem apenas ${credits} crédito${
          credits !== 1 ? "s" : ""
        } restante${credits !== 1 ? "s" : ""}.`,
        variant: "default",
      });
    }
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
    showCreditsSuccess,
    showCreditsWarning,
  };
};
