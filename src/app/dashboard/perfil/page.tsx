"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { User, Save, CheckCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    federation: "",
    role: "USER"
  });

  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (res.ok) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            category: data.category || "",
            federation: data.federation || "",
            role: data.role || "USER"
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProfile(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: formData.category,
          federation: formData.federation
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "Error al guardar");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("No se pudo guardar el perfil: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Mi perfil
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          Gestiona tu información personal
        </p>
      </div>

      {/* Avatar */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blush-100 flex items-center justify-center">
            <span className="text-2xl font-heading font-bold text-blush-500">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <div>
            <h2 className="font-heading text-xl text-charcoal">
              {session?.user?.name}
            </h2>
            <p className="text-sm text-charcoal-lighter">{formData.email}</p>
            <span className="badge-blush mt-2 uppercase tracking-widest text-[9px] font-bold">
              {formData.role === "ADMIN" ? "Administradora" : "Alumna"}
            </span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card">
        <h3 className="font-heading text-lg text-charcoal mb-6">
          Datos personales
        </h3>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="input-label">
              Nombre completo
            </label>
            <input
              id="profile-name"
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="input-label">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <p className="text-[10px] text-charcoal-lighter mt-2 italic">
              * Si cambias tu email, deberás usar el nuevo en tu próximo inicio de sesión.
            </p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="input-label">
              Teléfono
            </label>
            <input
              id="profile-phone"
              type="tel"
              className="input"
              placeholder="+34 600 000 000"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="profile-category" className="input-label">
                Categoría
              </label>
              <input
                id="profile-category"
                type="text"
                className="input"
                placeholder="Ej: Bikini"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="profile-federation" className="input-label">
                Federación
              </label>
              <input
                id="profile-federation"
                type="text"
                className="input"
                placeholder="Ej: NPC"
                value={formData.federation}
                onChange={(e) =>
                  setFormData({ ...formData, federation: e.target.value })
                }
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle size={14} />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save size={14} />
                Guardar cambios
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
