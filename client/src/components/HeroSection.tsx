import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function HeroSection() {
  const [, navigate] = useLocation();
  
  const goToGenerator = () => {
    navigate("/generator");
  };

  return (
    <section id="landing" className="py-12 md:py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark mb-4">
              Medical Flashcards <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Generate custom flashcards for medical school topics in seconds. Memorize smarter, not harder.
            </p>
            <div className="mb-8">
              <Button 
                onClick={goToGenerator}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md text-base font-medium mr-4"
              >
                Try it Now
              </Button>
              <Button variant="outline" className="bg-white border border-gray-300 hover:bg-gray-50 text-neutral-dark">
                Learn More
              </Button>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="flex items-center mr-4">
                <CheckCircle className="text-success mr-2 h-4 w-4" /> No sign-up required
              </span>
              <span className="flex items-center">
                <CheckCircle className="text-success mr-2 h-4 w-4" /> 100% free
              </span>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800" 
              alt="Medical student studying" 
              className="w-full rounded-lg shadow-lg" 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
