"use client";

import { Eye, Layers, Lightbulb, Heart } from "lucide-react";

const steps = [
  {
    icon: Eye,
    title: "Evaluación Inicial",
    description:
      "Analizamos tu nivel actual, tu categoría y federación para diseñar un plan de trabajo personalizado.",
  },
  {
    icon: Layers,
    title: "Diseño de Poses",
    description:
      "Trabajamos las poses obligatorias adaptándolas a tu físico, resaltando tus puntos fuertes de forma natural.",
  },
  {
    icon: Lightbulb,
    title: "Transiciones y Rutina",
    description:
      "Creamos transiciones fluidas y diseñamos tu rutina individual con tu esencia y estilo personal.",
  },
  {
    icon: Heart,
    title: "Perfeccionamiento",
    description:
      "Pulimos cada detalle: seguridad, confianza, elegancia y presencia escénica para conquistar la tarima.",
  },
];

export default function Methodology() {
  return (
    <section id="metodologia" className="section bg-white">
      <div className="container-app">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
            Metodología
          </h2>
          <div className="divider" />
          <p className="font-body text-charcoal-lighter max-w-2xl mx-auto">
            Un enfoque personalizado y progresivo para que cada atleta desarrolle
            su máximo potencial en tarima
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-6 md:gap-10 mb-12 last:mb-0 group">
              {/* Step Number & Line */}
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full bg-blush-50 border-2 border-blush-200 flex items-center justify-center group-hover:bg-blush-100 group-hover:border-blush-300 transition-all duration-300 flex-shrink-0">
                  <step.icon size={20} className="text-blush-500" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-px h-full bg-blush-100 mt-3" />
                )}
              </div>

              {/* Content */}
              <div className="pb-8">
                <span className="text-[10px] tracking-[0.3em] uppercase font-body font-medium text-blush-400 mb-1 block">
                  Paso {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-heading text-xl md:text-2xl font-semibold text-charcoal mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed max-w-lg">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
