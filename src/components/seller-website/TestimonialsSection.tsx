import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  location?: string;
  quote: string;
  image_url?: string;
  rating?: number;
  sale_price?: string;
  situation?: string;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  primaryColor: string;
  accentColor: string;
  headline?: string;
  subheadline?: string;
  tagline?: string;
}

export function TestimonialsSection({ testimonials, primaryColor, accentColor, headline, subheadline, tagline }: TestimonialsSectionProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3">
          {headline || "Real Stories From Real Sellers"}
        </h2>
        {(tagline) && (
          <p className="text-center mb-2" style={{ color: accentColor }}>
            <em>{tagline}</em>
          </p>
        )}
        <p className="text-gray-500 text-center mb-10">
          {subheadline || "Don't Take Our Word For It — Take Theirs"}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => {
            const initials = testimonial.name
              .split(" ")
              .map((n) => n.charAt(0))
              .join("")
              .slice(0, 3);

            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col justify-between"
              >
                {/* Stars */}
                <div>
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center gap-3">
                    {testimonial.image_url ? (
                      <img
                        src={testimonial.image_url}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: accentColor }}
                      >
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{testimonial.name}</div>
                      <div className="text-xs text-gray-500">
                        {testimonial.location}
                        {testimonial.situation && ` · ${testimonial.situation}`}
                      </div>
                    </div>
                  </div>
                  {testimonial.sale_price && (
                    <div className="text-right">
                      <div className="font-bold text-sm text-gray-900">{testimonial.sale_price}</div>
                      <div className="text-xs text-gray-400">Sale price</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
