"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Video, Clock, Users, Phone, AlertCircle } from "lucide-react";
import { FEDERACIONES, CATEGORIAS } from "@/lib/masterclass";
import {
  MODALIDADES,
  EXPERIENCIA_TACON,
  FRANJAS,
  COHORTES,
  ESTADOS_SOLICITUD,
  PROGRAMA,
  etiquetaDe,
} from "@/lib/programa";

type Solicitud = any;

const COLOR_ESTADO: Record<string, string> = {
  NUEVA: "bg-amber-50 text-amber-700 border-amber-200",
  CONTACTADA: "bg-sky-50 text-sky-700 border-sky-200",
  LLAMADA: "bg-blush-50 text-blush-700 border-blush-200",
  ADMITIDA: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PAGADA: "bg-emerald-100 text-emerald-800 border-emerald-300",
  DESCARTADA: "bg-slate-50 text-slate-500 border-slate-200",
};

export default function SolicitudesAdminPage() {
  const [datos, setDatos] = useState<{ solicitudes: Solicitud[]; metricas: any } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("TODAS");
  const [abierta, setAbierta] = useState<string | null>(null);

  const cargar = async () => {
    try {
      const res = await fetch("/api/admin/solicitudes");
      if (!res.ok) throw new Error("No se han podido cargar las solicitudes");
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

  const visibles = useMemo(() => {
    if (!datos) return [];
    if (filtro === "TODAS") return datos.solicitudes;
    return datos.solicitudes.filter((s) => s.status === filtro);
  }, [datos, filtro]);

  const actualizar = async (id: string, cambios: Record<string, any>) => {
    await fetch("/api/admin/solicitudes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...cambios }),
    });
    cargar();
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-32 text-charcoal-lighter">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const m = datos!.metricas;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-3xl text-charcoal">Solicitudes</h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          {PROGRAMA.nombre} · {PROGRAMA.plazasPorGrupo} plazas por grupo
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metrica icono={Users} valor={m.total} etiqueta="Solicitudes" nota="En total" />
        <Metrica
          icono={Phone}
          valor={m.porEstado.LLAMADA || 0}
          etiqueta="Llamadas hechas"
          nota={m.cierreLlamada !== null ? `${m.cierreLlamada}% de cierre` : "—"}
        />
        <Metrica
          icono={Users}
          valor={m.porEstado.PAGADA || 0}
          etiqueta="Pagadas"
          nota="Plaza confirmada"
        />
        <Metrica
          icono={AlertCircle}
          valor={m.sinVideo}
          etiqueta="Sin vídeo"
          nota="No se les puede valorar"
        />
      </div>

      {/* Plazas por cohorte */}
      <div className="card-flat">
        <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter mb-4">
          Plazas ocupadas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(COHORTES).map(([clave, c]) => {
            const ocupadas = m.plazas[clave] || 0;
            return (
              <div key={clave} className="flex items-baseline justify-between text-sm">
                <span className="text-charcoal-light">
                  {c.etiqueta} · {c.arranca}
                </span>
                <span className="font-semibold text-charcoal">
                  {ocupadas} / {PROGRAMA.plazasPorGrupo}
                  {ocupadas < 4 && (
                    <span className="text-xs text-amber-700 font-normal ml-2">
                      mínimo 4 para arrancar
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {[{ valor: "TODAS", etiqueta: "Todas" }, ...ESTADOS_SOLICITUD].map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`px-4 py-2 rounded-full text-xs tracking-wide uppercase border transition-colors ${
              filtro === f.valor
                ? "bg-blush-300 border-blush-300 text-charcoal"
                : "bg-white border-blush-100 text-charcoal-lighter hover:border-blush-200"
            }`}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <p className="text-sm text-charcoal-lighter py-12 text-center">
          No hay solicitudes en este filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {visibles.map((s) => (
            <Ficha
              key={s.id}
              s={s}
              abierta={abierta === s.id}
              alAbrir={() => setAbierta(abierta === s.id ? null : s.id)}
              alActualizar={actualizar}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Ficha({
  s,
  abierta,
  alAbrir,
  alActualizar,
}: {
  s: Solicitud;
  abierta: boolean;
  alAbrir: () => void;
  alActualizar: (id: string, cambios: Record<string, any>) => void;
}) {
  const [notas, setNotas] = useState(s.callNotes || "");

  return (
    <div className="bg-white rounded-2xl border border-blush-50 overflow-hidden">
      <button
        onClick={alAbrir}
        className="w-full flex flex-wrap items-center gap-4 p-5 text-left hover:bg-blush-50/30 transition-colors"
      >
        <div className="min-w-[180px] flex-1">
          <p className="font-semibold text-charcoal">{s.name}</p>
          <p className="text-xs text-charcoal-lighter">
            {s.email} · {s.phone}
          </p>
        </div>

        <div className="text-xs text-charcoal-light min-w-[150px]">
          {etiquetaDe(CATEGORIAS, s.category)} ·{" "}
          {etiquetaDe(MODALIDADES, s.modality)}
          <br />
          <span className="text-charcoal-lighter">
            {s.semanas !== null
              ? `A ${s.semanas} semanas de su tarima`
              : "Sin fecha de competición"}
          </span>
        </div>

        {s.videoPath ? (
          <span className="badge bg-blush-50 text-blush-700 border border-blush-200">
            <Video size={11} className="mr-1.5" />
            Vídeo
          </span>
        ) : (
          <span className="badge bg-slate-50 text-slate-500 border border-slate-200">
            Sin vídeo
          </span>
        )}

        <span className={`badge border ${COLOR_ESTADO[s.status]}`}>
          {etiquetaDe(ESTADOS_SOLICITUD, s.status)}
        </span>
      </button>

      {abierta && (
        <div className="border-t border-blush-50 p-5 space-y-6 bg-blush-50/20">
          {/* Vídeos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { url: s.videoUrl, titulo: "Posing actual" },
              { url: s.competitionVideoUrl, titulo: "Última competición" },
            ]
              .filter((v) => v.url)
              .map((v) => (
                <div key={v.titulo}>
                  <p className="text-xs tracking-wide uppercase text-charcoal-lighter mb-2">
                    {v.titulo}
                  </p>
                  <video
                    src={v.url}
                    controls
                    className="w-full rounded-xl bg-charcoal"
                  />
                </div>
              ))}
          </div>

          {/* Datos de la ficha */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Dato titulo="Edad" valor={s.age ? String(s.age) : "—"} />
            <Dato titulo="Federación" valor={etiquetaDe(FEDERACIONES, s.federation)} />
            <Dato
              titulo="Competición"
              valor={
                s.competitionDate
                  ? new Date(s.competitionDate).toLocaleDateString("es-ES")
                  : "—"
              }
            />
            <Dato titulo="Sede" valor={s.competitionVenue || "—"} />
            <Dato titulo="La prepara" valor={s.preparedBy || "—"} />
            <Dato
              titulo="Tacón"
              valor={etiquetaDe(EXPERIENCIA_TACON, s.heelExperience)}
            />
            <Dato
              titulo="Disponibilidad"
              valor={
                (s.availability || [])
                  .map((f: string) => etiquetaDe(FRANJAS, f))
                  .join(", ") || "—"
              }
            />
            <Dato titulo="Canal" valor={s.utmSource || "directo"} />
          </div>

          {[
            { titulo: "Competiciones anteriores", valor: s.previousCompetitions },
            { titulo: "Lesiones o limitaciones", valor: s.injuries },
            { titulo: "Qué le da más miedo", valor: s.biggestFear },
            { titulo: "Objetivo de la temporada", valor: s.seasonGoal },
          ]
            .filter((b) => b.valor)
            .map((b) => (
              <div key={b.titulo}>
                <p className="text-xs tracking-wide uppercase text-charcoal-lighter mb-1.5">
                  {b.titulo}
                </p>
                <p className="text-sm text-charcoal-light whitespace-pre-wrap bg-white rounded-xl border border-blush-50 px-4 py-3">
                  {b.valor}
                </p>
              </div>
            ))}

          {/* Notas de la llamada */}
          <div>
            <p className="text-xs tracking-wide uppercase text-charcoal-lighter mb-1.5">
              Las tres cosas que ves en su vídeo
            </p>
            <textarea
              className="input min-h-[90px] resize-none"
              placeholder="Lo que le vas a decir en la llamada. Tres, no más: de ahí salen sus tres puntos prioritarios de las doce semanas."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              onBlur={() => {
                if (notas !== (s.callNotes || "")) {
                  alActualizar(s.id, { callNotes: notas });
                }
              }}
            />
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="input-label">Estado</p>
              <select
                value={s.status}
                onChange={(e) => alActualizar(s.id, { status: e.target.value })}
                className="input !w-auto !py-2 text-xs"
              >
                {ESTADOS_SOLICITUD.map((e) => (
                  <option key={e.valor} value={e.valor}>
                    {e.etiqueta}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="input-label">Cohorte</p>
              <select
                value={s.cohort || ""}
                onChange={(e) =>
                  alActualizar(s.id, { cohort: e.target.value || null })
                }
                className="input !w-auto !py-2 text-xs"
              >
                <option value="">Sin asignar</option>
                {Object.entries(COHORTES).map(([clave, c]) => (
                  <option key={clave} value={clave}>
                    {c.etiqueta} · {c.arranca}
                  </option>
                ))}
              </select>
            </div>

            <a
              href={`https://wa.me/${String(s.phone).replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary !py-2 gap-2 text-xs"
            >
              <Phone size={13} />
              WhatsApp
            </a>

            <span className="text-xs text-charcoal-lighter inline-flex items-center gap-1.5 ml-auto">
              <Clock size={12} />
              {new Date(s.createdAt).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <p className="text-[10px] tracking-wide uppercase text-charcoal-lighter">
        {titulo}
      </p>
      <p className="text-sm text-charcoal-light mt-0.5">{valor}</p>
    </div>
  );
}

function Metrica({
  icono: Icono,
  valor,
  etiqueta,
  nota,
}: {
  icono: any;
  valor: number;
  etiqueta: string;
  nota: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-blush-50 p-5">
      <Icono size={16} className="text-blush-500 mb-3" />
      <p className="text-3xl font-heading font-bold text-charcoal leading-none">
        {valor}
      </p>
      <p className="text-xs text-charcoal-light mt-2">{etiqueta}</p>
      <p className="text-[10px] text-charcoal-lighter mt-0.5">{nota}</p>
    </div>
  );
}
