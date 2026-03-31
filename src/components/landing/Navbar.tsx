"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#objetivos", label: "Objetivos" },
  { href: "#metodologia", label: "Metodología" },
  { href: "#planes", label: "Planes" },
  { href: "#tarifas", label: "Tarifas" },
  { href: "#feedbacks", label: "Feedbacks" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white border-b border-blush-100 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container-app flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center group">
          <span className="text-[10px] tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter group-hover:text-blush-500 transition-colors">
            Posing
          </span>
          <span className="text-2xl md:text-3xl font-heading font-bold tracking-wide text-charcoal leading-none">
            THE HEELS
          </span>
          <span className="text-[10px] font-script text-charcoal-lighter italic">
            Alejandra Sanchis
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs tracking-[0.15em] uppercase font-body font-medium text-charcoal-light
                         hover:text-blush-500 transition-colors duration-300
                         relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px]
                         after:bg-blush-300 after:transition-all after:duration-300 hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA Desktop */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/login" className="btn-ghost text-xs">
            Acceder
          </Link>
          <Link href="/registro" className="btn-primary text-xs">
            Reservar
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 text-charcoal hover:text-blush-500 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-0 bg-white z-40 transition-all duration-500 ${
          isOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <Link href="/" className="flex flex-col items-center mb-8" onClick={() => setIsOpen(false)}>
            <span className="text-xs tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter">
              Posing
            </span>
            <span className="text-4xl font-heading font-bold tracking-wide text-charcoal">
              THE HEELS
            </span>
            <span className="text-sm font-script text-charcoal-lighter italic">
              Alejandra Sanchis
            </span>
          </Link>

          {navLinks.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-sm tracking-[0.2em] uppercase font-body font-medium text-charcoal-light
                         hover:text-blush-500 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {link.label}
            </a>
          ))}

          <div className="flex flex-col gap-4 mt-8 w-64">
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="btn-secondary text-center text-xs"
            >
              Acceder
            </Link>
            <Link
              href="/registro"
              onClick={() => setIsOpen(false)}
              className="btn-primary text-center text-xs"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
