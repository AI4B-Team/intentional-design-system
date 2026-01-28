interface TeamMember {
  name: string;
  title: string;
  image_url?: string;
  bio?: string;
}

interface AboutSectionProps {
  headline: string;
  content?: string | null;
  imageUrl?: string | null;
  teamMembers?: TeamMember[];
  primaryColor: string;
}

export function AboutSection({ 
  headline, 
  content, 
  imageUrl, 
  teamMembers,
  primaryColor 
}: AboutSectionProps) {
  if (!content && (!teamMembers || teamMembers.length === 0)) return null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: primaryColor }}
        >
          {headline}
        </h2>

        {/* About Content */}
        {content && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16">
            {imageUrl && (
              <div className="order-2 lg:order-1">
                <img
                  src={imageUrl}
                  alt="About Us"
                  className="rounded-2xl shadow-lg w-full object-cover max-h-[400px]"
                />
              </div>
            )}
            <div className={`order-1 lg:order-2 ${!imageUrl ? 'lg:col-span-2 max-w-3xl mx-auto' : ''}`}>
              <div 
                className="prose prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
              />
            </div>
          </div>
        )}

        {/* Team Members */}
        {teamMembers && teamMembers.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-center mb-8 text-gray-900">
              Meet Our Team
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {teamMembers.map((member, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 text-center">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div 
                      className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <h4 className="font-bold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">{member.title}</p>
                  {member.bio && (
                    <p className="text-sm text-gray-600">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
