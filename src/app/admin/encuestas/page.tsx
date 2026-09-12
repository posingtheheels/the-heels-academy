"use client";

import { useEffect, useState } from "react";
import {
  Star,
  Video,
  Loader2,
  Trash2,
  X,
  Check,
  Copy,
  MessageCircle,
  Sparkles,
  Users,
  TrendingUp,
  AlertCircle,
  ImageOff,
  Images,
} from "lucide-react";
import {
  VALORACIONES,
  CAMPOS_TEXTO,
  ANTIGUEDADES,
  MODALIDADES,
  CANALES,
  MULTIPLES,
} from "@/lib/encuesta";

type Encuesta = any;

/** Mensaje que la academia pega en WhatsApp. {enlace} se sustituye al copiar. */
const PLANTILLAS = [
  {
    id: "general",
    titulo: "Envío general",
    texto:
      "¡Hola {nombre}! 👠\n\n" +
      "Estoy preparando la nueva temporada de The Heels y quiero que salga a tu medida, así que voy a preguntarte directamente a ti.\n\n" +
      "Son 2 minutos, se contesta desde el móvil y puedes dejarlo en anónimo si quieres:\n{enlace}\n\n" +
      "Y si te apetece, al final hay un botón para grabarme un vídeo de 30 segundos contándome qué tal te va. Me hace una ilusión enorme verlos. 🤍\n\n" +
      "Gracias por estar ahí.",
  },
  {
    id: "post-campeonato",
    titulo: "Después de un campeonato",
    texto:
      "¡{nombre}! 🏆\n\n" +
      "Todavía estoy con la emoción de verte sobre la tarima. Ahora que lo tienes fresco, cuéntame cómo lo viviste y qué tal te preparé para ese momento.\n\n" +
      "Son 2 minutos: {enlace}\n\n" +
      "Si te grabas un vídeo contándolo, lo guardo como oro. 🤍",
  },
  {
    id: "antiguas",
    titulo: "Alumnas que ya no vienen",
    texto:
      "Hola {nombre} 🤍\n\n" +
      "Hace tiempo que no te veo por The Heels y me acuerdo mucho de ti. Me encantaría saber qué te llevaste de aquella etapa y qué podría hacer mejor.\n\n" +
      "Son 2 minutos y me ayuda muchísimo: {enlace}\n\n" +
      "Gracias por el ratito. Aquí tienes tu sitio siempre que quieras volver.",
  },
  {
    id: "recordatorio",
    titulo: "Recordatorio suave",
    texto:
      "¡Hola {nombre}! Te dejo por aquí otra vez el cuestionario, por si se te quedó a medias entre entrenos 😅\n\n" +
      "{enlace}\n\n" +
      "Dos minutos y me ayudas un montón. ¡Gracias! 🤍",
  },
];

