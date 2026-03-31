"use client";

import Link from "next/link";
import { Instagram, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-white/80">
      <div className="container-app py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="flex flex-col items-start">
            <div className="flex flex-col mb-4">
              <span className="text-[9px] tracking-[0.35em] uppercase font-body font-medium text-white/40">
                Posing
              </span>
              <span className="text-2xl font-heading font-bold tracking-wide text-white leading-none">
                THE HEELS
              </span>
              <span className="text-[10px] font-script text-white/40 italic">
                Alejandra Sanchis
              </span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Culturismo es el arte de esculpir tu cuerpo. Posing es el arte de
              mostrar tu trabajo.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-body font-medium text-white/60 mb-6">
              Enlaces
            </h4>
            <ul className="space-y-3">
              {[
                { href: "#objetivos", label: "Objetivos" },
                { href: "#metodologia", label: "Metodología" },
                { href: "#planes", label: "Planes" },
                { href: "#tarifas", label: "Tarifas" },
                { href: "#feedbacks", label: "Feedbacks" },
                { href: "#contacto", label: "Contacto" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-blush-300 transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-body font-medium text-white/60 mb-6">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/posing_theheels"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blush-300/20 hover:border-blush-300/30 transition-all duration-300"
              >
                <Instagram size={16} className="text-white/60" />
              </a>
              <a
                href="mailto:posingtheheels@gmail.com"
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blush-300/20 hover:border-blush-300/30 transition-all duration-300"
              >
                <Mail size={16} className="text-white/60" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {currentYear} The Heels — Posing Academy. Todos los derechos reservados.
          </p>
          <p className="text-xs text-white/30 flex items-center gap-1">
            Hecho con <Heart size={10} className="text-blush-300" /> por Alejandra Sanchis
          </p>
        </div>
      </div>
    </footer>
  );
}
