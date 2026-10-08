import type { Metadata } from "next";
import Link from "next/link";
import { Check, Phone, ClipboardList, CreditCard } from "lucide-react";
import FormularioSolicitud from "@/components/programa/FormularioSolicitud";
import { PROGRAMA, MODALIDADES, COHORTES } from "@/lib/programa";

export const metadata: Metadata = {
  title: `Solicitud · ${PROGRAMA.nombre} | The Heels`,
  description:
    "Ficha de solicitud del programa de posing de competición de doce semanas. Rellenas la ficha, hablamos quince minutos y decides.",
  openGraph: {
    title: `${PROGRAMA.nombre} — solicitud`,
    description: PROGRAMA.promesa,
    type: "website",
  },
};

const PASOS = [
  {
    icon: ClipboardList,
    titulo: "Rellenas la ficha",
    texto:
      "Diez minutos. Tu categoría, tu fecha de competición y un vídeo de tu posing actual.",
  },
  {
    icon: Phone,
    titulo: "Hablamos quince minutos",
    texto:
      "Te digo tres cosas concretas que veo en tu vídeo y te sitúo en el grupo de tu nivel.",
  },
  {
    icon: CreditCard,
    titulo: "Decides",
    texto:
      "Las plazas se reservan por orden de pago, no de solicitud. Si no te encaja, te lo digo yo.",
  },
];

export default function SolicitudPage() {
  return (
    <main className="bg-cream-50">
      <header className="container-app py-6">
        <Link href="/" className="inline-flex flex-col">
          <span className="text-[9px] tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter">
            Posing
          </span>
          <span className="text-xl font-heading font-bold tracking-wide text-charcoal leading-none">
            THE HEELS
          </span>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blush-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-blush-200/30 rounded-full blur-3xl" />

        <div className="relative z-10 container-app py-16 md:py-20 text-center max-w-3xl">
          <span className="badge-blush">
            {PROGRAMA.plazasPorGrupo} plazas por grupo
          </span>

          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight mt-6">
            {PROGRAMA.nombre}
          </h1>

          <div className="divider" />

          <p className="font-body text-base md:text-lg text-charcoal-light leading-relaxed max-w-xl mx-auto">
            {PROGRAMA.promesa}
          </p>

          <a href="#ficha" className="btn-primary mt-10">
            Rellenar mi ficha
          </a>
        </div>
      </section>

      {/* Cómo se entra */}
      <section className="section-sm">
        <div className="container-app max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal font-light italic">
              Cómo se entra
            </h2>
            <div className="divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PASOS.map((p, i) => (
              <div key={p.titulo} className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center">
                    <p.icon size={16} className="text-blush-500" />
                  </div>
                  <span className="font-heading text-2xl text-blush-200 font-bold">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">
                  {p.titulo}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  {p.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modalidades */}
      <section className="section-sm bg-white">
        <div className="container-app max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl text-charcoal font-light italic">
              Dos modalidades
            </h2>
            <div className="divider" />
            <p className="text-sm text-charcoal-light max-w-lg mx-auto">
              Las dos duran {PROGRAMA.semanas} semanas y se pagan en tres
              mensualidades. No hay permanencia más allá de los tres meses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MODALIDADES.map((m) => (
              <div key={m.valor} className="card">
                <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter">
                  {m.etiqueta}
                </p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="font-heading text-4xl font-bold text-charcoal">
                    {m.precioMes} €
                  </span>
                  <span className="text-sm text-charcoal-lighter">/mes × 3</span>
                </div>
                <p className="text-xs text-charcoal-lighter mt-1">
                  O {m.precioUnico} € en un pago único
                </p>
                <p className="text-sm text-charcoal-light mt-4 mb-5">{m.resumen}</p>

                <ul className="space-y-2.5">
                  {m.incluye.map((linea) => (
                    <li
                      key={linea}
                      className="flex items-start gap-2.5 text-sm text-charcoal-light"
                    >
                      <Check size={14} className="text-blush-500 mt-0.5 shrink-0" />
                      {linea}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card-flat mt-8">
            <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter mb-4">
              Cohortes abiertas
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(COHORTES).map(([clave, c]) => (
                <div key={clave} className="text-sm">
                  <p className="font-semibold text-charcoal">
                    {c.etiqueta} · arranca el {c.arranca}
                  </p>
                  <p className="text-charcoal-lighter text-xs mt-0.5">
                    Si {c.para}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-charcoal-lighter mt-5 leading-relaxed">
              Tu cohorte la decide tu fecha de competición, no tu horario: el
              programa son doce semanas atadas a tu temporada.
            </p>
          </div>
        </div>
      </section>

      {/* Ficha */}
      <section id="ficha" className="section">
        <div className="container-app max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
              Tu ficha
            </h2>
            <div className="divider" />
            <p className="text-sm text-charcoal-light max-w-md mx-auto leading-relaxed">
              No es para filtrarte por dinero: es para colocarte en el grupo de
              tu nivel y saber a cuántas semanas estás de tu tarima.
            </p>
          </div>

          <FormularioSolicitud />
        </div>
      </section>

      {/* Lo que no es */}
      <section className="section-sm bg-white">
        <div className="container-app max-w-2xl text-center">
          <h2 className="font-heading text-2xl text-charcoal font-light italic mb-4">
            Lo que este programa no es
          </h2>
          <p className="text-sm text-charcoal-light leading-relaxed">
            No es un plan de dieta ni de entrenamiento, y no sustituye a tu
            preparador. Aquí trabajamos exclusivamente lo que pasa encima de la
            tarima. No se garantizan resultados ni posiciones: el fallo de los
            jueces depende de factores que están fuera del programa.
          </p>
        </div>
      </section>

      <footer className="bg-charcoal text-white/60">
        <div className="container-app py-10 text-center">
          <p className="text-sm font-heading tracking-wide text-white">THE HEELS</p>
          <p className="text-xs font-script italic text-white/40 mt-1">
            Alejandra Sanchis
          </p>
          <Link
            href="/"
            className="inline-block text-xs text-white/40 hover:text-blush-300 transition-colors mt-5"
          >
            posingtheheels.com
          </Link>
        </div>
      </footer>
    </main>
  );
}
