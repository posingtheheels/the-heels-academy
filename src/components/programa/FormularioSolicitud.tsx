"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Send, Upload, Video, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FEDERACIONES, CATEGORIAS } from "@/lib/masterclass";
import {
  PROGRAMA,
  MODALIDADES,
  EXPERIENCIA_TACON,
  FRANJAS,
} from "@/lib/programa";
import { MAX_VIDEO_BYTES, TIPOS_VIDEO } from "@/lib/encuesta";

type Estado = "idle" | "enviando" | "enviado";
type CampoVideo = "videoPath" | "competitionVideoPath";

const VACIO = {
  name: "",
  email: "",
  phone: "",
  age: "",
  federation: "",
  category: "",
  modality: "",
  competitionDate: "",
  competitionVenue: "",
  previousCompetitions: "",
  preparedBy: "",
  injuries: "",
  heelExperience: "",
  biggestFear: "",
  seasonGoal: "",
  videoPath: "",
  competitionVideoPath: "",
};

const VIDEOS: { campo: CampoVideo; titulo: string; ayuda: string }[] = [
  {
    campo: "videoPath",
    titulo: "Tu posing actual",
    ayuda:
      "Frontal, perfil y espalda, en tacones. Máximo 2 minutos. No tiene que estar bien: es el punto de partida.",
  },
  {
    campo: "competitionVideoPath",
    titulo: "Tu última competición",
    ayuda: "Si tienes vídeo de tarima. Opcional.",
  },
];

