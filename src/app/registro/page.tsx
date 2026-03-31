"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    category: "",
    federation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          category: formData.category,
          federation: formData.federation,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la cuenta");
        return;
      }

      // Redirect to login with success message
      router.push("/login?registered=true");
    } catch {
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4 py-12">
      {/* Decorative bg */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blush-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center group">
            <span className="text-[9px] tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter">
              Posing
            </span>
            <span className="text-3xl font-heading font-bold tracking-wide text-charcoal leading-none">
              THE HEELS
            </span>
            <span className="text-[10px] font-script text-charcoal-lighter italic">
              Alejandra Sanchis
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-elegant border border-blush-50">
          <h1 className="font-heading text-2xl text-charcoal text-center mb-1">
            Crear cuenta
          </h1>
          <p className="text-sm text-charcoal-lighter text-center mb-8">
            Únete a The Heels y empieza a reservar tus clases
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="input-label">
                Nombre completo
              </label>
              <input
                id="register-name"
                type="text"
                className="input"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-email" className="input-label">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="register-phone" className="input-label">
                Teléfono
              </label>
              <input
                id="register-phone"
                type="tel"
                className="input"
                placeholder="+34 600 000 000"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-category" className="input-label">
                  Categoría
                </label>
                <input
                  id="register-category"
                  type="text"
                  className="input"
                  placeholder="Ej: Bikini"
                  value={formData.category}
                  onChange={(e) => updateField("category", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="register-federation" className="input-label">
                  Federación
                </label>
                <input
                  id="register-federation"
                  type="text"
                  className="input"
                  placeholder="Ej: NPC"
                  value={formData.federation}
                  onChange={(e) => updateField("federation", e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="register-password" className="input-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="input pr-12"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-lighter hover:text-blush-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="register-confirm" className="input-label">
                Confirmar contraseña
              </label>
              <input
                id="register-confirm"
                type="password"
                className="input"
                placeholder="Repite la contraseña"
                value={formData.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  Crear cuenta
                </>
              )}
            </button>
          </form>

          <div className="divider-wide !my-6" />

          <p className="text-center text-sm text-charcoal-lighter">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-blush-500 hover:text-blush-600 font-medium transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
