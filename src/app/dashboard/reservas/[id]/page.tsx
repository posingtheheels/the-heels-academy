"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Globe, 
  AlertCircle, CheckCircle, XCircle, Trash2,
  Info, ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${params.id}`);
        if (!res.ok) throw new Error("No se pudo cargar la reserva");
        const data = await res.json();
        setBooking(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [params.id]);

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar esta clase? Recuperarás tu sesión en el bono.")) return;
    
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/bookings/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cancelar");
      
      setSuccess("Reserva cancelada correctamente. Redirigiendo...");
      setTimeout(() => router.push("/dashboard/historial"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-blush-100 border-t-blush-500 rounded-full animate-spin" />
        <p className="text-sm text-charcoal-lighter animate-pulse">Cargando detalles...</p>
      </div>
    );
  }

  if (!booking || error && !booking) {
    return (
      <div className="card text-center py-20 border-red-100 bg-red-50/20">
        <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-heading text-charcoal mb-4">{error || "Reserva no encontrada"}</h2>
        <Link href="/dashboard/historial" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al historial
        </Link>
      </div>
    );
  }

  const date = new Date(booking.dateTime);
  const isOnline = booking.modality === "ONLINE" || booking.slot.type === "ONLINE";
  
  // Check if less than 24h
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const canCancel = diffHours >= 24 && booking.status !== "CANCELADA" && booking.status !== "REALIZADA";

  return (
    <div className="max-w-3xl mx-auto pb-20 mt-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/historial" 
          className="p-2.5 bg-white border border-blush-100 rounded-2xl text-charcoal-lighter hover:text-blush-500 hover:border-blush-500 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-charcoal font-light">Detalles de la Clase</h1>
          <p className="text-xs text-charcoal-lighter uppercase tracking-widest mt-1">Información de tu reserva</p>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm mb-8 animate-fade-in">
          <CheckCircle size={18} />
          {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm mb-8 animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Main Ticket */}
        <div className="card-flat bg-white border-blush-50 shadow-elegant overflow-hidden p-0">
          {/* Ticket Header (Gradient) */}
          <div className="bg-gradient-to-r from-charcoal to-charcoal-light p-8 text-white">
             <div className="flex justify-between items-start mb-6">
                <div>
                   <span className="text-[10px] uppercase tracking-[0.3em] font-medium opacity-60">Status de reserva</span>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`w-2 h-2 rounded-full ${booking.status === "CONFIRMADA" ? "bg-emerald-400" : "bg-red-400"}`} />
                      <h2 className="text-xl font-heading font-bold uppercase tracking-widest">{booking.status}</h2>
                   </div>
                </div>
                <div className="text-right">
                   <ShieldCheck size={28} className="text-blush-300 ml-auto opacity-40" />
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-widest opacity-40">Fecha</span>
                  <p className="text-lg font-semibold mt-1">
                    {date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest opacity-40">Horario</span>
                  <p className="text-lg font-semibold mt-1">
                    {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} — {booking.slot.durationMinutes} min
                  </p>
                </div>
             </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8 space-y-8">
             <div className="flex items-start gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isOnline ? "bg-sky-50 text-sky-500" : "bg-emerald-50 text-emerald-500"}`}>
                   {isOnline ? <Globe size={28} /> : <MapPin size={28} />}
                </div>
                <div>
                   <h3 className="text-xs uppercase font-body font-bold text-charcoal-lighter tracking-widest mb-1">
                     Ubicación / Modalidad
                   </h3>
                   <p className="text-lg font-heading font-semibold text-charcoal">
                     {isOnline ? "Sesión Online (Te contactaremos por WhatsApp)" : "Presencial (Apex Power Gym)"}
                   </p>
                   {!isOnline && (
                     <p className="text-sm text-charcoal-light mt-1">
                       Calle Manresá 2, Nave D, Badalona
                     </p>
                   )}
                </div>
             </div>

             <div className="divider-wide" />

             {/* Cancellation Warning */}
             {booking.status === "CONFIRMADA" && (
                <div className={`p-4 rounded-2xl flex gap-3 ${canCancel ? "bg-amber-50 border border-amber-100/50 text-amber-700" : "bg-red-50 border border-red-100/50 text-red-700"}`}>
                  <Info size={20} className="flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight">Política de cancelación</h4>
                    <p className="text-xs mt-1 leading-relaxed opacity-90">
                      {canCancel 
                        ? "Puedes cancelar esta clase hasta 24 horas antes sin coste. Tu sesión se devolverá automáticamente a tu bono."
                        : "No es posible cancelar esta clase porque quedan menos de 24 horas para el inicio."}
                    </p>
                  </div>
                </div>
             )}

             {/* Action Buttons */}
             <div className="flex flex-col gap-3 pt-6">
                {canCancel && (
                   <button 
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="btn-ghost !text-red-500 !bg-red-50 hover:!bg-red-100 border-none w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                   >
                     {cancelling ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-red-600 rounded-full animate-spin" />
                     ) : (
                        <XCircle size={18} />
                     )}
                     Cancelar esta reserva
                   </button>
                )}
                
                <Link 
                  href="/dashboard/historial"
                  className="btn-secondary w-full py-4 text-center justify-center rounded-2xl opacity-60 hover:opacity-100"
                >
                  Cerrar detalles
                </Link>
             </div>
          </div>
          
          {/* Ticket Footer Decor */}
          <div className="bg-blush-50/20 py-4 px-8 border-t border-dashed border-blush-100/50 flex justify-between">
             <span className="text-[10px] uppercase font-bold text-charcoal-lighter tracking-widest">The Heels Academy</span>
             <span className="text-[10px] uppercase font-bold text-blush-500 tracking-tighter">Ref: {booking.id.slice(0,8).toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
