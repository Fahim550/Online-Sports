"use client";

import { Button } from "@/components/ui/button";
import { useSliderSlides } from "@/hooks/useShopData";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

export function HeroSlider() {
  const {
    data: slides = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSliderSlides();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isStuck, setIsStuck] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  useEffect(() => {
    if (!(isLoading || isFetching)) {
      setIsStuck(false);
      return;
    }
    const t = window.setTimeout(() => setIsStuck(true), 10000);
    return () => window.clearTimeout(t);
  }, [isLoading, isFetching]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide, slides.length]);

  if (isError) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[240px] sm:h-[380px] md:h-[520px] lg:h-[600px] w-full rounded-none">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
          <p className="text-muted-foreground font-medium">
            Couldn't load the slider.{" "}
            {error instanceof Error ? error.message : ""}
          </p>
          <Button className="btn-accent" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </section>
    );
  }

  if (isLoading || isFetching) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[240px] sm:h-[380px] md:h-[520px] lg:h-[600px] w-full rounded-none">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent" />
          {isStuck && (
            <Button className="btn-accent" onClick={() => refetch()}>
              Loading too long — Retry
            </Button>
          )}
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative overflow-hidden bg-secondary h-[240px] sm:h-[380px] md:h-[520px] lg:h-[600px] w-full rounded-none">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground font-semibold">No slides configured</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full p-3 md:px-0 md:pt-0 md:pb-6">
      {/* Slider Container */}
      <div 
        className="relative overflow-hidden group w-full rounded-xl md:rounded-none h-[240px] sm:h-[380px] md:h-[520px] lg:h-[600px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const hasHeading = Boolean(slide.heading && slide.heading.trim());
          const hasText = Boolean(slide.text && slide.text.trim());
          const hasContent = hasHeading || hasText;
          const ctaTarget = slide.cta_link && slide.cta_link.trim() ? slide.cta_link.trim() : "/shop";

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
            >
              {/* If image only slide (without heading/text), render clean clickable banner image */}
              {!hasContent ? (
                <Link href={ctaTarget} className="block w-full h-full relative cursor-pointer">
                  <Image
                    src={slide.image}
                    alt={slide.heading || "Hero Banner"}
                    fill
                    priority={index === 0}
                    className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${isActive ? "scale-100" : "scale-105"
                      }`}
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />
                </Link>
              ) : (
                <>
                  {/* Left Vignette Overlay for Text Readability */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent z-10 pointer-events-none" />

                  {/* Background Image with Ken Burns animation */}
                  <Image
                    src={slide.image}
                    alt={slide.heading || "Hero Banner"}
                    fill
                    priority={index === 0}
                    className={`w-full h-full object-cover transition-transform duration-[8000ms] ease-out ${isActive ? "scale-100" : "scale-105"
                      }`}
                    sizes="(max-width: 768px) 100vw, 90vw"
                  />

                  {/* Slide Content Layer */}
                  <div className="absolute inset-0 z-20 flex items-center">
                    <div className="container-shop w-full px-6 md:px-12 lg:px-16">
                      <div className="max-w-xl md:max-w-2xl text-white flex flex-col gap-3 md:gap-5">
                        {hasHeading && (
                          <h1
                            className={`text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight transition-all duration-700 delay-400 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                              }`}
                          >
                            {slide.heading}
                          </h1>
                        )}
                        {hasText && (
                          <p
                            className={`text-xs sm:text-sm md:text-lg text-white/80 line-clamp-2 md:line-clamp-none transition-all duration-700 delay-600 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                              }`}
                          >
                            {slide.text}
                          </p>
                        )}
                        {slide.cta_text && (
                          <div
                            className={`pt-1 md:pt-2 transition-all duration-700 delay-800 transform ${isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                              }`}
                          >
                            <Link href={ctaTarget}>
                              <Button className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-1.5 md:px-8 md:py-5 font-bold text-[11px] md:text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-accent/20 active:scale-95 duration-300 cursor-pointer">
                                {slide.cta_text}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Navigation Arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 text-white backdrop-blur-sm flex items-center justify-center transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-y-0 -translate-x-1/2 z-30 flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${index === currentSlide
                  ? "w-8 bg-accent"
                  : "w-3 bg-white/50 hover:bg-white/80"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
