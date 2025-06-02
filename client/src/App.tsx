import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Generator from "@/pages/Generator";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import FlashcardSetDetails from "@/pages/FlashcardSetDetails";
import { useEffect, useState, ComponentType } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";

function ProtectedRoute({
  component: Component,
  ...rest
}: {
  component: ComponentType<any>;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      } catch (error) {
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
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    const redirectTo = encodeURIComponent(location);
    return <Redirect to={`/login?redirectTo=${redirectTo}`} />;
  }

  return <Component {...rest} />;
}

function Router() {
  const [location] = useLocation();

  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/" component={Home} />
        <Route path="/generator">
          <ProtectedRoute component={Generator} />
        </Route>
        <Route path="/dashboard">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/dashboard/flashcard-set/:id">
          <ProtectedRoute component={FlashcardSetDetails} />
        </Route>
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
