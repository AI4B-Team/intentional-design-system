import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Testimonial {
  name: string;
  location?: string;
  quote: string;
  image_url?: string;
  rating?: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  primaryColor: string;
  accentColor: string;
}

export function TestimonialsSection({ testimonials, primaryColor, accentColor }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (!testimonials || testimonials.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: primaryColor }}
        >
          What Our Sellers Say
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative">
            {/* Quote Icon */}
            <div 
              className="absolute -top-4 left-8 w-8 h-8 rounded-full flex items-center justify-center text-white text-2xl"
              style={{ backgroundColor: accentColor }}
            >
              "
            </div>

            {/* Rating */}
            <div className="flex justify-center mb-4">
              {Array.from({ length: currentTestimonial.rating || 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className="h-5 w-5 fill-yellow-400 text-yellow-400" 
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-lg md:text-xl text-gray-700 text-center mb-6 italic">
              "{currentTestimonial.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-3">
              {currentTestimonial.image_url ? (
                <img
                  src={currentTestimonial.image_url}
                  alt={currentTestimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  {currentTestimonial.name.charAt(0)}
                </div>
              )}
              <div className="text-left">
                <div className="font-semibold text-gray-900">
                  {currentTestimonial.name}
                </div>
                {currentTestimonial.location && (
                  <div className="text-sm text-gray-500">
                    {currentTestimonial.location}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={handlePrevious}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>

          {/* Dots Navigation */}
          {testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    backgroundColor: index === currentIndex ? primaryColor : '#d1d5db',
                    transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
