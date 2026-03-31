"use client";

import { Users, Video, MapPin, Clock, MessageCircle, TrendingUp, BookOpen, Phone } from "lucide-react";

export default function Plans() {
  return (
    <section id="planes" className="section bg-white">
      <div className="container-app">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
            Planes
          </h2>
          <p className="font-script text-lg text-charcoal-lighter mt-2">
            Online & Presencial
          </p>
          <div className="divider" />
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Clase Individual */}
          <div className="card group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                <Users size={18} className="text-blush-500" />
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal uppercase tracking-wide">
                Clase Individual
              </h3>
            </div>

            <p className="text-sm text-charcoal-light leading-relaxed mb-6">
              La clase se dividirá en 3 partes para poder trabajar los pilares fundamentales:
            </p>

            <ul className="space-y-2 mb-6">
              {["Poses obligatorias", "Comparativas", "Rutina individual"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-charcoal-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-blush-300" />
                    {item}
                  </li>
                )
              )}
            </ul>

            <div className="divider-wide" />

            <p className="text-sm text-charcoal-light leading-relaxed">
              Dudas o repaso que prefiera la atleta.
            </p>
          </div>

          {/* Bono 5 & 10 Clases */}
          <div className="card group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                <BookOpen size={18} className="text-blush-500" />
              </div>
              <h3 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal uppercase tracking-wide">
                Bono 5 & 10 Clases
              </h3>
            </div>

            <p className="text-sm text-charcoal-light leading-relaxed mb-6">
              La primera clase se dividirá en 3 partes para poder ver el nivel de la atleta:
            </p>

            <ul className="space-y-2 mb-6">
              {["Poses obligatorias", "Comparativas", "Rutina individual"].map(
                (item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-charcoal-light">
                    <span className="w-1.5 h-1.5 rounded-full bg-blush-300" />
                    {item}
                  </li>
                )
              )}
            </ul>

            <div className="divider-wide" />

            <ul className="space-y-3">
              {[
                "Según el nivel se comenzará a diseñar y/o ajustar las poses y/o la rutina desde la primera clase",
                "El resto de clases se diseñarán en función de las necesidades de la atleta",
                "Dudas o repaso que prefiera la atleta en cada clase",
                "Revisión entre clases vía WhatsApp",
                "Registro de la evolución de la atleta",
                "Contacto 24 horas para dudas",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-charcoal-light leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-blush-300 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Duration Notes */}
        <div className="text-center mt-10 space-y-1">
          <p className="text-xs text-charcoal-lighter italic">
            * La duración de clases online es de 30 minutos y de clases presenciales 1 hora.
          </p>
          <p className="text-xs text-charcoal-lighter italic">
            ** Se pueden juntar clases en una misma sesión hasta consumir las horas del bono seleccionado
          </p>
        </div>

        {/* Features Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
          {[
            { icon: Video, label: "Online vía WhatsApp" },
            { icon: MapPin, label: "Presencial" },
            { icon: MessageCircle, label: "Contacto 24h" },
            { icon: TrendingUp, label: "Seguimiento" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-blush-50/50 border border-blush-100"
            >
              <Icon size={20} className="text-blush-400" />
              <span className="text-xs text-charcoal-light tracking-wide text-center">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
