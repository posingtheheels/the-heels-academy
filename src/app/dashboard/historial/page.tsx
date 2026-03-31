"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Clock, CheckCircle, XCircle, 
  MapPin, Globe, AlertCircle, ChevronRight,
  TrendingDown
} from "lucide-react";
import Link from "next/link";

type TabStatus = "Próximas" | "Realizadas" | "Canceladas";

export default function HistoryPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabStatus>("Próximas");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBookings() {
      try {
        const res = await fetch("/api/user/bookings");
        if (!res.ok) throw new Error("Error fetching bookings");
        const data = await res.json();
        setBookings(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const now = new Date();

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.dateTime);
    if (activeTab === "Próximas") {
      return bookingDate >= now && booking.status !== "CANCELADA";
    }
    if (activeTab === "Realizadas") {
      return bookingDate < now && booking.status !== "CANCELADA";
    }
    if (activeTab === "Canceladas") {
      return booking.status === "CANCELADA";
    }
    return false;
  }).sort((a, b) => {
    const dateA = new Date(a.dateTime).getTime();
    const dateB = new Date(b.dateTime).getTime();
    return activeTab === "Próximas" ? dateA - dateB : dateB - dateA;
  });

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-4">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Mi Historial
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          Gestiona tus clases actuales y pasadas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white p-1.5 rounded-2xl mb-8 max-w-sm border border-blush-100 shadow-sm">
        {(["Próximas", "Realizadas", "Canceladas"] as TabStatus[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold tracking-tight transition-all ${
              activeTab === tab
                ? "bg-charcoal text-white shadow-md shadow-charcoal/20"
                : "text-charcoal-lighter hover:text-charcoal hover:bg-blush-50/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-blush-100 border-t-blush-500 rounded-full animate-spin" />
          <p className="text-sm text-charcoal-lighter">Cargando tus clases...</p>
        </div>
      ) : error ? (
        <div className="card text-center py-16 border-red-100 bg-red-50/30">
          <AlertCircle size={40} className="text-red-300 mx-auto mb-4" />
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-20 bg-white shadow-elegant/40 border-blush-100/50">
          <div className="w-16 h-16 rounded-full bg-blush-50 flex items-center justify-center mx-auto mb-6">
            <Clock size={32} className="text-blush-300" />
          </div>
          <h2 className="font-heading text-2xl text-charcoal font-semibold mb-2">
            Sin clases en esta sección
          </h2>
          <p className="text-sm text-charcoal-lighter max-w-sm mx-auto mb-8">
            {activeTab === "Próximas" 
              ? "No tienes reservas futuras actualmente. ¡Es buen momento para empezar!"
              : "Aún no hay registros en esta sección."}
          </p>
          {activeTab === "Próximas" && (
            <Link href="/dashboard/reservar" className="btn-primary inline-flex items-center gap-2">
              <Calendar size={16} /> Reservar mi primera clase
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: any }) {
  const date = new Date(booking.dateTime);
  const dayName = date.toLocaleDateString("es-ES", { weekday: "long" });
  const dayNum = date.getDate();
  const monthName = date.toLocaleDateString("es-ES", { month: "short" });
  const hours = date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

  const isOnline = booking.modality === "ONLINE" || booking.slot.type === "ONLINE";

  return (
    <div className="card-flat bg-white border-blush-50 hover:border-blush-200 transition-all shadow-sm group">
      <div className="flex flex-col md:flex-row md:items-center gap-6 p-4 md:p-6">
        {/* Date Badge */}
        <div className="flex-shrink-0 flex md:flex-col items-center justify-center w-full md:w-20 py-3 md:py-4 bg-charcoal rounded-2xl text-white shadow-elegant">
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 md:mb-1 px-2 md:px-0">{dayName.slice(0,3)}</span>
          <span className="text-3xl font-heading font-bold leading-none">{dayNum}</span>
          <span className="text-[10px] uppercase font-bold tracking-widest opacity-60 md:mt-1 px-2 md:px-0">{monthName}</span>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-blush-50 border border-blush-200 rounded-full text-[10px] font-bold text-charcoal uppercase tracking-wider">
               <Clock size={12} className="text-blush-500" />
               {hours} — {booking.slot.durationMinutes} min
             </div>
             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
               isOnline ? "bg-sky-50 border-sky-100 text-sky-600" : "bg-emerald-50 border-emerald-100 text-emerald-600"
             }`}>
               {isOnline ? <Globe size={11} /> : <MapPin size={11} />}
               {isOnline ? "Clase Online" : "Clase Presencial"}
             </div>
          </div>
          
          <h3 className="font-heading text-lg font-semibold text-charcoal">
            {isOnline ? "Posing Academy (Zoom Session)" : "Posing Academy (Apex Power Gym)"}
          </h3>
          
          {!isOnline && (
            <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest -mt-1 font-medium">
              Calle Manresá 2, Nave D, Badalona
            </p>
          )}
          
          <div className="flex items-center gap-4 pt-2 border-t border-blush-50/50">
             <p className="text-[10px] text-charcoal-lighter flex items-center gap-1">
               <CheckCircle size={10} className="text-emerald-400" /> Estado: 
               <span className="font-bold text-charcoal uppercase ml-0.5">{booking.status}</span>
             </p>
          </div>
        </div>

        {/* Action (Optional indicator) */}
        <div className="pt-4 md:pt-0 border-t md:border-t-0 border-blush-50 flex items-center justify-between md:block">
           <Link 
            href={`/dashboard/reservas/${booking.id}`}
            className="text-[10px] uppercase font-bold tracking-widest text-blush-500 hover:text-charcoal transition-colors flex items-center gap-1"
           >
             Detalles <ChevronRight size={14} />
           </Link>
        </div>
      </div>
    </div>
  );
}
