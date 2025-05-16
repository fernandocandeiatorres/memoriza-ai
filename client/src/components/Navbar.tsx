import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

export default function Navbar() {
  const [session, setSession] = useState<Session | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      navigate("/");
      setIsMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description:
          "Não foi possível desconectar. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratorClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      navigate("/login?redirectTo=/generator");
      setIsMobileMenuOpen(false);
    } else {
      setIsMobileMenuOpen(false);
    }
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center text-primary font-bold text-2xl">
              <Brain className="mr-2 h-6 w-6" />
              memoriza<span className="text-accent">.ai</span>
            </a>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">
                Home
              </a>
            </Link>
            <Link href="/generator" onClick={handleGeneratorClick}>
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">
                Generator
              </a>
            </Link>
            <Link href="/#features">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">
                Features
              </a>
            </Link>
            <Link href="/#testimonials">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">
                Testimonials
              </a>
            </Link>
            {session ? (
              <>
                <Link href="/dashboard">
                  <Button className="text-white hover:bg-primary/90 px-3 py-2 text-sm font-medium">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleLogout}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button className="text-white bg-primary/90 hover:bg-primary/80 px-3 py-2 font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-dark hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
              Home
            </a>
          </Link>
          <Link href="/generator" onClick={handleGeneratorClick}>
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
              Generator
            </a>
          </Link>
          <Link href="/#features" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
              Features
            </a>
          </Link>
          <Link href="/#testimonials" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
              Testimonials
            </a>
          </Link>
          {session ? (
            <div className="flex flex-col gap-2 items-end justify-between px-2 pt-2 pb-3 space-y-1 sm:px-3 w-full">
              <Link
                href="/dashboard"
                onClick={handleMobileLinkClick}
                className="w-full"
              >
                <Button className="w-full block text-neutral-dark hover:text-primary px-3 text-base font-medium">
                  Dashboard
                </Button>
              </Link>
              <Button
                className="w-1/6 bg-red-600 hover:bg-red-700 text-white mt-3"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2  px-2 pt-2 pb-3 space-y-1 sm:px-3 w-full">
              <Link href="/login" onClick={handleMobileLinkClick}>
                <Button className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register" onClick={handleMobileLinkClick}>
                <Button className=" bg-primary hover:bg-primary/90 text-white mt-3">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
