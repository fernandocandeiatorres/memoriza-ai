import { Brain, Zap, Settings } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark mb-4">
            Why Medical Students Love Memoriza.ai
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our AI-powered flashcard generator helps you study more efficiently and retain information longer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Zap className="text-primary text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-dark mb-2">Save Time</h3>
            <p className="text-gray-600">
              Generate comprehensive flashcards in seconds instead of spending hours creating them manually.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Brain className="text-primary text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-dark mb-2">Learn Faster</h3>
            <p className="text-gray-600">
              Our AI creates flashcards optimized for retention using proven learning science principles.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="text-primary text-xl" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-dark mb-2">Customizable</h3>
            <p className="text-gray-600">
              Edit generated flashcards or create your own to build the perfect study set for any medical topic.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
