"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, AlertCircle, Trash2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Ha ocurrido un error. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotSent(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error || "No se pudo enviar el email");
      setForgotSent(true);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-soft px-4">
      {/* Decorative bg */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blush-100/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blush-200/20 rounded-full blur-3xl" />
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
            Bienvenida de nuevo
          </h1>
          <p className="text-sm text-charcoal-lighter text-center mb-8">
            Accede a tu cuenta para gestionar tus clases
          </p>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="input-label">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="input-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal-lighter hover:text-blush-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter hover:text-blush-500 transition-colors"
                >
                  He olvidado mi contraseña
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={16} />
                  Iniciar sesión
                </>
              )}
            </button>
          </form>

          <div className="divider-wide !my-6" />

          <p className="text-center text-sm text-charcoal-lighter">
            ¿No tienes cuenta?{" "}
            <Link
              href="/registro"
              className="text-blush-500 hover:text-blush-600 font-medium transition-colors"
            >
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative animate-pop-in">
             <button 
              onClick={() => { setShowForgotModal(false); setForgotSent(false); }} 
              className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-all p-1"
            >
              <Trash2 size={24} className="opacity-40 hover:opacity-100 rotate-45" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2 text-center">Recuperar Acceso</h3>
            <p className="text-sm text-charcoal-lighter mb-8 text-center">Te enviaremos un enlace a tu email para restablecer tu contraseña.</p>

            {forgotSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm shadow-emerald-200/50">
                  <CheckCircle size={24} />
                </div>
                <p className="text-sm font-bold text-emerald-600">Email enviado con éxito</p>
                <p className="text-[11px] text-charcoal-lighter mt-2 mb-8 leading-relaxed">Si el email está registrado, te llegará el enlace en unos minutos. Revisa también tu carpeta de spam.</p>
                <button onClick={() => setShowForgotModal(false)} className="btn-secondary w-full py-3.5 text-[10px] tracking-widest rounded-2xl uppercase font-bold">Cerrar</button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div>
                  <label className="input-label">Tu email de cuenta</label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@mail.com"
                    className="input !py-3 !text-sm"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="btn-primary w-full py-4 text-[10px] tracking-widest mt-2 uppercase font-bold rounded-2xl"
                >
                  {forgotLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
