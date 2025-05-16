import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });

        // Get the redirect URL from the URL parameters or default to home
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get("redirectTo") || "/";
        navigate(redirectTo);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Bem-vindo</h2>
          <p className="mt-2 text-gray-600">Faça login para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={["google", "github"]}
          theme="light"
          localization={{
            variables: {
              sign_in: {
                email_label: "Email",
                password_label: "Senha",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
