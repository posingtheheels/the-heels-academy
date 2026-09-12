"use client";

import { useMemo, useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Video,
  Trash2,
  Loader2,
  Check,
  Heart,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  VALORACIONES,
  BLOQUES_ABIERTOS,
  PREGUNTA_COACH,
  PREGUNTA_MEJORA,
  ANTIGUEDADES,
  MODALIDADES,
  CANALES,
  TRABAJAR_MAS,
  INTERESES,
  MAX_VIDEO_BYTES,
  TIPOS_VIDEO,
} from "@/lib/encuesta";

/**
 * Los pasos se construyen a partir del catálogo compartido: añadir una pregunta
 * en src/lib/encuesta.ts la pinta aquí sola, sin tocar este fichero.
 */
const PASOS = [
  { id: "sobre-ti", etiqueta: "Tú" },
  { id: "valoraciones", etiqueta: "Valoraciones" },
  { id: "recomendacion", etiqueta: "Recomendación" },
  ...BLOQUES_ABIERTOS.map((b) => ({ id: b.id, etiqueta: b.titulo })),
  { id: "mejoras", etiqueta: "Qué te gustaría" },
  { id: "coach", etiqueta: "Tu coach" },
  { id: "video", etiqueta: "Tu vídeo" },
];

type Respuestas = Record<string, any>;

