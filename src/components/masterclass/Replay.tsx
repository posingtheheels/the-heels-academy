"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Lock, PlayCircle, Clock } from "lucide-react";
import { MASTERCLASS } from "@/lib/masterclass";

type Acceso = {
  nombre: string;
  videoUrl: string | null;
  descargables: { nombre: string; url: string }[];
  oferta: {
    titulo: string;
    descripcion: string;
    precio: number;
    precioTachado: number;
    detalle: string;
    url: string;
  } | null;
  cierraEn: string;
};

type Estado = "ANTES" | "REPLAY" | "CERRADO";

export default function Replay({ estado }: { estado: Estado }) {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [sinInscripcion, setSinInscripcion] = useState(false);
  const [acceso, setAcceso] = useState<Acceso | null>(null);

  const abrir = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    setError("");
    setSinInscripcion(false);

    try {
      const res = await fetch("/api/masterclass/replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const cuerpo = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSinInscripcion(cuerpo.noInscrita === true);
        throw new Error(cuerpo.error || "No se ha podido abrir el replay.");
      }

      setAcceso(cuerpo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  if (estado === "ANTES") {
    return (
      <div className="card-flat text-center">
        <Clock size={28} className="text-blush-500 mx-auto mb-4" />
        <h2 className="font-heading text-2xl text-charcoal mb-3">
          Todavía no se ha dado
        </h2>
        <p className="text-sm text-charcoal-light leading-relaxed max-w-md mx-auto">
          La sesión es el {MASTERCLASS.fechaTexto} a las {MASTERCLASS.hora}. El
          replay se abre aquí mismo en cuanto termine, y te aviso por email.
        </p>
        <Link href="/masterclass" className="btn-primary mt-7">
          Guardar mi plaza
        </Link>
      </div>
    );
  }

  if (estado === "CERRADO") {
    return (
      <div className="card-flat text-center">
        <Clock size={28} className="text-blush-500 mx-auto mb-4" />
        <h2 className="font-heading text-2xl text-charcoal mb-3">
          El replay ya se ha cerrado
        </h2>
        <p className="text-sm text-charcoal-light leading-relaxed max-w-md mx-auto">
          Estuvo disponible {MASTERCLASS.replayHoras} horas después de la sesión.
          La masterclass se repite cada pocas semanas: déjame tu email y te aviso
          de la siguiente.
        </p>
        <Link href="/masterclass" className="btn-primary mt-7">
          Avísame de la siguiente
        </Link>
      </div>
    );
  }

  if (acceso) return <Desbloqueado acceso={acceso} />;

  return (
    <div className="card-flat max-w-md mx-auto">
      <Lock size={20} className="text-blush-500 mb-4" />
      <h2 className="font-heading text-2xl text-charcoal mb-2">
        Pon el email con el que te apuntaste
      </h2>
      <p className="text-sm text-charcoal-light leading-relaxed mb-6">
        Y te abro el vídeo y los cuatro descargables.
      </p>

      <form onSubmit={abrir} className="space-y-4">
        <input
          type="email"
          className="input"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />

        {error && (
          <div className="text-sm text-blush-700 bg-blush-50 border border-blush-200 rounded-xl px-4 py-3">
            {error}
            {sinInscripcion && (
              <>
                {" "}
                <Link href="/masterclass" className="underline font-medium">
                  Apúntate aquí
                </Link>{" "}
                y entras igual.
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="btn-primary w-full gap-2"
        >
          {enviando ? (
            <>
              <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              Abriendo...
            </>
          ) : (
            "Ver el replay"
          )}
        </button>
      </form>
    </div>
  );
}

function Desbloqueado({ acceso }: { acceso: Acceso }) {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <p className="text-sm text-charcoal-light">
          Aquí lo tienes, {acceso.nombre}.
        </p>
        <CuentaAtras cierraEn={acceso.cierraEn} />
      </div>

      {/* Vídeo */}
      {acceso.videoUrl ? (
        <div className="relative w-full rounded-2xl overflow-hidden bg-charcoal shadow-card aspect-video">
          <iframe
            src={acceso.videoUrl}
            title={`Replay de ${MASTERCLASS.titulo}`}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="card-flat text-center">
          <PlayCircle size={26} className="text-blush-500 mx-auto mb-3" />
          <p className="text-sm text-charcoal-light">
            El vídeo se está subiendo. Vuelve en un rato: tienes el enlace
            guardado en tu email.
          </p>
        </div>
      )}

      {/* Descargables */}
      <div>
        <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter mb-5 text-center">
          Tus cuatro descargables
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {acceso.descargables.map((d) => (
            <a
              key={d.url}
              href={d.url}
              download
              className="flex items-center gap-3 bg-white rounded-xl border border-blush-50
                         px-4 py-4 text-sm text-charcoal-light
                         hover:border-blush-200 hover:text-charcoal transition-colors"
            >
              <Download size={15} className="text-blush-500 shrink-0" />
              {d.nombre}
            </a>
          ))}
        </div>
      </div>

      {/* La oferta de la ventana */}
      {acceso.oferta && (
        <div className="card text-center">
          <span className="badge-blush">Solo hasta que cierre el replay</span>
          <h3 className="font-heading text-2xl text-charcoal mt-5 mb-3">
            {acceso.oferta.titulo}
          </h3>
          <p className="text-sm text-charcoal-light leading-relaxed max-w-lg mx-auto">
            {acceso.oferta.descripcion}
          </p>

          <div className="flex items-baseline justify-center gap-3 mt-6">
            <span className="font-heading text-4xl font-bold text-charcoal">
              {acceso.oferta.precio} €
            </span>
            <span className="text-base text-charcoal-lighter line-through">
              {acceso.oferta.precioTachado} €
            </span>
          </div>
          <p className="text-xs text-charcoal-lighter mt-2">
            {acceso.oferta.detalle}
          </p>

          <a
            href={acceso.oferta.url}
            className="btn-primary mt-7"
            target="_blank"
            rel="noopener noreferrer"
          >
            La quiero
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Cuenta atrás hasta el cierre. El instante lo manda el servidor; aquí sólo se
 * pinta, para que cambiar la hora del móvil no regale horas de ventana.
 */
function CuentaAtras({ cierraEn }: { cierraEn: string }) {
  const [restante, setRestante] = useState<string | null>(null);

  useEffect(() => {
    const calcular = () => {
      const ms = new Date(cierraEn).getTime() - Date.now();
      if (ms <= 0) return setRestante(null);

      const horas = Math.floor(ms / 3_600_000);
      const minutos = Math.floor((ms % 3_600_000) / 60_000);
      setRestante(`${horas} h ${minutos} min`);
    };

    calcular();
    const id = setInterval(calcular, 60_000);
    return () => clearInterval(id);
  }, [cierraEn]);

  if (!restante) return null;

  return (
    <p className="inline-flex items-center gap-2 text-xs tracking-wide uppercase text-blush-700 bg-blush-50 border border-blush-200 rounded-full px-4 py-2 mt-4">
      <Clock size={13} />
      Se cierra en {restante}
    </p>
  );
}
