"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Download, Users, Video, ShoppingBag, Radio } from "lucide-react";
import {
  MASTERCLASS,
  FEDERACIONES,
  CATEGORIAS,
  CUANDO_COMPITES,
  ESTADOS,
  SEGMENTOS,
  etiquetaDe,
  segmentar,
  cohorteDe,
  COHORTES,
  type Segmento,
} from "@/lib/masterclass";

type Inscrita = any;

const FILTROS: { valor: "TODAS" | Segmento; etiqueta: string }[] = [
  { valor: "TODAS", etiqueta: "Todas" },
  { valor: "ENERO", etiqueta: SEGMENTOS.ENERO.etiqueta },
  { valor: "FEBRERO", etiqueta: SEGMENTOS.FEBRERO.etiqueta },
  { valor: "FRIO", etiqueta: SEGMENTOS.FRIO.etiqueta },
];

const COLOR_SEGMENTO: Record<Segmento, string> = {
  ENERO: "bg-amber-50 text-amber-700 border-amber-200",
  FEBRERO: "bg-blush-50 text-blush-700 border-blush-200",
  FRIO: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function MasterclassAdminPage() {
  const [datos, setDatos] = useState<{ inscritas: Inscrita[]; metricas: any } | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<"TODAS" | Segmento>("TODAS");

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch("/api/admin/masterclass");
      if (!res.ok) throw new Error("No se han podido cargar las inscripciones");
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
    if (filtro === "TODAS") return datos.inscritas;
    return datos.inscritas.filter((i) => segmentar(i.competeWhen) === filtro);
  }, [datos, filtro]);

  const cambiarEstado = async (id: string, status: string) => {
    await fetch("/api/admin/masterclass", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    cargar();
  };

  /**
   * Exporta lo que está filtrado, no todo. Es como se preparan los envíos
   * separados: a quien compite en abril se le empuja la cohorte de enero, a
   * quien no tiene fecha la formación grabada, y el mismo email para las dos
   * quema las dos.
   */
  const exportarCsv = () => {
    const cabecera = [
      "nombre",
      "email",
      "whatsapp",
      "federacion",
      "categoria",
      "cuando_compite",
      "ha_competido",
      "segmento",
      "cohorte",
      "estado",
      "canal",
      "fecha",
    ];

    const filas = visibles.map((i) => {
      const cohorte = cohorteDe(i.competeWhen);
      return [
        i.name,
        i.email,
        i.phone || "",
        etiquetaDe(FEDERACIONES, i.federation),
        etiquetaDe(CATEGORIAS, i.category),
        etiquetaDe(CUANDO_COMPITES, i.competeWhen),
        i.hasCompeted ? "si" : "no",
        SEGMENTOS[segmentar(i.competeWhen)].etiqueta,
        cohorte ? COHORTES[cohorte].etiqueta : "",
        etiquetaDe(ESTADOS, i.status),
        i.utmSource || "directo",
        new Date(i.createdAt).toLocaleDateString("es-ES"),
      ];
    });

    // Comillas dobles escapadas: hay nombres con comas y notas con saltos.
    const csv = [cabecera, ...filas]
      .map((f) => f.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    // BOM para que Excel en español no se coma los acentos.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `masterclass-${MASTERCLASS.edicion}-${filtro.toLowerCase()}.csv`;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center py-32 text-charcoal-lighter">
        <Loader2 className="animate-spin" size={22} />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  const m = datos!.metricas;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-charcoal">Masterclass</h1>
          <p className="text-sm text-charcoal-lighter mt-1">
            {MASTERCLASS.titulo} · {MASTERCLASS.fechaTexto}
          </p>
        </div>

        <button onClick={exportarCsv} className="btn-secondary gap-2 !py-2.5">
          <Download size={14} />
          Exportar {filtro === "TODAS" ? "todo" : "filtro"} ({visibles.length})
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metrica
          icono={Users}
          valor={m.total}
          etiqueta="Inscritas"
          nota={`${m.conWhatsapp} con WhatsApp`}
        />
        <Metrica
          icono={Radio}
          valor={m.asistieron}
          etiqueta="En directo"
          nota={m.tasaAsistencia !== null ? `${m.tasaAsistencia}% de asistencia` : "—"}
        />
        <Metrica icono={Video} valor={m.vistos} etiqueta="Replay" nota="Sin directo" />
        <Metrica
          icono={ShoppingBag}
          valor={m.compraron}
          etiqueta="Compraron"
          nota="Marcadas a mano"
        />
      </div>

      {/* Reparto por segmento y canal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-flat">
          <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter mb-4">
            Por momento de temporada
          </p>
          <div className="space-y-2">
            {(Object.keys(SEGMENTOS) as Segmento[]).map((s) => (
              <div key={s} className="flex items-center justify-between text-sm">
                <span className="text-charcoal-light">{SEGMENTOS[s].etiqueta}</span>
                <span className="font-semibold text-charcoal">
                  {m.porSegmento[s]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-flat">
          <p className="text-xs tracking-[0.2em] uppercase text-charcoal-lighter mb-4">
            De dónde vienen
          </p>
          <div className="space-y-2">
            {m.canales.map((c: any) => (
              <div
                key={c.etiqueta}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-charcoal-light">{c.etiqueta}</span>
                <span className="font-semibold text-charcoal">{c.veces}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
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

      {/* Listado */}
      {visibles.length === 0 ? (
        <p className="text-sm text-charcoal-lighter py-12 text-center">
          Todavía no hay inscripciones en este filtro.
        </p>
      ) : (
        <div className="space-y-3">
          {visibles.map((i) => {
            const seg = segmentar(i.competeWhen);
            const cohorte = cohorteDe(i.competeWhen);

            return (
              <div
                key={i.id}
                className="bg-white rounded-2xl border border-blush-50 p-5 flex flex-wrap items-center gap-4"
              >
                <div className="min-w-[200px] flex-1">
                  <p className="font-semibold text-charcoal">{i.name}</p>
                  <p className="text-xs text-charcoal-lighter">
                    {i.email}
                    {i.phone ? ` · ${i.phone}` : ""}
                  </p>
                </div>

                <div className="text-xs text-charcoal-light min-w-[160px]">
                  {etiquetaDe(CATEGORIAS, i.category)} ·{" "}
                  {etiquetaDe(FEDERACIONES, i.federation)}
                  <br />
                  <span className="text-charcoal-lighter">
                    Compite: {etiquetaDe(CUANDO_COMPITES, i.competeWhen)}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 items-start">
                  <span
                    className={`badge border ${COLOR_SEGMENTO[seg]}`}
                  >
                    {SEGMENTOS[seg].etiqueta}
                  </span>
                  {cohorte && (
                    <span className="text-[10px] text-charcoal-lighter">
                      Cohorte {COHORTES[cohorte].etiqueta}
                    </span>
                  )}
                </div>

                <select
                  value={i.status}
                  onChange={(e) => cambiarEstado(i.id, e.target.value)}
                  className="input !w-auto !py-2 text-xs"
                >
                  {ESTADOS.map((e) => (
                    <option key={e.valor} value={e.valor}>
                      {e.etiqueta}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      )}
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
