import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, MapPin, X } from "lucide-react";
import { type CrowdLevel, type DestinationPhoto } from "@/data/destinations";

type DestinationPhotoGalleryProps = {
  destinationName: string;
  destinationArea: string;
  destinationType: string;
  photos: DestinationPhoto[];
};

type PhotoInsightState = {
  loading: boolean;
  text: string | null;
  error: string | null;
};

const crowdBadgeClass: Record<CrowdLevel, string> = {
  Quiet: "bg-secondary text-foreground",
  Moderate: "bg-accent text-foreground",
  Busy: "bg-primary/15 text-foreground",
};

const DestinationPhotoGallery = ({
  destinationName,
  destinationArea,
  destinationType,
  photos,
}: DestinationPhotoGalleryProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [insightsByPhoto, setInsightsByPhoto] = useState<Record<string, PhotoInsightState>>({});

  const activePhoto = activeIndex !== null ? photos[activeIndex] : null;

  const closeLightbox = useCallback(() => {
    setActiveIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current - 1 + photos.length) % photos.length;
    });
  }, [photos.length]);

  const goToNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return (current + 1) % photos.length;
    });
  }, [photos.length]);

  useEffect(() => {
    if (!activePhoto) return;

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      setInsightsByPhoto((current) => ({
        ...current,
        [activePhoto.id]: {
          loading: false,
          text: null,
          error: "AI description unavailable. Add VITE_ANTHROPIC_API_KEY to enable it.",
        },
      }));
      return;
    }

    const controller = new AbortController();

    setInsightsByPhoto((current) => ({
      ...current,
      [activePhoto.id]: { loading: true, text: null, error: null },
    }));

    const prompt =
      `You are a Nepal travel guide. A traveler opened a photo from ${destinationName} in ${destinationArea}. ` +
      `Specific spot: ${activePhoto.locationName}. Destination type: ${destinationType}. ` +
      `Current crowd level at this spot: ${activePhoto.crowd}. Best viewpoint time: ${activePhoto.bestViewTime}. ` +
      "Respond in 2-3 concise sentences that clearly cover: (1) what makes this exact spot special, " +
      "(2) what the traveler will experience standing here, and (3) one insider tip for visiting this viewpoint.";

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 180,
        messages: [{ role: "user", content: prompt }],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const text = data?.content?.[0]?.text?.trim();
        setInsightsByPhoto((current) => ({
          ...current,
          [activePhoto.id]: {
            loading: false,
            text: text && text.length > 0 ? text : "No AI description available for this spot right now.",
            error: null,
          },
        }));
      })
      .catch((error: Error) => {
        if (error.name === "AbortError") return;

        setInsightsByPhoto((current) => ({
          ...current,
          [activePhoto.id]: {
            loading: false,
            text: null,
            error: "Could not fetch AI description for this photo.",
          },
        }));
      });

    return () => controller.abort();
  }, [activePhoto, destinationArea, destinationName, destinationType]);

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, closeLightbox, goToNext, goToPrevious]);

  const activeInsight = activePhoto ? insightsByPhoto[activePhoto.id] : null;

  return (
    <>
      <div className="mt-4 max-h-[560px] overflow-y-auto pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative block overflow-hidden rounded-xl border border-border bg-card"
            >
              <img
                src={photo.src}
                alt={`${photo.locationName} photo`}
                className="h-44 md:h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm transition-all duration-200 group-hover:border-white/45 group-hover:bg-black/70 group-hover:text-white">
                <MapPin className="h-3.5 w-3.5" />
                <span className="leading-none">{photo.locationName}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {activePhoto && (
        <div
          className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm p-4 md:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeLightbox();
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-label={`${activePhoto.locationName} photo viewer`}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-[95] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[95] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[95] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white hover:bg-black/70 transition-colors"
            aria-label="Next photo"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mx-auto h-full max-w-7xl grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 md:gap-6">
            <div className="rounded-2xl overflow-hidden border border-white/20 bg-black/30 min-h-[280px] lg:min-h-0 flex items-center justify-center">
              <img
                src={activePhoto.src}
                alt={activePhoto.locationName}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <aside className="rounded-2xl border border-border bg-card p-4 md:p-5 overflow-y-auto">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Location</p>
              <h3 className="mt-1 text-xl font-display font-bold leading-tight">{activePhoto.locationName}</h3>

              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">AI Description</p>
                  {activeInsight?.loading ? (
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      <span>Generating AI description...</span>
                    </div>
                  ) : activeInsight?.error ? (
                    <p className="mt-2 text-xs text-destructive/80 leading-relaxed">{activeInsight.error}</p>
                  ) : (
                    <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                      {activeInsight?.text ?? "Generating description..."}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Best Time</p>
                  <p className="mt-1 font-medium text-foreground/85">{activePhoto.bestViewTime}</p>
                </div>

                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Crowd Level</p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${crowdBadgeClass[activePhoto.crowd]}`}
                  >
                    {activePhoto.crowd}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
};

export default DestinationPhotoGallery;