export default function FormularioSolicitud() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState("");
  const [datos, setDatos] = useState(VACIO);
  const [franjas, setFranjas] = useState<string[]>([]);
  const [subiendo, setSubiendo] = useState<CampoVideo | null>(null);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  const [utm, setUtm] = useState({ utmSource: "", utmCampaign: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      utmSource: p.get("utm_source") || "",
      utmCampaign: p.get("utm_campaign") || "",
    });
  }, []);

  const set = (campo: keyof typeof VACIO, valor: string) =>
    setDatos((prev) => ({ ...prev, [campo]: valor }));

  const alternarFranja = (valor: string) =>
    setFranjas((prev) =>
      prev.includes(valor) ? prev.filter((f) => f !== valor) : [...prev, valor]
    );

  /**
   * El vídeo viaja del móvil a Supabase sin pasar por el servidor: la función de
   * Vercel corta el cuerpo en 4,5 MB y un vídeo de dos minutos se come eso
   * varias veces. El servidor sólo firma la subida.
   */
  const subirVideo = async (campo: CampoVideo, archivo: File) => {
    setError("");

    // El tipo puede venir vacío en algunos Android; en ese caso decide el
    // servidor en lugar de bloquear una subida que seguramente es válida.
    if (archivo.type && !TIPOS_VIDEO.includes(archivo.type)) {
      setError(
        "Ese formato de vídeo no me sirve. Graba con la cámara del móvil y vuelve a intentarlo."
      );
      return;
    }

    if (archivo.size > MAX_VIDEO_BYTES) {
      const mb = Math.round(MAX_VIDEO_BYTES / (1024 * 1024));
      setError(
        `El vídeo pesa demasiado (máximo ${mb} MB). Graba uno más corto, o baja la calidad si tienes la cámara en 4K.`
      );
      return;
    }

    setSubiendo(campo);
    try {
      const res = await fetch("/api/solicitud/subida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: archivo.type || "video/mp4",
          size: archivo.size,
        }),
      });

      const firma = await res.json();
      if (!res.ok) throw new Error(firma.error || "No he podido preparar la subida.");

      const { error: errorSubida } = await supabase.storage
        .from(firma.bucket)
        .uploadToSignedUrl(firma.path, firma.token, archivo);

      if (errorSubida) throw errorSubida;

      set(campo, firma.path);
      setNombres((prev) => ({ ...prev, [campo]: archivo.name }));
    } catch (err: any) {
      setError(err.message || "No he podido subir el vídeo. Inténtalo otra vez.");
    } finally {
      setSubiendo(null);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!datos.videoPath) {
      setError(
        "Falta el vídeo de tu posing actual. Es lo que miro para prepararte la llamada."
      );
      return;
    }

    setEstado("enviando");
    setError("");

    try {
      const res = await fetch("/api/solicitud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...datos,
          age: datos.age || null,
          availability: franjas,
          ...utm,
        }),
      });

      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.error || "No se ha podido enviar la ficha.");

      setEstado("enviado");
    } catch (err: any) {
      setError(err.message);
      setEstado("idle");
    }
  };

  if (estado === "enviado") {
    return (
      <div className="card-flat text-center">
        <CheckCircle size={32} className="text-blush-500 mx-auto mb-4" />
        <h3 className="font-heading text-2xl text-charcoal mb-3">
          Ya tengo tu ficha
        </h3>
        <p className="text-sm text-charcoal-light leading-relaxed max-w-md mx-auto">
          Me veo tu vídeo con calma y te escribo para cuadrar la llamada de
          quince minutos. Te he mandado un email con el resumen.
        </p>
        <p className="text-xs text-charcoal-lighter mt-4">
          Las plazas van por orden de pago, no de solicitud.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-10">
      {/* Quién eres */}
      <Bloque titulo="Quién eres">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Campo id="s-name" etiqueta="Nombre y apellidos">
            <input
              id="s-name"
              type="text"
              className="input"
              value={datos.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </Campo>

          <Campo id="s-age" etiqueta="Edad">
            <input
              id="s-age"
              type="number"
              min={14}
              max={80}
              className="input"
              value={datos.age}
              onChange={(e) => set("age", e.target.value)}
            />
          </Campo>

          <Campo id="s-email" etiqueta="Email">
            <input
              id="s-email"
              type="email"
              className="input"
              value={datos.email}
              onChange={(e) => set("email", e.target.value)}
              required
            />
          </Campo>

          <Campo id="s-phone" etiqueta="WhatsApp">
            <input
              id="s-phone"
              type="tel"
              className="input"
              value={datos.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
            />
          </Campo>
        </div>
      </Bloque>

      {/* Tu temporada */}
      <Bloque
        titulo="Tu temporada"
        ayuda="Esto es lo que me dice a cuántas semanas estás y en qué grupo encajas."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Campo id="s-federation" etiqueta="Federación">
            <select
              id="s-federation"
              className="input"
              value={datos.federation}
              onChange={(e) => set("federation", e.target.value)}
            >
              <option value="">Elige una</option>
              {FEDERACIONES.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="s-category" etiqueta="Categoría">
            <select
              id="s-category"
              className="input"
              value={datos.category}
              onChange={(e) => set("category", e.target.value)}
            >
              <option value="">Elige una</option>
              {CATEGORIAS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
          </Campo>

          <Campo id="s-date" etiqueta="Fecha de tu competición">
            <input
              id="s-date"
              type="date"
              className="input"
              value={datos.competitionDate}
              onChange={(e) => set("competitionDate", e.target.value)}
            />
          </Campo>

          <Campo id="s-venue" etiqueta="Dónde compites">
            <input
              id="s-venue"
              type="text"
              className="input"
              placeholder="Ciudad o sede"
              value={datos.competitionVenue}
              onChange={(e) => set("competitionVenue", e.target.value)}
            />
          </Campo>
        </div>

        <Campo id="s-previous" etiqueta="Competiciones anteriores y resultado">
          <textarea
            id="s-previous"
            className="input min-h-[80px] resize-none"
            placeholder="Si no has competido todavía, dímelo tal cual."
            value={datos.previousCompetitions}
            onChange={(e) => set("previousCompetitions", e.target.value)}
          />
        </Campo>

        <Campo id="s-prep" etiqueta="Quién lleva tu preparación">
          <input
            id="s-prep"
            type="text"
            className="input"
            placeholder="Nombre de tu preparador o equipo"
            value={datos.preparedBy}
            onChange={(e) => set("preparedBy", e.target.value)}
          />
          <p className="text-xs text-charcoal-lighter mt-1.5">
            No nos pisamos: él lleva tu físico y yo llevo cómo lo muestras.
          </p>
        </Campo>
      </Bloque>

      {/* Tu punto de partida */}
      <Bloque titulo="Tu punto de partida">
        <Campo id="s-heels" etiqueta="Experiencia en tacón">
          <select
            id="s-heels"
            className="input"
            value={datos.heelExperience}
            onChange={(e) => set("heelExperience", e.target.value)}
          >
            <option value="">Elige una</option>
            {EXPERIENCIA_TACON.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <Campo id="s-injuries" etiqueta="Lesiones o limitaciones">
          <textarea
            id="s-injuries"
            className="input min-h-[70px] resize-none"
            placeholder="Cualquier cosa que deba tener en cuenta al colocarte."
            value={datos.injuries}
            onChange={(e) => set("injuries", e.target.value)}
          />
        </Campo>

        <Campo id="s-fear" etiqueta="Qué te da más miedo de la tarima">
          <textarea
            id="s-fear"
            className="input min-h-[70px] resize-none"
            value={datos.biggestFear}
            onChange={(e) => set("biggestFear", e.target.value)}
          />
        </Campo>

        <Campo id="s-goal" etiqueta="Tu objetivo de esta temporada">
          <textarea
            id="s-goal"
            className="input min-h-[70px] resize-none"
            value={datos.seasonGoal}
            onChange={(e) => set("seasonGoal", e.target.value)}
          />
        </Campo>
      </Bloque>

      {/* Vídeos */}
      <Bloque
        titulo="Tus vídeos"
        ayuda="Es lo que miro antes de la llamada. Sin esto no puedo decirte nada concreto."
      >
        {VIDEOS.map((v) => (
          <div key={v.campo}>
            <p className="input-label">
              {v.titulo}
              {v.campo === "videoPath" && (
                <span className="text-blush-600"> · obligatorio</span>
              )}
            </p>
            <label
              className={`flex items-center gap-3 px-4 py-4 rounded-xl border cursor-pointer
                          transition-colors text-sm ${
                            datos[v.campo]
                              ? "bg-blush-50 border-blush-200 text-charcoal"
                              : "bg-white border-blush-100 text-charcoal-lighter hover:border-blush-200"
                          }`}
            >
              <input
                type="file"
                accept="video/*"
                className="hidden"
                disabled={subiendo !== null}
                onChange={(e) => {
                  const archivo = e.target.files?.[0];
                  if (archivo) subirVideo(v.campo, archivo);
                  e.target.value = "";
                }}
              />
              {subiendo === v.campo ? (
                <>
                  <div className="w-4 h-4 border-2 border-blush-300 border-t-blush-600 rounded-full animate-spin" />
                  Subiendo...
                </>
              ) : datos[v.campo] ? (
                <>
                  <Check size={15} className="text-blush-600" />
                  {nombres[v.campo] || "Vídeo subido"}
                </>
              ) : (
                <>
                  <Upload size={15} />
                  Elegir vídeo
                </>
              )}
            </label>
            <p className="text-xs text-charcoal-lighter mt-1.5">{v.ayuda}</p>
          </div>
        ))}

        <p className="flex items-start gap-2 text-xs text-charcoal-lighter">
          <Video size={13} className="mt-0.5 shrink-0" />
          Tus vídeos van a un almacén privado y no los ve nadie más que yo.
        </p>
      </Bloque>

      {/* Modalidad y horarios */}
      <Bloque titulo="Cómo te encaja">
        <Campo id="s-modality" etiqueta="Qué modalidad te interesa">
          <select
            id="s-modality"
            className="input"
            value={datos.modality}
            onChange={(e) => set("modality", e.target.value)}
          >
            <option value="">Todavía no lo sé, lo hablamos</option>
            {MODALIDADES.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.etiqueta} — {m.precioMes} €/mes
              </option>
            ))}
          </select>
        </Campo>

        <div>
          <p className="input-label">Cuándo puedes conectarte</p>
          <div className="flex flex-wrap gap-2">
            {FRANJAS.map((f) => {
              const activa = franjas.includes(f.valor);
              return (
                <button
                  key={f.valor}
                  type="button"
                  onClick={() => alternarFranja(f.valor)}
                  className={`px-4 py-2 rounded-full text-xs border transition-colors ${
                    activa
                      ? "bg-blush-300 border-blush-300 text-charcoal"
                      : "bg-white border-blush-100 text-charcoal-lighter hover:border-blush-200"
                  }`}
                >
                  {f.etiqueta}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-charcoal-lighter mt-2">
            Marca todas las que te valgan. Los grupos se cierran por nivel, pero
            el horario tiene que cuadrarle a las {PROGRAMA.plazasPorGrupo}.
          </p>
        </div>
      </Bloque>

      {error && (
        <p className="text-sm text-blush-700 bg-blush-50 border border-blush-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={estado !== "idle" || subiendo !== null}
          className="btn-primary w-full gap-2"
        >
          {estado === "enviando" ? (
            <>
              <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Send size={14} />
              Enviar mi ficha
            </>
          )}
        </button>
        <p className="text-xs text-charcoal-lighter text-center leading-relaxed mt-4">
          Enviar la ficha no te compromete a nada y no se paga nada aquí. Te
          escribo para cuadrar la llamada de quince minutos.
        </p>
      </div>
    </form>
  );
}

function Bloque({
  titulo,
  ayuda,
  children,
}: {
  titulo: string;
  ayuda?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h3 className="font-heading text-xl font-semibold text-charcoal">
          {titulo}
        </h3>
        {ayuda && (
          <p className="text-sm text-charcoal-light mt-1 leading-relaxed">
            {ayuda}
          </p>
        )}
        <div className="w-10 h-px bg-blush-200 mt-4" />
      </div>
      {children}
    </section>
  );
}

function Campo({
  id,
  etiqueta,
  children,
}: {
  id: string;
  etiqueta: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="input-label">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}
