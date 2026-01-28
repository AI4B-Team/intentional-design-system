import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, X, Sparkles, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { DispoPhoto } from '@/hooks/usePublicDeal';

interface DealHeroGalleryProps {
  photos: DispoPhoto[];
  videoUrl: string | null;
  status: string | null;
  createdAt: string | null;
}

export function DealHeroGallery({ photos, videoUrl, status, createdAt }: DealHeroGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.is_primary) return -1;
    if (b.is_primary) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  const primaryPhoto = sortedPhotos[0];
  const thumbnails = sortedPhotos.slice(0, 5);

  const isNewListing = createdAt && 
    (Date.now() - new Date(createdAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  const goToPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? sortedPhotos.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === sortedPhotos.length - 1 ? 0 : prev + 1));
  };

  if (!photos.length) {
    return (
      <div className="w-full h-64 md:h-96 bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No photos available</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full">
        {/* Main Hero Image */}
        <div 
          className="relative w-full h-64 md:h-[500px] cursor-pointer group"
          onClick={() => setLightboxOpen(true)}
        >
          <img 
            src={primaryPhoto?.url || '/placeholder.svg'}
            alt="Property"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

          {/* Status Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {status === 'under_contract' && (
              <Badge className="bg-amber-500 text-white border-0 text-sm py-1">
                UNDER CONTRACT
              </Badge>
            )}
            {isNewListing && status === 'active' && (
              <Badge className="bg-red-500 text-white border-0 text-sm py-1">
                <Sparkles className="h-3 w-3 mr-1" />
                HOT DEAL
              </Badge>
            )}
          </div>

          {/* Video Play Button */}
          {videoUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setVideoOpen(true);
              }}
              className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 hover:bg-black/80 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Watch Video
            </button>
          )}

          {/* Photo Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
            1 of {sortedPhotos.length}
          </div>

          {/* Hover Indicator */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              Click to view gallery
            </span>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {thumbnails.length > 1 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {thumbnails.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setLightboxOpen(true);
                  }}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === 0 ? 'border-primary' : 'border-transparent hover:border-primary/50'
                  }`}
                >
                  <img 
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
              {sortedPhotos.length > 5 && (
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="flex-shrink-0 w-20 h-20 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  +{sortedPhotos.length - 5} more
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black border-0">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main Image */}
            <div className="relative">
              <img 
                src={sortedPhotos[currentIndex]?.url}
                alt={sortedPhotos[currentIndex]?.caption || 'Property photo'}
                className="w-full max-h-[80vh] object-contain"
              />

              {/* Navigation */}
              <button
                onClick={goToPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Counter & Caption */}
            <div className="p-4 bg-black text-white text-center">
              <p className="text-sm text-gray-400">
                {currentIndex + 1} of {sortedPhotos.length}
              </p>
              {sortedPhotos[currentIndex]?.caption && (
                <p className="mt-1">{sortedPhotos[currentIndex].caption}</p>
              )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-2 p-4 overflow-x-auto bg-black">
              {sortedPhotos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={photo.url}
                    alt={photo.caption || `Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <div className="relative aspect-video">
            <button
              onClick={() => setVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {videoUrl && (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
}
