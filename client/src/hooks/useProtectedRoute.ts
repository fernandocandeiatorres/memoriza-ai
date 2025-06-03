import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export function useProtectedRoute(redirectTo?: string) {
  const { user, session, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !session) {
      const currentPath = location;
      const redirect =
        redirectTo || `/login?redirectTo=${encodeURIComponent(currentPath)}`;
      navigate(redirect);
    }
  }, [loading, session, location, navigate, redirectTo]);

  return { user, session, loading };
}
