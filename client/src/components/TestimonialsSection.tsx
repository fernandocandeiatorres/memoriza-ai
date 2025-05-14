import { Star, StarHalf } from "lucide-react";

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-dark mb-4">
            What Medical Students Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of medical students who are acing their exams with Memoriza.ai
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-primary flex">
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "Memoriza.ai helped me prepare for my cardiology exam in half the time. The flashcards covered all the high-yield topics and were extremely accurate."
            </p>
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium text-neutral-dark">Dr. Sarah Chen</p>
                <p className="text-gray-500">Yale School of Medicine</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-primary flex">
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "I was struggling with pharmacology until I found this tool. The AI generates perfect questions that test my understanding, not just my memorization skills."
            </p>
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium text-neutral-dark">James Wilson</p>
                <p className="text-gray-500">Third-year Medical Student</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="text-primary flex">
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <Star className="fill-current" />
                <StarHalf className="fill-current" />
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "As a visual learner, I appreciate how the flashcards are structured. The information is presented clearly, and I can customize them to fit my learning style."
            </p>
            <div className="flex items-center">
              <div className="text-sm">
                <p className="font-medium text-neutral-dark">Dr. Maya Patel</p>
                <p className="text-gray-500">Johns Hopkins Medicine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
