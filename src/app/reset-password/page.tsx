"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Save, CheckCircle, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return setError("Token de recuperación no válido.");
    if (password.length < 6) return setError("Mínimo 6 caracteres.");
    if (password !== confirmPassword) return setError("Las contraseñas no coinciden.");

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-sm border border-emerald-100">
          <CheckCircle size={32} />
        </div>
        <h2 className="font-heading text-2xl text-charcoal mb-2 font-bold">¡Contraseña actualizada!</h2>
        <p className="text-sm text-charcoal-lighter mb-8">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Link href="/login" className="btn-primary w-full inline-flex items-center justify-center py-4">
          Ir al Login
        </Link>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={32} />
        </div>
        <h2 className="font-heading text-2xl text-charcoal mb-2">Enlace no válido</h2>
        <p className="text-sm text-charcoal-lighter mb-8">Parece que el token ha caducado o es incorrecto.</p>
        <Link href="/login" className="btn-secondary w-full inline-flex items-center justify-center py-4 rounded-2xl">
          Volver al Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl text-charcoal text-center mb-1">Nueva contraseña</h1>
      <p className="text-sm text-charcoal-lighter text-center mb-8">Elige una contraseña segura y fácil de recordar</p>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="input-label">Nueva Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-lighter hover:text-blush-500"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label">Repetir Contraseña</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full gap-2 py-4 rounded-2xl font-bold mt-4"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Actualizar contraseña
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blush-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center group">
            <span className="text-[9px] tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter">Posing</span>
            <span className="text-3xl font-heading font-bold tracking-wide text-charcoal leading-none uppercase">The Heels</span>
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-elegant border border-blush-50">
          <Suspense fallback={<div>Cargando...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
