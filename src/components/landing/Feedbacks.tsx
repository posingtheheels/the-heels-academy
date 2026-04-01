"use client";

import { useState, useEffect, useRef } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

export default function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchFeedbacks() {
      try {
        const res = await fetch("/api/feedbacks");
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a: any, b: any) => {
            // Extract number from "Testimonio X" if present
            const getNum = (str: string) => {
              const match = str.match(/Testimonio\s*(\d+)/i);
              return match ? parseInt(match[1]) : Infinity;
            };
            const numA = getNum(a.message);
            const numB = getNum(b.message);
            
            if (numA !== numB) return numA - numB;
            return a.id.localeCompare(b.id);
          });
          setFeedbacks(sorted);
        }
      } catch (err) {
        console.error("Error fetching feedbacks:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeedbacks();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (!loading && feedbacks.length === 0) return null;

  return (
    <section id="feedbacks" className="section bg-white overflow-hidden py-16 relative">
      <div className="container-app relative z-10">
        {/* Section Header - Compact */}
        <div className="text-center mb-10 px-4">
          <h2 className="font-heading text-4xl text-charcoal font-light italic">
            Experiencias
          </h2>
          <div className="divider mx-auto w-16 h-px bg-blush-200 mt-3" />
        </div>

        {/* Carousel UI - More Compact Container */}
        <div className="relative group max-w-4xl mx-auto">
          {/* Custom Arrows - Subtle */}
          <div className="hidden md:flex absolute -inset-x-12 top-1/2 -translate-y-1/2 items-center justify-between pointer-events-none z-30">
            <button 
              onClick={() => scroll("left")}
              className="p-2.5 rounded-full bg-white/90 shadow-elegant text-charcoal-lighter hover:text-blush-600 hover:scale-105 transition-all pointer-events-auto active:scale-95 border border-blush-50"
            >
              <ChevronLeft size={22} />
            </button>
            <button 
              onClick={() => scroll("right")}
              className="p-2.5 rounded-full bg-white/90 shadow-elegant text-charcoal-lighter hover:text-blush-600 hover:scale-105 transition-all pointer-events-auto active:scale-95 border border-blush-50"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          {/* Swipeable Viewport */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-6 no-scrollbar px-2 -mx-2 pb-6 scroll-smooth"
          >
            {loading ? (
              [1, 2].map((i) => (
                <div key={i} className="min-w-full lg:min-w-[800px] h-[450px] bg-blush-50/20 animate-pulse rounded-[2.5rem]" />
              ))
            ) : (
              feedbacks.map((fb) => (
                <div 
                  key={fb.id}
                  className="min-w-full lg:min-w-[850px] snap-center px-2"
                >
                  <div className="bg-white rounded-[2.5rem] shadow-elegant overflow-hidden flex flex-col md:flex-row h-full md:h-[480px] border border-blush-50/50 ring-1 ring-blush-100/10">
                    
                    {/* Compact Image Section (60%) */}
                    <div className="w-full md:w-[60%] h-[350px] md:h-full relative bg-blush-50/10 p-3 md:p-6 flex items-center justify-center overflow-hidden">
                      {fb.imageUrl ? (
                        <>
                           <img 
                            src={fb.imageUrl} 
                            alt="" 
                            className="absolute inset-0 w-full h-full object-cover opacity-5 blur-xl pointer-events-none shadow-inner"
                          />
                           <img 
                            src={fb.imageUrl} 
                            alt={fb.name} 
                            className="relative z-10 max-h-full max-w-full object-contain rounded-xl shadow-lg"
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-blush-100">
                          <Quote size={60} fill="currentColor" className="opacity-10 mb-2" />
                          <span className="font-heading italic text-sm">The Heels Academy</span>
                        </div>
                      )}
                    </div>

                    {/* Centered Info Section (40%) */}
                    <div className="w-full md:w-[40%] py-8 px-8 md:px-10 flex flex-col justify-center items-center text-center bg-white border-t md:border-t-0 md:border-l border-blush-50/30">
                      
                      {/* Rating - Centered */}
                      <div className="flex gap-0.5 text-yellow-400 mb-6">
                        {[...Array(fb.rating)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>

                      {/* Testimonial - Centered */}
                      <div className="mb-8 relative max-w-[280px]">
                         <Quote size={20} className="text-blush-100/60 mx-auto mb-3" fill="currentColor" />
                         <p className="text-charcoal-light text-sm italic leading-relaxed font-body">
                          {fb.message}
                        </p>
                      </div>

                      {/* Footer Info - Centered */}
                      <div className="pt-6 border-t border-blush-50/50 w-full max-w-[200px]">
                          <h4 className="font-heading text-lg font-bold text-charcoal leading-none mb-2">
                            {fb.name || "Alumna Anónima"}
                          </h4>
                          <p className="text-[9px] uppercase tracking-[0.2em] text-blush-500 font-bold whitespace-nowrap">
                            {fb.role || "Alumna Exclusiva"}
                          </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Swipe Indicators */}
        <div className="flex justify-center gap-1.5 mt-2 overflow-hidden px-10">
           {feedbacks.slice(0, 10).map((_, index) => (
             <div key={index} className="w-1 h-1 rounded-full bg-blush-200 opacity-40 shrink-0" />
           ))}
        </div>
      </div>
      
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
