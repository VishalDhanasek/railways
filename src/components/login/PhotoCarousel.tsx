import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trainPhotos } from '@/data/trainPhotos';

const INTERVAL_MS = 5000;

/**
 * Full-bleed, auto-advancing photo carousel for the login brand panel.
 * Fills its positioned parent (`absolute inset-0`) — the parent overlays
 * its own logo/heading content in the top/bottom gradient fades.
 */
export default function PhotoCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setIndex((i) => (i + 1) % trainPhotos.length), []);
  const prev = () => setIndex((i) => (i - 1 + trainPhotos.length) % trainPhotos.length);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, INTERVAL_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <div
      className="group absolute inset-0 overflow-hidden bg-brand-950"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {trainPhotos.map((photo, i) => (
        <img
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-in-out ${
            i === index ? `opacity-100 ${paused ? '' : 'animate-ken-burns'}` : 'opacity-0'
          }`}
        />
      ))}

      {/* Top + bottom vignette so the overlaid logo and heading stay legible */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-950/85 via-transparent to-brand-950/90" />

      {/* Manual navigation */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/50 group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Dot indicators */}
      <div className="absolute right-4 top-4 z-10 flex gap-1.5">
        {trainPhotos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show photo ${i + 1} of ${trainPhotos.length}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  );
}
