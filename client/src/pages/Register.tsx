import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { useLocation } from "wouter";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [location] = useLocation();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, session);

      if (event === "SIGNED_IN" && session) {
        toast({
          title: "Conta criada com sucesso!",
          description: "Bem-vindo ao memoriza.ai!",
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
          <p className="mt-2 text-gray-600">Crie uma conta para continuar</p>
        </div>
        <Auth
          supabaseClient={supabase}
          view="sign_up"
          appearance={{ theme: ThemeSupa }}
          providers={["google", "github"]}
          theme="light"
          showLinks={false}
          localization={{
            variables: {
              sign_up: {
                email_label: "Email",
                password_label: "Senha",
                button_label: "Criar conta",
                loading_button_label: "Criando conta...",
                link_text: "Já tem uma conta? Faça login",
              },
            },
          }}
          redirectTo={`${window.location.origin}/`}
        />
      </div>
    </div>
  );
}
