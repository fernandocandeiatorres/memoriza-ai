import { useState } from "react";
import { Link } from "wouter";
import { Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">Home</a>
            </Link>
            <Link href="/generator">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">Generator</a>
            </Link>
            <Link href="/#features">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">Features</a>
            </Link>
            <Link href="/#testimonials">
              <a className="text-neutral-dark hover:text-primary px-3 py-2 text-sm font-medium">Testimonials</a>
            </Link>
            <Button className="bg-primary hover:bg-primary/90 text-white">Sign Up</Button>
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
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn("md:hidden", isMobileMenuOpen ? "block" : "hidden")}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link href="/">
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">Home</a>
          </Link>
          <Link href="/generator">
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">Generator</a>
          </Link>
          <Link href="/#features">
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">Features</a>
          </Link>
          <Link href="/#testimonials">
            <a className="block text-neutral-dark hover:text-primary px-3 py-2 text-base font-medium">Testimonials</a>
          </Link>
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mt-3">Sign Up</Button>
        </div>
      </div>
    </nav>
  );
}
