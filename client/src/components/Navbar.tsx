import { useState } from "react";
import { Link } from "wouter";
import { Brain, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { session, signOut } = useAuth();
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
    <nav className="bg-white shadow px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center ">
          <Link href="/">
            <a className="flex items-center text-primary font-bold text-2xl transition-all duration-300 hover:scale-105 hover:bg-primary/10 rounded-lg px-3 py-2 group">
              <Brain className="mr-2 h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
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
                Gerador por Tópico
              </a>
            </Link>
            <Link href="/summary-generator" onClick={handleGeneratorClick}>
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">
                Gerador por Resumo
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
              Gerador por Tópico
            </a>
          </Link>
          <Link href="/summary-generator" onClick={handleGeneratorClick}>
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
              Gerador por Resumo
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
            <>
              <Link href="/dashboard" onClick={handleMobileLinkClick}>
                <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">
                  Dashboard
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 text-base font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={handleMobileLinkClick}>
                <a className="block text-primary hover:text-primary/80 px-3 py-2 text-base font-medium">
                  Sign In
                </a>
              </Link>
              <Link href="/register" onClick={handleMobileLinkClick}>
                <a className="block text-primary hover:text-primary/80 px-3 py-2 text-base font-medium">
                  Sign Up
                </a>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
