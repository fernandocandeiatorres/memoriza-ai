import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        setSession(session);
        setUser(session?.user || null);
      } catch (error) {
        logger.error("Authentication initialization failed", error);
        toast({
          title: "Erro de autenticação",
          description:
            "Não foi possível verificar sua sessão. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      navigate("/");
    } catch (error) {
      logger.error("Sign out failed", error);
      toast({
        title: "Erro ao fazer logout",
        description:
          "Não foi possível desconectar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return { user, session, loading, signOut };
}
