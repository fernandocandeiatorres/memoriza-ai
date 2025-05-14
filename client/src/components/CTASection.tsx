import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function CTASection() {
  const [, navigate] = useLocation();
  
  const goToGenerator = () => {
    navigate("/generator");
  };
  
  return (
    <section className="py-12 px-4">
      <div className="max-w-4xl mx-auto bg-primary rounded-xl shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800"
              alt="Medical student with laptop"
              className="h-64 w-full object-cover md:h-full"
            />
          </div>
          <div className="p-8 md:p-12 md:w-1/2">
            <div className="uppercase tracking-wide text-sm text-white font-semibold">Ready to excel?</div>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Start creating your medical flashcards today
            </h2>
            <p className="mt-3 text-white/80">
              Join thousands of medical students who are studying smarter, not harder.
            </p>
            <div className="mt-6">
              <Button 
                onClick={goToGenerator}
                className="bg-white text-primary hover:bg-neutral-light px-6 py-3 rounded-md text-base font-medium inline-block"
              >
                Try it for free
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
