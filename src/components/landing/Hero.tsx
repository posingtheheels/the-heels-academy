"use client";

import Link from "next/link";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-gradient-soft overflow-hidden"
    >
      {/* Decorative blush circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blush-100/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blush-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blush-50/50 rounded-full blur-3xl" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* Pre-title */}
        <p className="animate-fade-in text-xs tracking-[0.4em] uppercase font-body font-medium text-charcoal-lighter mb-6">
          Posing
        </p>

        {/* Main Title */}
        <h1 className="animate-fade-in-up font-heading font-bold text-6xl md:text-7xl lg:text-8xl xl:text-9xl text-charcoal tracking-wide leading-[0.9]">
          THE
          <br />
          HEELS
        </h1>

        {/* Subtitle Script */}
        <p className="animate-fade-in-up delay-200 font-script text-xl md:text-2xl text-charcoal-lighter mt-4">
          Alejandra Sanchis
        </p>

        {/* Divider */}
        <div className="divider animate-fade-in delay-300" />

        {/* Tagline */}
        <p className="animate-fade-in-up delay-300 font-heading text-lg md:text-xl lg:text-2xl text-charcoal-light font-light italic max-w-2xl mx-auto leading-relaxed">
          Culturismo es el arte de esculpir tu cuerpo.
          <br />
          Posing es el arte de mostrar tu trabajo
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up delay-400 flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <a href="#planes" className="btn-primary">
            Ver planes
          </a>
          <Link href="/registro" className="btn-secondary">
            Reservar ahora
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <a
          href="#objetivos"
          className="flex flex-col items-center gap-2 text-charcoal-lighter hover:text-blush-500 transition-colors"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase font-body">
            Descubre más
          </span>
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}
