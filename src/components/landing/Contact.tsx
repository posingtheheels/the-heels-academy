"use client";

import { useState } from "react";
import { Send, Instagram, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

export default function Contact() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al enviar el mensaje");
      
      setFormState("sent");
      setFormData({ name: "", email: "", phone: "", message: "" });
      
      setTimeout(() => setFormState("idle"), 5000);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al enviar el mensaje. Por favor, inténtalo de nuevo.");
      setFormState("idle");
    }
  };

  return (
    <section id="contacto" className="section bg-white">
      <div className="container-app">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl text-charcoal font-light italic">
            Contacto
          </h2>
          <div className="divider" />
          <p className="font-body text-charcoal-lighter max-w-xl mx-auto">
            ¿Tienes alguna duda? Escríbenos y te responderemos lo antes posible
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="input-label">
                  Nombre
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className="input"
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="input-label">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="input"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="input-label">
                  Mensaje
                </label>
                <textarea
                  id="contact-message"
                  className="input min-h-[120px] resize-none"
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formState !== "idle"}
                className="btn-primary w-full gap-2"
              >
                {formState === "idle" && (
                  <>
                    <Send size={14} />
                    Enviar mensaje
                  </>
                )}
                {formState === "sending" && (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                    Enviando...
                  </span>
                )}
                {formState === "sent" && (
                  <span className="flex items-center gap-2">
                    <CheckCircle size={14} />
                    ¡Mensaje enviado!
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            <div className="card-flat space-y-8">
              <div>
                <h3 className="font-heading text-xl font-semibold text-charcoal mb-4">
                  Información de contacto
                </h3>
                <p className="text-sm text-charcoal-light leading-relaxed">
                  Puedes contactarnos por cualquiera de estos medios o rellenar el formulario
                  y te responderemos en menos de 24 horas.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="mailto:posingtheheels@gmail.com"
                  className="flex items-center gap-4 text-sm text-charcoal-light hover:text-blush-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                    <Mail size={16} className="text-blush-500" />
                  </div>
                  posingtheheels@gmail.com
                </a>

                <a
                  href="https://instagram.com/posing_theheels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 text-sm text-charcoal-light hover:text-blush-500 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                    <Instagram size={16} className="text-blush-500" />
                  </div>
                  @posing_theheels
                </a>

                <div className="flex items-center gap-4 text-sm text-charcoal-light group">
                  <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                    <MapPin size={16} className="text-blush-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal">Apex Power Gym</p>
                    <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest leading-tight">Calle Manresá 2, Nave D<br />08911 Badalona, Barcelona</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
