import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Video, FileText, Target, Music, Sparkles } from "lucide-react";
import FormularioInscripcion from "@/components/masterclass/FormularioInscripcion";
import { MASTERCLASS, DESCARGABLES, estadoDeLaEdicion } from "@/lib/masterclass";

export const metadata: Metadata = {
  title: `${MASTERCLASS.titulo} | Masterclass gratuita de posing — The Heels`,
  description:
    "Masterclass online y gratuita de posing de competición: qué puntúa un juez, cómo se monta una rutina individual y cómo se organiza la semana previa. Con tu diagnóstico sobre 45.",
  openGraph: {
    title: `${MASTERCLASS.titulo} — ${MASTERCLASS.subtitulo}`,
    description: `Masterclass online y gratuita. ${MASTERCLASS.fechaTexto} a las ${MASTERCLASS.hora}.`,
    type: "website",
  },
};

/**
 * Landing de captación de la masterclass.
 *
 * Deliberadamente sin la navegación del sitio: una página de inscripción con
 * menú es una página con fugas. El único enlace que sale de aquí es el logo.
 */

const BLOQUES = [
  {
    icon: Target,
    titulo: "Qué puntúa un juez",
    texto:
      "Los nueve apartados con los que se puntúa en tarima, y la arquitectura de una pose en siete puntos de control que puedes revisar sola delante del espejo.",
  },
  {
    icon: Music,
    titulo: "Tu rutina individual",
    texto:
      "Por qué la mayoría de rutinas son un collage, y cómo se monta una sobre los acentos de tu música en lugar de sobre tus poses favoritas.",
  },
  {
    icon: Sparkles,
    titulo: "La semana previa y el backstage",
    texto:
      "Qué se toca y qué se deja quieto, el calendario de tanning y el día de la competición cronometrado de la alarma a las finales.",
  },
];

// La sesión ya ha pasado pero el enlace sigue circulando por Instagram: mandar
// a esa gente a un formulario de una sesión que ya se dio es perder el lead.
export const dynamic = "force-dynamic";

export default function MasterclassPage() {
  const enReplay = estadoDeLaEdicion() === "REPLAY";

  return (
    <main className="bg-cream-50">
      {enReplay && (
        <div className="bg-charcoal text-white/80 text-center text-sm py-3 px-4">
          La sesión ya se ha dado.{" "}
          <Link href="/masterclass/replay" className="underline text-blush-300">
            Ver el replay
          </Link>{" "}
          — disponible {MASTERCLASS.replayTexto}.
        </div>
      )}

      {/* Cabecera mínima: sólo marca, sin menú */}
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

        <div className="relative z-10 container-app py-16 md:py-24 text-center max-w-3xl">
          {/* El subtítulo ya dice "masterclass": aquí sólo hace falta el precio */}
          <span className="badge-blush">Gratuita · online</span>

          <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl text-charcoal leading-[0.95] mt-6">
            {MASTERCLASS.titulo}
          </h1>

          <p className="font-heading text-xl md:text-2xl text-charcoal-light font-light italic mt-4">
            {MASTERCLASS.subtitulo}
          </p>

          <div className="divider" />

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-charcoal-light">
            <span className="inline-flex items-center gap-2">
              <Calendar size={15} className="text-blush-500" />
              {MASTERCLASS.fechaTexto}, {MASTERCLASS.hora}
            </span>
            <span className="inline-flex items-center gap-2">
              <Video size={15} className="text-blush-500" />
              Online
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock size={15} className="text-blush-500" />
              {MASTERCLASS.duracion}
            </span>
          </div>

          <p className="font-body text-base md:text-lg text-charcoal-light leading-relaxed max-w-xl mx-auto mt-10">
            Te has dejado ocho meses y varios miles de euros en llegar en forma.
            El día de la competición todo eso se juega en la única parte que casi
            nadie entrena: <strong className="text-charcoal">cómo lo muestras</strong>.
          </p>

          <a href="#inscripcion" className="btn-primary mt-10">
            Guardar mi plaza
          </a>
        </div>
      </section>

      {/* Qué vamos a ver */}
      <section className="section">
        <div className="container-app max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
              En 90 minutos
            </h2>
            <div className="divider" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BLOQUES.map((b) => (
              <div key={b.titulo} className="card">
                <div className="w-11 h-11 rounded-full bg-blush-50 flex items-center justify-center mb-5">
                  <b.icon size={18} className="text-blush-500" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-3">
                  {b.titulo}
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  {b.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* El diagnóstico */}
      <section className="section-sm bg-white">
        <div className="container-app max-w-3xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl text-charcoal font-light italic">
            Y te vas con tu número
          </h2>
          <div className="divider" />
          <p className="text-charcoal-light leading-relaxed">
            Al final te puntúas en los mismos nueve apartados con los que se
            puntúa en tarima, sobre 45. Dejas de tener una sensación y pasas a
            tener un punto de partida contra el que comparar dentro de doce
            semanas.
          </p>

          <div className="card-flat mt-10 text-left">
            <p className="text-xs tracking-[0.2em] uppercase font-medium text-charcoal-lighter mb-5">
              Te llevas cuatro cosas, la veas en directo o en el replay
            </p>
            <ul className="space-y-3">
              {DESCARGABLES.map((d) => (
                <li
                  key={d.archivo}
                  className="flex items-start gap-3 text-sm text-charcoal-light"
                >
                  <FileText size={15} className="text-blush-500 mt-0.5 shrink-0" />
                  {d.nombre}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-charcoal-light leading-relaxed mt-10">
            Las <strong className="text-charcoal">{MASTERCLASS.plazasCamara} primeras
            en encender la cámara</strong> entran en la ronda de corrección en
            directo.
          </p>
        </div>
      </section>

      {/* Inscripción */}
      <section id="inscripcion" className="section">
        <div className="container-app max-w-xl">
          <div className="text-center mb-10">
            <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
              Guarda tu plaza
            </h2>
            <div className="divider" />
            <p className="text-sm text-charcoal-light">
              {MASTERCLASS.fechaTexto} a las {MASTERCLASS.hora},{" "}
              {MASTERCLASS.zona}
            </p>
          </div>

          <FormularioInscripcion />
        </div>
      </section>

      {/* Lo que no es */}
      <section className="section-sm bg-white">
        <div className="container-app max-w-2xl text-center">
          <p className="text-sm text-charcoal-light leading-relaxed">
            No es una clase de dieta ni de entrenamiento, y no sustituye a tu
            preparador. Aquí trabajamos exclusivamente lo que pasa encima de la
            tarima.
          </p>
        </div>
      </section>

      <footer className="bg-charcoal text-white/60">
        <div className="container-app py-10 text-center">
          <p className="text-sm font-heading tracking-wide text-white">
            THE HEELS
          </p>
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
