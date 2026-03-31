"use client";

import { Target, Repeat, Sparkles } from "lucide-react";

const objectives = [
  {
    title: "Poses Obligatorias",
    icon: Target,
    items: [
      "Realizar las poses acorde a los requisitos de la federación",
      "Perfeccionar la pose a tu físico para mostrar tu mejor versión en función de tus puntos fuertes",
      "Conseguir seguridad, firmeza y determinación al clavar cada pose",
    ],
  },
  {
    title: "Comparativas",
    icon: Repeat,
    items: [
      "Diseñar diferentes transiciones en función de los movimientos de las comparativas",
      "Diseñar caminatas necesarias para el día de la competición",
      "Practicar la improvisación para posibles y comunes imprevistos en tarima",
      "Conocer a la perfección el procedimiento de comparativas",
    ],
  },
  {
    title: "Rutina Individual",
    icon: Sparkles,
    items: [
      "Elaborar una rutina que se ajuste a tu categoría y federación",
      "Diseñar tu rutina individual para mostrar tu mejor físico acorde con tus gustos y esencia",
      "Seguridad y confianza",
      "Elegancia y fluidez",
      "Conseguir cautivar a los jueces y al público",
    ],
  },
];

export default function Objectives() {
  return (
    <section id="objetivos" className="section bg-blush-50/30">
      <div className="container-app">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
            Objetivos
          </h2>
          <div className="divider" />
          <p className="font-body text-charcoal-lighter max-w-2xl mx-auto text-base leading-relaxed">
            Juntas trabajaremos para que pises la tarima con seguridad y
            confianza dándole tu toque personal a cada movimiento.
            <br />
            Las clases se enfocarán en:
          </p>
        </div>

        {/* Objective Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {objectives.map((obj, index) => (
            <div
              key={obj.title}
              className="card-flat group hover:bg-white hover:shadow-elegant transition-all duration-500"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center mb-6 group-hover:bg-blush-200 transition-colors duration-300">
                <obj.icon
                  size={20}
                  className="text-blush-600 group-hover:text-blush-700 transition-colors"
                />
              </div>

              {/* Title */}
              <h3 className="font-heading text-xl md:text-2xl font-semibold text-charcoal mb-5 tracking-wide uppercase">
                {obj.title}
              </h3>

              {/* Items */}
              <ul className="space-y-3">
                {obj.items.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-charcoal-light leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blush-300 mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