export default function EncuestasAdminPage() {
  const [datos, setDatos] = useState<{ encuestas: Encuesta[]; metricas: any } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [abierta, setAbierta] = useState<Encuesta | null>(null);
  const [filtro, setFiltro] = useState<"TODAS" | "NUEVA" | "VIDEO" | "FOTOS" | "PUBLICABLE">("TODAS");
  const [plantilla, setPlantilla] = useState(PLANTILLAS[0]);
  const [copiado, setCopiado] = useState(false);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/encuestas");
      if (!res.ok) throw new Error("No se han podido cargar las encuestas");
      setDatos(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const copiarMensaje = async () => {
    const enlace =
      typeof window !== "undefined" ? `${window.location.origin}/encuesta` : "/encuesta";
    const texto = plantilla.texto.replace("{enlace}", enlace);
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      alert("No se ha podido copiar. Selecciona el texto a mano.");
    }
  };

  const encuestas = (datos?.encuestas || []).filter((e) => {
    if (filtro === "NUEVA") return e.status === "NUEVA";
    if (filtro === "VIDEO") return !!e.videoPath;
    if (filtro === "FOTOS") return !!e.beforePhotoPath || !!e.afterPhotoPath;
    if (filtro === "PUBLICABLE") return e.allowPublish && e.status !== "PUBLICADA";
    return true;
  });

  const m = datos?.metricas;

  return (
    <div className="max-w-5xl">
      <header className="mb-8">
        <h1 className="font-heading text-3xl font-light text-charcoal">Encuestas</h1>
        <p className="mt-1 text-sm text-charcoal-lighter">
          Lo que contestan tus alumnas al cuestionario que envías por WhatsApp.
        </p>
      </header>

      {/* Mensaje de WhatsApp */}
      <section className="mb-8 rounded-2xl border border-blush-100 bg-white p-5 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle size={16} className="text-blush-500" />
          <h2 className="text-sm font-medium text-charcoal">Mensaje para WhatsApp</h2>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {PLANTILLAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPlantilla(p)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-colors ${
                plantilla.id === p.id
                  ? "bg-charcoal text-white"
                  : "bg-blush-50 text-charcoal-light hover:bg-blush-100"
              }`}
            >
              {p.titulo}
            </button>
          ))}
        </div>

        <pre className="whitespace-pre-wrap rounded-xl bg-blush-50/60 p-4 font-body text-sm leading-relaxed text-charcoal-light">
          {plantilla.texto.replace(
            "{enlace}",
            typeof window !== "undefined" ? `${window.location.origin}/encuesta` : "/encuesta"
          )}
        </pre>

        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={copiarMensaje}
            className="inline-flex items-center gap-2 rounded-full bg-blush-300 px-5 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-blush-400"
          >
            {copiado ? <Check size={15} /> : <Copy size={15} />}
            {copiado ? "Copiado" : "Copiar mensaje"}
          </button>
          <p className="text-xs text-charcoal-lighter">
            Cambia <span className="font-mono">{"{nombre}"}</span> por el de cada alumna antes de enviarlo.
          </p>
        </div>
      </section>

      {cargando ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-blush-400" />
        </div>
      ) : error ? (
        <p className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </p>
      ) : (
        <>
          {/* Métricas */}
          <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tarjeta icono={Users} valor={m.total} etiqueta="Respuestas" />
            <Tarjeta icono={Sparkles} valor={m.sinLeer} etiqueta="Sin leer" />
            <Tarjeta icono={Video} valor={m.conVideo} etiqueta="Con vídeo" />
            <Tarjeta
              icono={TrendingUp}
              valor={m.nps === null ? "—" : m.nps}
              etiqueta={`NPS (${m.npsRespuestas} respuestas)`}
            />
          </section>

          {m.total > 0 && (
            <section className="mb-8 rounded-2xl border border-blush-100 bg-white p-5 shadow-card">
              <h2 className="mb-5 text-sm font-medium text-charcoal">Medias por apartado</h2>
              <div className="space-y-3">
                {VALORACIONES.map((v) => {
                  const nota = m.medias[v.campo];
                  return (
                    <div key={v.campo} className="flex items-center gap-4">
                      <span className="w-44 flex-shrink-0 text-xs text-charcoal-light">
                        {v.titulo}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-blush-50">
                        <div
                          className="h-full rounded-full bg-blush-400 transition-all"
                          style={{ width: nota ? `${(nota / 5) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-10 flex-shrink-0 text-right text-xs font-medium text-charcoal">
                        {nota ?? "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(m.canales.length > 0 || m.seleccionesMultiples.length > 0) && (
            <section className="mb-8 grid gap-3 lg:grid-cols-3">
              {m.canales.length > 0 && (
                <Recuento titulo="Cómo me conocieron" opciones={m.canales} total={m.total} />
              )}
              {m.seleccionesMultiples.map((grupo: any) => (
                <Recuento
                  key={grupo.titulo}
                  titulo={grupo.titulo}
                  opciones={grupo.opciones}
                  total={m.total}
                />
              ))}
            </section>
          )}

          {/* Filtros */}
          <div className="mb-4 flex flex-wrap gap-2">
            {[
              { v: "TODAS", t: `Todas (${datos!.encuestas.length})` },
              { v: "NUEVA", t: `Sin leer (${m.sinLeer})` },
              { v: "VIDEO", t: `Con vídeo (${m.conVideo})` },
              { v: "FOTOS", t: `Con fotos (${m.conFotos})` },
              { v: "PUBLICABLE", t: "Listas para publicar" },
            ].map((f) => (
              <button
                key={f.v}
                onClick={() => setFiltro(f.v as any)}
                className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                  filtro === f.v
                    ? "bg-charcoal text-white"
                    : "bg-blush-50 text-charcoal-light hover:bg-blush-100"
                }`}
              >
                {f.t}
              </button>
            ))}
          </div>

          {/* Listado */}
          {encuestas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-blush-200 py-16 text-center text-sm text-charcoal-lighter">
              Todavía no hay respuestas aquí.
            </p>
          ) : (
            <div className="space-y-2">
              {encuestas.map((e) => (
                <Fila key={e.id} encuesta={e} onAbrir={() => setAbierta(e)} />
              ))}
            </div>
          )}
        </>
      )}

      {abierta && (
        <Detalle
          id={abierta.id}
          onCerrar={() => setAbierta(null)}
          onCambio={() => {
            setAbierta(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}

function Tarjeta({ icono: Icono, valor, etiqueta }: any) {
  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-4 shadow-card">
      <Icono size={16} className="text-blush-400" />
      <p className="mt-3 font-heading text-3xl font-light text-charcoal">{valor}</p>
      <p className="mt-0.5 text-xs text-charcoal-lighter">{etiqueta}</p>
    </div>
  );
}

/**
 * Una foto de la comparativa.
 *
 * Si no carga, ofrece descargarla en vez de dejar un hueco roto: el iPhone sube
 * HEIC y Chrome no sabe dibujarlo, pero el archivo está bien y se abre sin
 * problema desde el ordenador.
 */
function Foto({ url, pie }: { url: string | null; pie: string }) {
  const [falla, setFalla] = useState(false);

  if (!url) {
    return (
      <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-blush-200 text-xs text-charcoal-lighter">
        Sin foto de «{pie.toLowerCase()}»
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-2xl border border-blush-100">
      {falla ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-56 flex-col items-center justify-center gap-2 bg-blush-50 px-4 text-center text-xs text-charcoal-light hover:bg-blush-100"
        >
          <ImageOff size={20} className="text-blush-500" />
          El navegador no puede mostrarla (HEIC de iPhone).
          <span className="font-medium underline">Descargar</span>
        </a>
      ) : (
        <a href={url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={pie}
            onError={() => setFalla(true)}
            className="h-56 w-full bg-blush-50 object-cover"
          />
        </a>
      )}
      <figcaption className="bg-white px-3 py-2 text-xs text-charcoal-lighter">
        {pie}
      </figcaption>
    </figure>
  );
}

/** Barra de recuentos para las preguntas cerradas. */
function Recuento({
  titulo,
  opciones,
  total,
}: {
  titulo: string;
  opciones: { etiqueta: string; veces: number }[];
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-blush-100 bg-white p-5 shadow-card">
      <h3 className="mb-4 text-sm font-medium text-charcoal">{titulo}</h3>
      <div className="space-y-2.5">
        {opciones.map((o) => (
          <div key={o.etiqueta}>
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <span className="text-xs text-charcoal-light">{o.etiqueta}</span>
              <span className="flex-shrink-0 text-xs font-medium text-charcoal">
                {o.veces}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-blush-50">
              <div
                className="h-full rounded-full bg-blush-400"
                style={{ width: total ? `${(o.veces / total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Fila({ encuesta: e, onAbrir }: { encuesta: Encuesta; onAbrir: () => void }) {
  const fecha = new Date(e.createdAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <button
      onClick={onAbrir}
      className="flex w-full items-center gap-4 rounded-2xl border border-blush-100 bg-white px-5 py-4 text-left shadow-card transition-colors hover:border-blush-300"
    >
      {e.status === "NUEVA" && (
        <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blush-500" />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-charcoal">
          {e.name || "Anónima"}
          {e.status === "PUBLICADA" && (
            <span className="ml-2 rounded-full bg-blush-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-blush-700">
              publicada
            </span>
          )}
        </p>
        <p className="truncate text-xs text-charcoal-lighter">
          {e.oneLiner || e.bestPart || e.proudMoment || "Sin comentarios escritos"}
        </p>
      </div>

      {e.videoPath && <Video size={15} className="flex-shrink-0 text-blush-500" />}

      {(e.beforePhotoPath || e.afterPhotoPath) && (
        <Images size={15} className="flex-shrink-0 text-blush-500" />
      )}

      {typeof e.ratingOverall === "number" && (
        <span className="flex flex-shrink-0 items-center gap-1 text-xs text-charcoal">
          <Star size={13} className="fill-blush-400 text-blush-400" />
          {e.ratingOverall}
        </span>
      )}

      <span className="hidden flex-shrink-0 text-xs text-charcoal-lighter sm:block">
        {fecha}
      </span>
    </button>
  );
}

function Detalle({
  id,
  onCerrar,
  onCambio,
}: {
  id: string;
  onCerrar: () => void;
  onCambio: () => void;
}) {
  const [e, setE] = useState<Encuesta | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [testimonio, setTestimonio] = useState("");
  const [rol, setRol] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/encuestas/${id}`);
      const data = await res.json();
      setE(data);
      setTestimonio(data.oneLiner || data.bestPart || "");
      // Al abrirla deja de estar "sin leer": si no, el contador de pendientes
      // nunca bajaría y dejaría de servir para nada.
      if (data.status === "NUEVA") {
        fetch(`/api/admin/encuestas/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "LEIDA" }),
        });
      }
    })();
  }, [id]);

  const publicar = async () => {
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/encuestas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accion: "publicar", message: testimonio, role: rol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCambio();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    if (!confirm("¿Borrar esta respuesta y su vídeo? No se puede deshacer.")) return;
    setGuardando(true);
    try {
      const res = await fetch(`/api/admin/encuestas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se ha podido borrar");
      onCambio();
    } catch (err: any) {
      alert(err.message);
      setGuardando(false);
    }
  };

  const etiqueta = (lista: readonly { valor: string; etiqueta: string }[], v?: string) =>
    lista.find((o) => o.valor === v)?.etiqueta;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
      <div className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-elegant md:p-8">
        {!e ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-blush-400" />
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-light text-charcoal">
                  {e.name || "Anónima"}
                </h2>
                <p className="mt-1 text-xs text-charcoal-lighter">
                  {new Date(e.createdAt).toLocaleString("es-ES")}
                  {e.phone && ` · ${e.phone}`}
                  {etiqueta(ANTIGUEDADES, e.seniority) &&
                    ` · ${etiqueta(ANTIGUEDADES, e.seniority)}`}
                  {etiqueta(MODALIDADES, e.modality) &&
                    ` · ${etiqueta(MODALIDADES, e.modality)}`}
                  {etiqueta(CANALES, e.discovery) &&
                    ` · me conoció por ${etiqueta(CANALES, e.discovery)}`}
                </p>
              </div>
              <button
                onClick={onCerrar}
                className="p-1 text-charcoal-lighter transition-colors hover:text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            {e.videoUrl && (
              <video
                src={e.videoUrl}
                controls
                playsInline
                className="mb-6 w-full rounded-2xl bg-black"
              />
            )}

            {(e.beforePhotoUrl || e.afterPhotoUrl) && (
              <div className="mb-6">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-charcoal-lighter">
                  Antes y ahora
                  {e.photosGap && (
                    <span className="ml-2 normal-case tracking-normal text-charcoal-light">
                      · {e.photosGap}
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Foto url={e.beforePhotoUrl} pie="Antes" />
                  <Foto url={e.afterPhotoUrl} pie="Ahora" />
                </div>
              </div>
            )}

            {typeof e.nps === "number" && (
              <p className="mb-5 rounded-xl bg-blush-50 px-4 py-3 text-sm text-charcoal-light">
                Nos recomendaría con un <strong className="text-charcoal">{e.nps}/10</strong>
              </p>
            )}

            <div className="mb-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {VALORACIONES.filter((v) => e[v.campo]).map((v) => (
                <div
                  key={v.campo}
                  className="flex items-center justify-between rounded-xl bg-blush-50/60 px-3 py-2"
                >
                  <span className="text-xs text-charcoal-light">{v.titulo}</span>
                  <span className="flex items-center gap-1 text-xs font-medium text-charcoal">
                    <Star size={12} className="fill-blush-400 text-blush-400" />
                    {e[v.campo]}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-5">
              {CAMPOS_TEXTO.filter((p) => e[p.campo]).map((p) => (
                <div key={p.campo}>
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-lighter">
                    {p.titulo}
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-charcoal-light">
                    {e[p.campo]}
                  </p>
                </div>
              ))}
            </div>

            {MULTIPLES.map((grupo) => {
              const marcadas = (e[grupo.campo] || []) as string[];
              if (!marcadas.length) return null;
              return (
                <div key={grupo.campo} className="mt-6">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal-lighter">
                    {grupo.titulo}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {grupo.opciones
                      .filter((o) => marcadas.indexOf(o.valor) !== -1)
                      .map((o) => (
                        <span
                          key={o.valor}
                          className="rounded-full bg-blush-50 px-3 py-1 text-xs text-charcoal-light"
                        >
                          {o.etiqueta}
                        </span>
                      ))}
                  </div>
                </div>
              );
            })}

            {/* Publicar como testimonio */}
            <div className="mt-8 rounded-2xl border border-blush-100 bg-blush-50/40 p-5">
              {e.status === "PUBLICADA" ? (
                <p className="flex items-center gap-2 text-sm text-charcoal-light">
                  <Check size={15} className="text-blush-600" />
                  Ya está publicada como testimonio en la web.
                </p>
              ) : !e.allowPublish ? (
                <p className="flex items-start gap-2 text-sm text-charcoal-light">
                  <AlertCircle size={15} className="mt-0.5 flex-shrink-0 text-charcoal-lighter" />
                  No dio permiso para publicar su respuesta. Úsala sólo internamente.
                </p>
              ) : (
                <>
                  <p className="mb-3 text-sm font-medium text-charcoal">
                    Publicar como testimonio
                  </p>
                  <textarea
                    value={testimonio}
                    onChange={(ev) => setTestimonio(ev.target.value)}
                    rows={3}
                    placeholder="Texto que se verá en la web"
                    className="w-full resize-y rounded-xl border border-blush-100 bg-white px-4 py-3 text-sm outline-none focus:border-blush-300"
                  />
                  <input
                    type="text"
                    value={rol}
                    onChange={(ev) => setRol(ev.target.value)}
                    placeholder="Debajo del nombre: “Bikini Fitness”, “Alumna desde 2024”…"
                    className="mt-2 w-full rounded-xl border border-blush-100 bg-white px-4 py-2.5 text-sm outline-none focus:border-blush-300"
                  />
                  <button
                    onClick={publicar}
                    disabled={guardando || !testimonio.trim()}
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-charcoal-darkest disabled:opacity-50"
                  >
                    {guardando ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    Publicar en la web
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={borrar}
                disabled={guardando}
                className="inline-flex items-center gap-2 text-xs text-charcoal-lighter transition-colors hover:text-red-500 disabled:opacity-50"
              >
                <Trash2 size={14} />
                Borrar respuesta y vídeo
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
