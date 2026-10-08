"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Send } from "lucide-react";
import {
  MASTERCLASS,
  FEDERACIONES,
  CATEGORIAS,
  CUANDO_COMPITES,
} from "@/lib/masterclass";

type Estado = "idle" | "enviando" | "enviado";

const VACIO = {
  name: "",
  email: "",
  phone: "",
  federation: "",
  category: "",
  competeWhen: "",
  hasCompeted: false,
  consentMarketing: false,
  consentRecording: false,
};

export default function FormularioInscripcion() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [error, setError] = useState("");
  const [datos, setDatos] = useState(VACIO);
  const [utm, setUtm] = useState({ utmSource: "", utmMedium: "", utmCampaign: "" });

  // Se leen una vez al montar y viajan escondidas en el envío. Es la única forma
  // de saber después qué canal llenó la sala: el enlace de Instagram y el que
  // reenvía un preparador tienen que poder distinguirse.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      utmSource: p.get("utm_source") || "",
      utmMedium: p.get("utm_medium") || "",
      utmCampaign: p.get("utm_campaign") || "",
    });
  }, []);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEstado("enviando");
    setError("");

    try {
      const res = await fetch("/api/masterclass", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...datos, ...utm }),
      });

      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.error || "No se ha podido guardar tu plaza.");

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
          Tienes tu plaza guardada
        </h3>
        <p className="text-sm text-charcoal-light leading-relaxed max-w-md mx-auto">
          Te acabo de mandar un email de confirmación. El enlace de la sala te
          llega el mismo {MASTERCLASS.fechaCorta} por email y por WhatsApp.
        </p>
        <p className="text-xs text-charcoal-lighter mt-4">
          Si no lo ves en unos minutos, mira en spam.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="mc-name" className="input-label">
            Nombre
          </label>
          <input
            id="mc-name"
            type="text"
            className="input"
            placeholder="Tu nombre"
            value={datos.name}
            onChange={(e) => setDatos({ ...datos, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="mc-email" className="input-label">
            Email
          </label>
          <input
            id="mc-email"
            type="email"
            className="input"
            placeholder="tu@email.com"
            value={datos.email}
            onChange={(e) => setDatos({ ...datos, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="mc-phone" className="input-label">
          WhatsApp
        </label>
        <input
          id="mc-phone"
          type="tel"
          className="input"
          placeholder="600 000 000"
          value={datos.phone}
          onChange={(e) => setDatos({ ...datos, phone: e.target.value })}
        />
        <p className="text-xs text-charcoal-lighter mt-1.5">
          Solo para el recordatorio del día. Es el que más gente salva.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="mc-federation" className="input-label">
            Federación
          </label>
          <select
            id="mc-federation"
            className="input"
            value={datos.federation}
            onChange={(e) => setDatos({ ...datos, federation: e.target.value })}
          >
            <option value="">Elige una</option>
            {FEDERACIONES.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.etiqueta}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mc-category" className="input-label">
            Categoría
          </label>
          <select
            id="mc-category"
            className="input"
            value={datos.category}
            onChange={(e) => setDatos({ ...datos, category: e.target.value })}
          >
            <option value="">Elige una</option>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.etiqueta}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="mc-when" className="input-label">
          ¿Cuándo compites?
        </label>
        <select
          id="mc-when"
          className="input"
          value={datos.competeWhen}
          onChange={(e) => setDatos({ ...datos, competeWhen: e.target.value })}
          required
        >
          <option value="">Elige una</option>
          {CUANDO_COMPITES.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.etiqueta}
            </option>
          ))}
        </select>
        <p className="text-xs text-charcoal-lighter mt-1.5">
          Me sirve para saber a cuántas semanas estás de tu tarima.
        </p>
      </div>

      <label className="flex items-start gap-3 text-sm text-charcoal-light cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-blush-500"
          checked={datos.hasCompeted}
          onChange={(e) => setDatos({ ...datos, hasCompeted: e.target.checked })}
        />
        <span>Ya he competido alguna vez</span>
      </label>

      <div className="divider-wide" />

      <label className="flex items-start gap-3 text-sm text-charcoal-light cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-blush-500"
          checked={datos.consentMarketing}
          onChange={(e) =>
            setDatos({ ...datos, consentMarketing: e.target.checked })
          }
          required
        />
        <span>
          Quiero recibir el enlace de la sesión, el replay y los emails de The
          Heels. Puedo darme de baja cuando quiera.
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm text-charcoal-light cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 accent-blush-500"
          checked={datos.consentRecording}
          onChange={(e) =>
            setDatos({ ...datos, consentRecording: e.target.checked })
          }
        />
        <span>
          Acepto salir en la grabación si enciendo la cámara. Sin esto puedes
          venir igual, solo que con la cámara apagada.
        </span>
      </label>

      {error && (
        <p className="text-sm text-blush-700 bg-blush-50 border border-blush-200 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={estado !== "idle"}
        className="btn-primary w-full gap-2"
      >
        {estado === "enviando" ? (
          <>
            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
            Guardando...
          </>
        ) : (
          <>
            <Send size={14} />
            Guardar mi plaza
          </>
        )}
      </button>

      <p className="text-xs text-charcoal-lighter text-center leading-relaxed">
        Gratis. Si no puedes a esa hora, apúntate igual: el replay está
        disponible {MASTERCLASS.replayHoras} horas.
      </p>
    </form>
  );
}