export default function EncuestaPage() {
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [subiendoVideo, setSubiendoVideo] = useState(false);
  const [nombreVideo, setNombreVideo] = useState("");
  const [r, setR] = useState<Respuestas>({ allowPublish: true });

  const set = (campo: string, valor: any) =>
    setR((prev) => ({ ...prev, [campo]: valor }));

  /** Marca o desmarca un valor dentro de una selección múltiple. */
  const alternar = (campo: string, valor: string) =>
    setR((prev) => {
      const actuales: string[] = prev[campo] || [];
      return {
        ...prev,
        [campo]: actuales.includes(valor)
          ? actuales.filter((v) => v !== valor)
          : actuales.concat(valor),
      };
    });

  const actual = PASOS[paso];
  const esUltimo = paso === PASOS.length - 1;

  const progreso = useMemo(
    () => Math.round(((paso + 1) / PASOS.length) * 100),
    [paso]
  );

  const subirVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");

    if (!TIPOS_VIDEO.includes(file.type)) {
      setError(
        "Ese formato de vídeo no me sirve. Graba con la cámara del móvil y vuelve a intentarlo."
      );
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(
        `El vídeo pesa demasiado (máximo ${Math.round(
          MAX_VIDEO_BYTES / (1024 * 1024)
        )} MB). Graba uno más corto, o baja la calidad de la cámara si la tienes en 4K.`
      );
      return;
    }

    setSubiendoVideo(true);
    try {
      const res = await fetch("/api/encuesta/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, size: file.size }),
      });
      const firma = await res.json();
      if (!res.ok) throw new Error(firma.error || "No he podido preparar la subida.");

      const { error: errorSubida } = await supabase.storage
        .from(firma.bucket)
        .uploadToSignedUrl(firma.path, firma.token, file);

      if (errorSubida) throw errorSubida;

      set("videoPath", firma.path);
      setNombreVideo(file.name);
    } catch (err: any) {
      setError(err.message || "No he podido subir el vídeo. Inténtalo otra vez.");
    } finally {
      setSubiendoVideo(false);
    }
  };

  const enviar = async () => {
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(r),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No he podido enviar tus respuestas.");
      setEnviado(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const irA = (siguiente: number) => {
    setError("");
    setPaso(siguiente);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (enviado) return <Gracias conVideo={!!r.videoPath} />;

  const bloqueAbierto = BLOQUES_ABIERTOS.find((b) => b.id === actual.id);

  return (
    <main className="min-h-screen bg-gradient-soft">
      <div className="mx-auto w-full max-w-2xl px-5 py-10 md:py-16">
        <Cabecera />

        {/* Progreso */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-charcoal-lighter">
            <span>{actual.etiqueta}</span>
            <span>
              {paso + 1} / {PASOS.length}
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-blush-100">
            <div
              className="h-full rounded-full bg-blush-400 transition-all duration-500"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card md:p-10">
          {actual.id === "sobre-ti" && <PasoSobreTi r={r} set={set} />}
          {actual.id === "valoraciones" && <PasoValoraciones r={r} set={set} />}
          {actual.id === "recomendacion" && <PasoRecomendacion r={r} set={set} />}

          {bloqueAbierto && (
            <PasoAbiertas bloque={bloqueAbierto} r={r} set={set} />
          )}

          {actual.id === "mejoras" && (
            <PasoMejoras r={r} set={set} alternar={alternar} />
          )}
          {actual.id === "coach" && <PasoCoach r={r} set={set} />}
          {actual.id === "video" && (
            <PasoVideo
              r={r}
              set={set}
              subiendo={subiendoVideo}
              nombreVideo={nombreVideo}
              onSubir={subirVideo}
              onQuitar={() => {
                set("videoPath", null);
                setNombreVideo("");
              }}
            />
          )}

          {error && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* Navegación */}
          <div className="mt-10 flex items-center justify-between gap-4">
            {paso > 0 ? (
              <button
                type="button"
                onClick={() => irA(paso - 1)}
                className="inline-flex items-center gap-1 text-sm text-charcoal-lighter transition-colors hover:text-charcoal"
              >
                <ChevronLeft size={16} />
                Atrás
              </button>
            ) : (
              <span />
            )}

            {!esUltimo ? (
              <button
                type="button"
                onClick={() => irA(paso + 1)}
                className="inline-flex items-center gap-2 rounded-full bg-blush-300 px-8 py-3 text-sm font-medium text-charcoal transition-all hover:bg-blush-400"
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={enviar}
                disabled={enviando || subiendoVideo}
                className="inline-flex items-center gap-2 rounded-full bg-charcoal px-8 py-3 text-sm font-medium text-white transition-all hover:bg-charcoal-darkest disabled:opacity-50"
              >
                {enviando ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Enviando…
                  </>
                ) : (
                  <>
                    <Heart size={16} />
                    Enviar
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-charcoal-lighter">
          <ShieldCheck size={13} />
          Tus respuestas sólo las veo yo. Nada se publica sin tu permiso.
        </p>
      </div>
    </main>
  );
}

function Cabecera() {
  return (
    <header className="mb-10 text-center">
      <p className="text-[9px] uppercase tracking-[0.35em] text-charcoal-lighter">
        Posing
      </p>
      <p className="font-heading text-xl font-bold tracking-wide text-charcoal">
        THE HEELS
      </p>
      <h1 className="mt-8 font-heading text-3xl font-light leading-tight text-charcoal md:text-4xl">
        Cuéntame cómo lo estoy haciendo
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-charcoal-light">
        Ninguna pregunta es obligatoria: contesta sólo lo que te apetezca y salta
        el resto. Si te animas, al final puedes grabarme un vídeo.
      </p>
    </header>
  );
}

function Titulo({ texto, ayuda }: { texto: string; ayuda?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-light text-charcoal md:text-3xl">
        {texto}
      </h2>
      {ayuda && <p className="mt-2 text-sm text-charcoal-lighter">{ayuda}</p>}
    </div>
  );
}

function PasoSobreTi({
  r,
  set,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
}) {
  return (
    <div>
      <Titulo
        texto="Antes de nada, ¿quién eres?"
        ayuda="El nombre me ayuda a ponerle cara a lo que me cuentes. Si prefieres contestar en anónimo, déjalo en blanco."
      />

      <div className="space-y-5">
        <Campo etiqueta="Tu nombre" opcional>
          <input
            type="text"
            value={r.name || ""}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Cómo te llamo en clase"
            className="w-full rounded-xl border border-blush-100 bg-blush-50/40 px-4 py-3 text-sm outline-none transition-colors focus:border-blush-300"
          />
        </Campo>

        <Campo etiqueta="Tu WhatsApp" opcional>
          <input
            type="tel"
            value={r.phone || ""}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="Por si quiero darte las gracias en persona"
            className="w-full rounded-xl border border-blush-100 bg-blush-50/40 px-4 py-3 text-sm outline-none transition-colors focus:border-blush-300"
          />
        </Campo>

        <Campo etiqueta="¿Cuánto tiempo llevas conmigo?">
          <Opciones
            opciones={ANTIGUEDADES}
            valor={r.seniority}
            onChange={(v) => set("seniority", v)}
          />
        </Campo>

        <Campo etiqueta="¿Cómo das las clases?">
          <Opciones
            opciones={MODALIDADES}
            valor={r.modality}
            onChange={(v) => set("modality", v)}
          />
        </Campo>

        <Campo etiqueta="¿Cómo me conociste?">
          <Opciones
            opciones={CANALES}
            valor={r.discovery}
            onChange={(v) => set("discovery", v)}
          />
        </Campo>
      </div>
    </div>
  );
}

function PasoValoraciones({
  r,
  set,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
}) {
  return (
    <div>
      <Titulo
        texto="Ponme nota"
        ayuda="Cinco estrellas es lo máximo. Sé sincera: me sirve tanto lo bueno como lo mejorable."
      />

      <div className="divide-y divide-blush-100">
        {VALORACIONES.map((v) => (
          <div
            key={v.campo}
            className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal">{v.titulo}</p>
              <p className="mt-0.5 text-xs text-charcoal-lighter">{v.ayuda}</p>
            </div>
            <Estrellas valor={r[v.campo]} onChange={(n) => set(v.campo, n)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PasoRecomendacion({
  r,
  set,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
}) {
  const notas = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return (
    <div>
      <Titulo
        texto="¿Me recomendarías a una amiga que quiere competir?"
        ayuda="Del 0 (ni de broma) al 10 (ya le he pasado el contacto)."
      />

      <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
        {notas.map((n) => {
          const activa = r.nps === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => set("nps", n)}
              className={`aspect-square rounded-xl text-sm font-medium transition-all ${
                activa
                  ? "bg-charcoal text-white"
                  : "bg-blush-50 text-charcoal-light hover:bg-blush-100"
              }`}
            >
              {n}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex justify-between text-[11px] text-charcoal-lighter">
        <span>Nada probable</span>
        <span>Segurísimo</span>
      </div>

      {typeof r.nps === "number" && r.nps >= 9 && (
        <p className="mt-6 flex items-start gap-2 rounded-xl bg-blush-50 px-4 py-3 text-sm text-charcoal-light">
          <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-blush-500" />
          Qué alegría leer eso. En los siguientes pasos cuéntame por qué: esa
          frase es la que le llega a la próxima que se atreva a subirse a una
          tarima.
        </p>
      )}
    </div>
  );
}

function PasoAbiertas({
  bloque,
  r,
  set,
}: {
  bloque: (typeof BLOQUES_ABIERTOS)[number];
  r: Respuestas;
  set: (c: string, v: any) => void;
}) {
  return (
    <div>
      <Titulo texto={bloque.titulo} ayuda={bloque.ayuda} />

      <div className="space-y-7">
        {bloque.preguntas.map((p) => (
          <AreaTexto key={p.campo} pregunta={p} r={r} set={set} />
        ))}
      </div>
    </div>
  );
}

function PasoMejoras({
  r,
  set,
  alternar,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
  alternar: (c: string, v: string) => void;
}) {
  return (
    <div>
      <Titulo
        texto="¿Qué te gustaría?"
        ayuda="Aquí decides tú lo que preparo a continuación."
      />

      <div className="space-y-8">
        <AreaTexto pregunta={PREGUNTA_MEJORA} r={r} set={set} />

        {[TRABAJAR_MAS, INTERESES].map((grupo) => (
          <div key={grupo.campo}>
            <p className="text-sm font-medium text-charcoal">{grupo.titulo}</p>
            <p className="mb-3 mt-0.5 text-xs text-charcoal-lighter">
              {grupo.ayuda}
            </p>
            <div className="flex flex-wrap gap-2">
              {grupo.opciones.map((o) => {
                const marcada = (r[grupo.campo] || []).includes(o.valor);
                return (
                  <button
                    key={o.valor}
                    type="button"
                    onClick={() => alternar(grupo.campo, o.valor)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-all ${
                      marcada
                        ? "bg-charcoal text-white"
                        : "bg-blush-50 text-charcoal-light hover:bg-blush-100"
                    }`}
                  >
                    {marcada && <Check size={13} />}
                    {o.etiqueta}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PasoCoach({
  r,
  set,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
}) {
  return (
    <div>
      <Titulo
        texto="Tu coach"
        ayuda="La parte que más ilusión me hace leer, y la que mejor me ayuda a afinar cómo te enseño."
      />
      <AreaTexto pregunta={PREGUNTA_COACH} r={r} set={set} filas={6} />
    </div>
  );
}

function AreaTexto({
  pregunta,
  r,
  set,
  filas = 3,
}: {
  pregunta: { campo: string; titulo: string; ayuda: string; placeholder: string };
  r: Respuestas;
  set: (c: string, v: any) => void;
  filas?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-charcoal">
        {pregunta.titulo}
      </label>
      <p className="mb-2 mt-0.5 text-xs text-charcoal-lighter">{pregunta.ayuda}</p>
      <textarea
        value={r[pregunta.campo] || ""}
        onChange={(e) => set(pregunta.campo, e.target.value)}
        placeholder={pregunta.placeholder}
        rows={filas}
        maxLength={3000}
        className="w-full resize-y rounded-xl border border-blush-100 bg-blush-50/40 px-4 py-3 text-sm leading-relaxed outline-none transition-colors focus:border-blush-300"
      />
    </div>
  );
}

function PasoVideo({
  r,
  set,
  subiendo,
  nombreVideo,
  onSubir,
  onQuitar,
}: {
  r: Respuestas;
  set: (c: string, v: any) => void;
  subiendo: boolean;
  nombreVideo: string;
  onSubir: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onQuitar: () => void;
}) {
  return (
    <div>
      <Titulo
        texto="¿Me lo cuentas en vídeo?"
        ayuda="30 segundos con el móvil, sin producción ni guion. Es lo que más ilusión me hace recibir."
      />

      <div className="rounded-2xl bg-blush-50/60 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal-lighter">
          Si no sabes por dónde empezar
        </p>
        <ul className="mt-3 space-y-2 text-sm text-charcoal-light">
          <li>· Cómo llegaste a The Heels y cómo te sentías al principio.</li>
          <li>· Qué es lo que más te gusta de las clases.</li>
          <li>· Qué has conseguido desde entonces.</li>
          <li>· Qué le dirías a alguien que se lo está pensando.</li>
        </ul>
      </div>

      {r.videoPath ? (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-blush-200 bg-white px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blush-100">
              <Check size={16} className="text-blush-700" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-charcoal">Vídeo subido</p>
              <p className="truncate text-xs text-charcoal-lighter">
                {nombreVideo}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onQuitar}
            className="flex-shrink-0 p-2 text-charcoal-lighter transition-colors hover:text-red-500"
            aria-label="Quitar el vídeo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <label
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blush-200 px-6 py-10 text-center transition-colors hover:border-blush-400 hover:bg-blush-50/40 ${
            subiendo ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <input
            type="file"
            accept="video/*"
            onChange={onSubir}
            className="hidden"
            disabled={subiendo}
          />
          {subiendo ? (
            <>
              <Loader2 size={26} className="animate-spin text-blush-500" />
              <p className="mt-3 text-sm font-medium text-charcoal">
                Subiendo tu vídeo…
              </p>
              <p className="mt-1 text-xs text-charcoal-lighter">
                No cierres esta pantalla.
              </p>
            </>
          ) : (
            <>
              <Video size={26} className="text-blush-500" />
              <p className="mt-3 text-sm font-medium text-charcoal">
                Grabar o subir un vídeo
              </p>
              <p className="mt-1 text-xs text-charcoal-lighter">
                Máximo {Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB · MP4,
                MOV o WEBM
              </p>
              <p className="mt-1 text-xs text-charcoal-lighter">
                Con la calidad normal de la cámara va perfecto. Si grabas en 4K
                puede que no quepa.
              </p>
            </>
          )}
        </label>
      )}

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-blush-50/60 px-5 py-4">
        <input
          type="checkbox"
          checked={r.allowPublish !== false}
          onChange={(e) => set("allowPublish", e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blush-500"
        />
        <span className="text-sm leading-relaxed text-charcoal-light">
          Autorizo a The Heels a publicar mi testimonio y mi vídeo en su web y
          redes sociales. Si desmarcas esta casilla lo guardo sólo para uso interno,
          y puedes pedirme que lo borre cuando quieras.
        </span>
      </label>
    </div>
  );
}

function Gracias({ conVideo }: { conVideo: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-soft px-5 py-16">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blush-100">
          <Heart size={26} className="text-blush-600" />
        </span>
        <h1 className="mt-8 font-heading text-3xl font-light text-charcoal md:text-4xl">
          Gracias de verdad
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal-light">
          {conVideo
            ? "Ya tengo tu vídeo y tus respuestas. Voy a verlo con una sonrisa enorme, te lo aseguro."
            : "Ya tengo tus respuestas. Me las leo todas, una por una."}{" "}
          Lo que me has contado me sirve para seguir afinando las clases.
        </p>
        <a
          href="/"
          className="mt-10 inline-flex items-center justify-center rounded-full bg-blush-300 px-8 py-3 text-sm font-medium text-charcoal transition-colors hover:bg-blush-400"
        >
          Volver a The Heels
        </a>
      </div>
    </main>
  );
}

function Campo({
  etiqueta,
  opcional,
  children,
}: {
  etiqueta: string;
  opcional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-charcoal">
        {etiqueta}
        {opcional && (
          <span className="ml-2 text-xs font-normal text-charcoal-lighter">
            opcional
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function Opciones({
  opciones,
  valor,
  onChange,
}: {
  opciones: readonly { valor: string; etiqueta: string }[];
  valor?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activa = valor === o.valor;
        return (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            className={`rounded-full px-4 py-2 text-sm transition-all ${
              activa
                ? "bg-charcoal text-white"
                : "bg-blush-50 text-charcoal-light hover:bg-blush-100"
            }`}
          >
            {o.etiqueta}
          </button>
        );
      })}
    </div>
  );
}

function Estrellas({
  valor,
  onChange,
}: {
  valor?: number;
  onChange: (n: number) => void;
}) {
  const [encima, setEncima] = useState(0);
  const activas = encima || valor || 0;

  return (
    <div className="flex flex-shrink-0 gap-1" onMouseLeave={() => setEncima(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setEncima(n)}
          aria-label={`${n} de 5`}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            size={24}
            className={
              n <= activas
                ? "fill-blush-400 text-blush-400"
                : "fill-transparent text-blush-200"
            }
          />
        </button>
      ))}
    </div>
  );
}
