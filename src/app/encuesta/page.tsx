"use client";

import { useMemo, useState } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Video,
  Image as ImageIcon,
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
  FOTOS,
  MAX_VIDEO_BYTES,
  TIPOS_VIDEO,
  MAX_FOTO_BYTES,
  TIPOS_FOTO,
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
  { id: "fotos", etiqueta: "Antes y ahora" },
  { id: "video", etiqueta: "Tu vídeo" },
];

type Respuestas = Record<string, any>;

export default function EncuestaPage() {
  const [paso, setPaso] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  // Qué campo se está subiendo ahora mismo, y el nombre del archivo de cada uno.
  // Van por campo y no con un booleano suelto porque hay tres ranuras (vídeo,
  // foto de antes, foto de ahora) y el spinner tiene que salir sólo en la suya.
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [nombres, setNombres] = useState<Record<string, string>>({});
  // Miniatura local de cada foto. Sale de URL.createObjectURL, no del bucket:
  // asi se ve al instante y sin gastar una peticion firmada.
  const [previos, setPrevios] = useState<Record<string, string>>({});
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

  /**
   * Sube un archivo y deja su ruta en el campo indicado.
   *
   * El archivo no viaja al servidor: se pide una URL firmada y el navegador lo
   * manda directo a Supabase. La validación se repite aquí y en el servidor a
   * propósito: aquí para avisar antes de gastar datos del móvil, allí porque la
   * del navegador se puede saltar.
   */
  const subir = async (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "video" | "foto",
    campo: string
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");

    const esVideo = tipo === "video";
    const tiposOk = esVideo ? TIPOS_VIDEO : TIPOS_FOTO;
    const maximo = esVideo ? MAX_VIDEO_BYTES : MAX_FOTO_BYTES;
    const mb = Math.round(maximo / (1024 * 1024));

    // Algunos móviles mandan el tipo vacío al elegir de la galería; en ese caso
    // dejamos que decida el servidor en vez de bloquear una subida válida.
    if (file.type && !tiposOk.includes(file.type)) {
      setError(
        esVideo
          ? "Ese formato de vídeo no me sirve. Graba con la cámara del móvil y vuelve a intentarlo."
          : "Ese formato de foto no me sirve. Sube una imagen normal (JPG o PNG) desde tu galería."
      );
      return;
    }
    if (file.size > maximo) {
      setError(
        esVideo
          ? `El vídeo pesa demasiado (máximo ${mb} MB). Graba uno más corto, o baja la calidad de la cámara si la tienes en 4K.`
          : `La foto pesa demasiado (máximo ${mb} MB). Prueba con otra.`
      );
      return;
    }

    setSubiendo(campo);
    try {
      const res = await fetch("/api/encuesta/subida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          contentType: file.type || (esVideo ? "video/mp4" : "image/jpeg"),
          size: file.size,
        }),
      });
      const firma = await res.json();
      if (!res.ok) throw new Error(firma.error || "No he podido preparar la subida.");

      const { error: errorSubida } = await supabase.storage
        .from(firma.bucket)
        .uploadToSignedUrl(firma.path, firma.token, file);

      if (errorSubida) throw errorSubida;

      set(campo, firma.path);
      setNombres((prev) => ({ ...prev, [campo]: file.name }));
      if (tipo === "foto") {
        setPrevios((prev) => ({ ...prev, [campo]: URL.createObjectURL(file) }));
      }
    } catch (err: any) {
      setError(
        err.message ||
          (esVideo
            ? "No he podido subir el vídeo. Inténtalo otra vez."
            : "No he podido subir la foto. Inténtalo otra vez.")
      );
    } finally {
      setSubiendo(null);
    }
  };

  /** Quita un archivo ya subido de su ranura. */
  const quitar = (campo: string) => {
    set(campo, null);
    if (previos[campo]) URL.revokeObjectURL(previos[campo]);
    setPrevios((prev) => {
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
    setNombres((prev) => {
      const copia = { ...prev };
      delete copia[campo];
      return copia;
    });
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
          {actual.id === "fotos" && (
            <PasoFotos
              r={r}
              set={set}
              subiendo={subiendo}
              nombres={nombres}
              previos={previos}
              onSubir={subir}
              onQuitar={quitar}
            />
          )}
          {actual.id === "video" && (
            <PasoVideo
              r={r}
              set={set}
              subiendo={subiendo}
              nombres={nombres}
              previos={previos}
              onSubir={subir}
              onQuitar={quitar}
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
                disabled={enviando || subiendo !== null}
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

type PropsSubida = {
  r: Respuestas;
  set: (c: string, v: any) => void;
  subiendo: string | null;
  nombres: Record<string, string>;
  previos: Record<string, string>;
  onSubir: (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "video" | "foto",
    campo: string
  ) => void;
  onQuitar: (campo: string) => void;
};

function PasoFotos({
  r,
  subiendo,
  nombres,
  previos,
  onSubir,
  onQuitar,
  set,
}: PropsSubida) {
  return (
    <div>
      <Titulo
        texto="Tu antes y ahora"
        ayuda="Si te apetece enseñar tu evolución, sube dos fotos. Como estén: no hacen falta ni luz de estudio ni bronceado de competición."
      />

      <div className="grid grid-cols-2 gap-3">
        {FOTOS.map((f) => (
          <Ranura
            key={f.campo}
            campo={f.campo}
            tipo="foto"
            titulo={f.titulo}
            ayuda={f.ayuda}
            valor={r[f.campo]}
            nombre={nombres[f.campo]}
            previo={previos[f.campo]}
            subiendo={subiendo === f.campo}
            bloqueada={subiendo !== null && subiendo !== f.campo}
            onSubir={onSubir}
            onQuitar={onQuitar}
          />
        ))}
      </div>

      {(r.beforePhotoPath || r.afterPhotoPath) && (
        <div className="mt-6">
          <label className="block text-sm font-medium text-charcoal">
            ¿Cuánto tiempo hay entre las dos?
          </label>
          <p className="mb-2 mt-0.5 text-xs text-charcoal-lighter">
            Es el dato que más impresiona cuando se ven juntas
          </p>
          <input
            type="text"
            value={r.photosGap || ""}
            onChange={(e) => set("photosGap", e.target.value)}
            placeholder="8 meses, un año, de 2024 a hoy…"
            maxLength={80}
            className="w-full rounded-xl border border-blush-100 bg-blush-50/40 px-4 py-3 text-sm outline-none transition-colors focus:border-blush-300"
          />
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 rounded-2xl bg-blush-50/60 px-5 py-4 text-xs leading-relaxed text-charcoal-light">
        <ShieldCheck size={14} className="mt-0.5 flex-shrink-0 text-blush-500" />
        Las fotos las veo sólo yo. No se publican en ningún sitio salvo que
        marques la casilla del paso siguiente, y aun así te preguntaría antes de
        usarlas.
      </p>
    </div>
  );
}

function PasoVideo({
  r,
  set,
  subiendo,
  nombres,
  previos,
  onSubir,
  onQuitar,
}: PropsSubida) {
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

      <div className="mt-6">
        <Ranura
          campo="videoPath"
          tipo="video"
          titulo="Grabar o subir un vídeo"
          ayuda={`Máximo ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))} MB · MP4, MOV o WEBM. Con la calidad normal de la cámara va perfecto; si grabas en 4K puede que no quepa.`}
          valor={r.videoPath}
          nombre={nombres.videoPath}
          previo={previos.videoPath}
          subiendo={subiendo === "videoPath"}
          bloqueada={subiendo !== null && subiendo !== "videoPath"}
          alta
          onSubir={onSubir}
          onQuitar={onQuitar}
        />
      </div>

      <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl bg-blush-50/60 px-5 py-4">
        <input
          type="checkbox"
          checked={r.allowPublish !== false}
          onChange={(e) => set("allowPublish", e.target.checked)}
          className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blush-500"
        />
        <span className="text-sm leading-relaxed text-charcoal-light">
          Autorizo a The Heels a publicar mi testimonio, mis fotos y mi vídeo en
          su web y redes sociales. Si desmarcas esta casilla lo guardo sólo para
          uso interno, y puedes pedirme que lo borre cuando quieras.
        </span>
      </label>
    </div>
  );
}

/** Una ranura de subida: vacía invita a elegir archivo, llena enseña qué hay. */
function Ranura({
  campo,
  tipo,
  titulo,
  ayuda,
  valor,
  nombre,
  previo,
  subiendo,
  bloqueada,
  alta,
  onSubir,
  onQuitar,
}: {
  campo: string;
  tipo: "video" | "foto";
  titulo: string;
  ayuda: string;
  valor?: string | null;
  nombre?: string;
  previo?: string;
  subiendo: boolean;
  bloqueada: boolean;
  alta?: boolean;
  onSubir: (
    e: React.ChangeEvent<HTMLInputElement>,
    tipo: "video" | "foto",
    campo: string
  ) => void;
  onQuitar: (campo: string) => void;
}) {
  const Icono = tipo === "video" ? Video : ImageIcon;

  if (valor) {
    return (
      <div className="overflow-hidden rounded-2xl border border-blush-200 bg-white">
        {previo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previo}
            alt={titulo}
            className="h-40 w-full bg-blush-50 object-cover"
          />
        ) : (
          <div className="flex h-20 items-center justify-center bg-blush-50">
            <Check size={22} className="text-blush-700" />
          </div>
        )}
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-charcoal">{titulo}</p>
            <p className="truncate text-xs text-charcoal-lighter">{nombre}</p>
          </div>
          <button
            type="button"
            onClick={() => onQuitar(campo)}
            className="flex-shrink-0 p-1.5 text-charcoal-lighter transition-colors hover:text-red-500"
            aria-label={`Quitar ${titulo}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blush-200 px-4 text-center transition-colors hover:border-blush-400 hover:bg-blush-50/40 ${
        alta ? "py-10" : "py-8"
      } ${subiendo || bloqueada ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        type="file"
        accept={tipo === "video" ? "video/*" : "image/*"}
        onChange={(e) => onSubir(e, tipo, campo)}
        className="hidden"
        disabled={subiendo || bloqueada}
      />
      {subiendo ? (
        <>
          <Loader2 size={24} className="animate-spin text-blush-500" />
          <p className="mt-3 text-sm font-medium text-charcoal">Subiendo…</p>
          <p className="mt-1 text-xs text-charcoal-lighter">
            No cierres esta pantalla.
          </p>
        </>
      ) : (
        <>
          <Icono size={24} className="text-blush-500" />
          <p className="mt-3 text-sm font-medium text-charcoal">{titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-charcoal-lighter">
            {ayuda}
          </p>
        </>
      )}
    </label>
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
