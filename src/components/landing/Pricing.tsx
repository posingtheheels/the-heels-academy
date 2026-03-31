"use client";

import Link from "next/link";
import { Check, Wifi, MapPin } from "lucide-react";

const pricingPlans = [
  {
    name: "Clase Individual",
    modality: "Online",
    duration: "30 min",
    price: 20,
    type: "ONLINE" as const,
    features: [
      "1 clase por videollamada",
      "Trabajo de poses, comparativas o rutina",
      "Dudas y repaso incluidos",
    ],
    popular: false,
  },
  {
    name: "Bono 5 Clases",
    modality: "Online",
    duration: "2,5h",
    price: 75,
    type: "ONLINE" as const,
    features: [
      "5 clases por videollamada",
      "Evaluación inicial del nivel",
      "Revisión entre clases vía WhatsApp",
    ],
    popular: false,
  },
  {
    name: "Bono 10 Clases",
    modality: "Online",
    duration: "5h",
    price: 140,
    type: "ONLINE" as const,
    features: [
      "10 clases por videollamada",
      "Evaluación inicial del nivel",
      "Revisión entre clases vía WhatsApp",
      "Contacto 24h para dudas",
    ],
    popular: true,
  },
  {
    name: "Clase Individual",
    modality: "Presencial",
    duration: "1h",
    price: 35,
    type: "PRESENCIAL" as const,
    features: [
      "1 clase presencial",
      "Trabajo de poses, comparativas o rutina",
      "Correcciones en tiempo real",
    ],
    popular: false,
  },
  {
    name: "Bono 5 Clases",
    modality: "Presencial",
    duration: "5h",
    price: 165,
    type: "PRESENCIAL" as const,
    features: [
      "5 clases presenciales",
      "Evaluación inicial del nivel",
      "Revisión entre clases vía WhatsApp",
    ],
    popular: false,
  },
  {
    name: "Bono 10 Clases",
    modality: "Presencial",
    duration: "10h",
    price: 300,
    type: "PRESENCIAL" as const,
    features: [
      "10 clases presenciales",
      "Evaluación inicial del nivel",
      "Revisión entre clases vía WhatsApp",
      "Contacto 24h para dudas",
    ],
    popular: true,
  },
];

export default function Pricing() {
  return (
    <section id="tarifas" className="section bg-blush-50/30">
      <div className="container-app">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
            Tarifas
          </h2>
          <div className="divider" />
          <p className="font-body text-charcoal-lighter max-w-xl mx-auto">
            Elige el plan que mejor se adapte a ti y comienza tu camino en el posing
          </p>
        </div>

        {/* Online Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Wifi size={18} className="text-blush-500" />
            <h3 className="font-heading text-2xl text-charcoal font-medium tracking-wide uppercase">
              Online
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans
              .filter((p) => p.type === "ONLINE")
              .map((plan, index) => (
                <PricingCard key={`online-${index}`} plan={plan} />
              ))}
          </div>
        </div>

        {/* Presencial Section */}
        <div>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <MapPin size={18} className="text-blush-500" />
            <h3 className="font-heading text-2xl text-charcoal font-medium tracking-wide uppercase">
              Presencial
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans
              .filter((p) => p.type === "PRESENCIAL")
              .map((plan, index) => (
                <PricingCard key={`presencial-${index}`} plan={plan} />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  plan,
}: {
  plan: (typeof pricingPlans)[0];
}) {
  return (
    <div
      className={`relative rounded-2xl p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 ${
        plan.popular
          ? "bg-white shadow-elegant border-2 border-blush-200 scale-[1.02]"
          : "bg-white shadow-card border border-blush-50 hover:shadow-elegant"
      }`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blush-300 text-charcoal text-[10px] tracking-[0.15em] uppercase font-medium px-4 py-1 rounded-full">
            Más popular
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h4 className="font-heading text-lg font-semibold text-charcoal uppercase tracking-wider">
          {plan.name}
        </h4>
        <p className="text-xs text-charcoal-lighter mt-1 tracking-wide">
          {plan.modality} ({plan.duration})
        </p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        <span className="text-4xl md:text-5xl font-heading font-bold text-charcoal">
          {plan.price}
        </span>
        <span className="text-lg font-heading text-charcoal-lighter ml-1">€</span>
      </div>

      {/* Divider */}
      <div className="divider-wide !my-4" />

      {/* Features */}
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-charcoal-light">
            <Check size={14} className="text-blush-400 mt-0.5 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link
        href="/registro"
        className={`w-full text-center ${
          plan.popular ? "btn-primary" : "btn-secondary"
        } block`}
      >
        Reservar
      </Link>
    </div>
  );
}
