import type { Metadata } from "next";
import Link from "next/link";
import Replay from "@/components/masterclass/Replay";
import { MASTERCLASS, estadoDeLaEdicion } from "@/lib/masterclass";

export const metadata: Metadata = {
  title: `Replay · ${MASTERCLASS.titulo} | The Heels`,
  description: `Replay de la masterclass ${MASTERCLASS.titulo}, disponible ${MASTERCLASS.replayHoras} horas.`,
  // El enlace se reparte por email a quien se inscribió. Indexarlo sólo serviría
  // para que entre a pedirlo gente que no ha pasado por la landing.
  robots: { index: false, follow: false },
};

// El cierre se decide en cada petición: con la página cacheada, el replay
// seguiría abriéndose un día después de haberse cerrado.
export const dynamic = "force-dynamic";

export default function ReplayPage() {
  const estado = estadoDeLaEdicion();

  return (
    <main className="bg-cream-50 min-h-screen flex flex-col">
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

      <section className="section-sm flex-1">
        <div className="container-app max-w-3xl">
          <div className="text-center mb-12">
            <span className="badge-blush">Replay</span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-charcoal leading-tight mt-5">
              {MASTERCLASS.titulo}
            </h1>
            <p className="font-heading text-lg text-charcoal-light font-light italic mt-2">
              {MASTERCLASS.subtitulo}
            </p>
            <div className="divider" />
          </div>

          <Replay estado={estado} />
        </div>
      </section>

      <footer className="bg-charcoal text-white/60">
        <div className="container-app py-10 text-center">
          <p className="text-sm font-heading tracking-wide text-white">THE HEELS</p>
          <p className="text-xs font-script italic text-white/40 mt-1">
            Alejandra Sanchis
          </p>
        </div>
      </footer>
    </main>
  );
}
