import { useState } from "react";
import { Link } from "wouter";
import { Brain, User, Menu, X, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCredits } from "@/hooks/useCredits";

export default function Navbar() {
  const { session, signOut } = useAuth();
  const { credits, loading: creditsLoading } = useCredits();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleGeneratorClick = (e: React.MouseEvent) => {
    if (!session) {
      e.preventDefault();
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirectTo=${encodeURIComponent(
        currentPath
      )}`;
    }
    setIsMobileMenuOpen(false);
  };

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow px-3 sm:px-4 lg:px-6 xl:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center text-primary font-bold text-xl sm:text-2xl transition-all duration-300 hover:scale-105 hover:bg-primary/10 rounded-lg px-2 sm:px-3 py-2 group">
              <Brain className="mr-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-12" />
              <span className="hidden sm:inline">memoriza</span>
              <span className="sm:hidden">memoriza</span>
              <span className="text-accent">.ai</span>
            </a>
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden lg:block">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Home
              </a>
            </Link>
            <Link href="/generator" onClick={handleGeneratorClick}>
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Gerador por Tópico
              </a>
            </Link>
            <Link href="/summary-generator" onClick={handleGeneratorClick}>
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Gerador por Resumo
              </a>
            </Link>
            <Link href="/#features">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Features
              </a>
            </Link>
            <Link href="/#testimonials">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium transition-colors">
                Testimonials
              </a>
            </Link>

            {/* Credits display for logged in users */}
            {session && (
              <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {creditsLoading ? "..." : credits} créditos
                </span>
              </div>
            )}

            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <a className="cursor-pointer">Dashboard</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600"
                    onClick={handleLogout}
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-primary border-primary hover:bg-primary/10"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center">
          {/* Credits display for mobile */}
          {session && (
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200 ">
              <Coins className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {creditsLoading ? "..." : credits} Créditos
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-dark hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen
            ? "max-h-96 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-100">
          <Link href="/" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
              Home
            </a>
          </Link>
          <Link href="/generator" onClick={handleGeneratorClick}>
            <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
              Gerador por Tópico
            </a>
          </Link>
          <Link href="/summary-generator" onClick={handleGeneratorClick}>
            <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
              Gerador por Resumo
            </a>
          </Link>
          <Link href="/#features" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
              Features
            </a>
          </Link>
          <Link href="/#testimonials" onClick={handleMobileLinkClick}>
            <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
              Testimonials
            </a>
          </Link>

          <div className="border-t border-gray-200 pt-3 mt-3">
            {session ? (
              <>
                <Link href="/dashboard" onClick={handleMobileLinkClick}>
                  <a className="block text-neutral-dark hover:text-primary hover:bg-primary/5 px-3 py-2 text-base font-medium rounded-md transition-colors">
                    Dashboard
                  </a>
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 text-base font-medium rounded-md transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={handleMobileLinkClick}>
                  <Button
                    variant="outline"
                    className="w-full text-primary border-primary hover:bg-primary/10"
                  >
                    Entrar
                  </Button>
                </Link>
                <Link href="/register" onClick={handleMobileLinkClick}>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                    Registrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
