"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Clock, User, 
  MapPin, Globe, CheckCircle, AlertCircle, Calendar as CalendarIcon,
  Search, X, List, Share2, MoreVertical, ExternalLink, RefreshCw
} from "lucide-react";
import Link from "next/link";

type SlotWithBookings = any;

export default function AdminAgendaPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    return new Date(today.setDate(diff));
  });

  const [slots, setSlots] = useState<SlotWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const weekDates = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(currentWeekStart.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentWeekStart]);

  useEffect(() => {
    fetchAgendaData();
  }, [currentWeekStart]);

  async function fetchAgendaData() {
    setLoading(true);
    try {
      // Set start to Monday 00:00:00 local
      const start = new Date(currentWeekStart);
      start.setHours(0, 0, 0, 0);
      
      // Set end to Sunday 23:59:59 local
      const end = new Date(currentWeekStart);
      end.setDate(currentWeekStart.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      
      const startStr = start.toISOString();
      const endStr = end.toISOString();

      console.log(`[Agenda] Fetching from ${startStr} to ${endStr}`);

      const res = await fetch(`/api/admin/calendar?start=${startStr}&end=${endStr}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      
      if (!res.ok) throw new Error("Error fetching agenda");
      const data = await res.json();
      
      const slotsArray = Array.isArray(data) ? data : (data.slots || []);
      console.log(`[Agenda] Received ${slotsArray.length} total slots`);
      
      const confirmedSlots = slotsArray.filter((s: any) => 
        s.bookings && s.bookings.some((b: any) => b.status !== "CANCELADA")
      );
      
      console.log(`[Agenda] ${confirmedSlots.length} confirmed slots`);
      setSlots(confirmedSlots);
    } catch (err) {
      console.error("[Agenda] Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const changeWeek = (val: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (val * 7));
    setCurrentWeekStart(newDate);
  };

  const getDaySlots = (date: Date) => {
    return slots.filter((s: any) => {
      const d = new Date(s.dateTime);
      // Use local date comparison to avoid timezone shifts
      return d.toLocaleDateString() === date.toLocaleDateString();
    }).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl text-charcoal font-light">Próximas <span className="font-medium">Clases</span></h1>
          <p className="text-[10px] md:text-sm text-charcoal-lighter mt-1 mb-2 md:mb-6 flex items-center gap-2 uppercase tracking-widest">
            <CheckCircle size={12} className="text-emerald-500" /> 
            Sesiones reservadas
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => fetchAgendaData()}
            className="p-2.5 rounded-xl bg-white border border-blush-100 text-charcoal-lighter hover:text-blush-500 hover:border-blush-200 transition-all shadow-sm flex items-center gap-2 text-[10px] font-bold"
            title="Refrescar datos"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            REFRESCAR
          </button>
          <button 
            onClick={() => setShowSyncModal(true)}
            className="p-2.5 rounded-xl bg-charcoal text-white text-[10px] font-bold flex items-center gap-2 hover:bg-charcoal/90 transition-all"
          >
            <Share2 size={12} />
            GOOGLE CALENDAR
          </button>
          
          <div className="flex items-center bg-white rounded-xl border border-blush-50 p-0.5 shadow-sm">
             <button onClick={() => changeWeek(-1)} className="p-1.5 hover:bg-blush-50 rounded-lg transition-all">
                <ChevronLeft size={16} />
             </button>
             <div className="px-2 text-[10px] font-bold text-charcoal uppercase tracking-tighter min-w-[120px] text-center">
                Semana {weekDates[0].getDate()} - {weekDates[6].getDate()} {weekDates[6].toLocaleDateString('es-ES', { month: 'short' })}
             </div>
             <button onClick={() => changeWeek(1)} className="p-1.5 hover:bg-blush-50 rounded-lg transition-all">
                <ChevronRight size={16} />
             </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-4">
           {[1,2,3,4,5,6,7].map(i => (
             <div key={i} className="card-flat h-[400px] animate-pulse bg-charcoal/5" />
           ))}
        </div>
      ) : (
        <div className="flex flex-col lg:grid lg:grid-cols-7 gap-2 lg:gap-4 items-start">
          {weekDates.map((date, idx) => {
            const daySlots = getDaySlots(date);
            const isToday = new Date().toDateString() === date.toDateString();

            return (
              <div key={idx} className={`w-full flex flex-col gap-2 lg:gap-4 lg:min-h-[400px] ${idx > 4 && daySlots.length === 0 ? 'hidden lg:flex' : ''}`}>
                 <div className={`px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl text-left lg:text-center border transition-all flex lg:flex-col items-center lg:justify-center gap-3 lg:gap-0 ${
                   isToday ? "bg-charcoal text-white border-charcoal shadow-elegant" : "bg-white text-charcoal-light border-blush-50"
                 }`}>
                    <p className="text-[9px] lg:text-[10px] uppercase font-bold tracking-[0.2em] opacity-60 w-10 lg:w-auto">
                      {date.toLocaleDateString('es-ES', { weekday: 'short' })}
                    </p>
                    <p className="text-sm lg:text-lg font-heading font-bold">{date.getDate()}</p>
                    {daySlots.length > 0 && (
                      <span className="lg:hidden ml-auto text-[8px] font-bold bg-blush-500 text-white px-2 py-0.5 rounded-full">
                        {daySlots.length} CLASE{daySlots.length > 1 ? 'S' : ''}
                      </span>
                    )}
                 </div>

                 <div className="space-y-2 lg:space-y-3 pl-4 lg:pl-0 border-l-2 lg:border-l-0 border-blush-50/50 lg:border-transparent ml-5 lg:ml-0">
                    {daySlots.length === 0 ? (
                      <div className="py-12 border-2 border-dashed border-blush-50 rounded-2xl flex flex-col items-center justify-center text-center px-4">
                         <div className="w-8 h-8 rounded-full bg-blush-50/50 flex items-center justify-center text-blush-200 mb-2">
                           <Clock size={14} />
                         </div>
                         <p className="text-[9px] uppercase font-medium text-charcoal-lighter tracking-widest">Sin clases</p>
                      </div>
                    ) : (
                      daySlots.map((slot: any) => (
                        <AgendaCard key={slot.id} slot={slot} />
                      ))
                    )}
                 </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sync Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="card-flat bg-white w-full max-w-md p-8 shadow-2xl border-none relative animate-pop-in">
             <button onClick={() => setShowSyncModal(false)} className="absolute top-4 right-4 text-charcoal-lighter hover:text-charcoal p-1">
               <X size={20} />
             </button>
             <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center mx-auto mb-6">
                <Globe size={28} className="text-sky-500" />
             </div>
             <h3 className="font-heading text-2xl font-bold text-charcoal text-center mb-2">Google Calendar</h3>
             <p className="text-sm text-charcoal-lighter text-center mb-8 leading-relaxed">
               Sincroniza tus clases para recibirlas automáticamente en tu móvil y recibir recordatorios de Google.
             </p>
             
             <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blush-50/30 border border-blush-100/50">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-blush-500 shadow-sm">1</div>
                   <p className="text-xs text-charcoal-light italic">Se crearán eventos para clases <strong>Confirmadas</strong> y <strong>Pagadas</strong>.</p>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-blush-50/30 border border-blush-100/50">
                   <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-blush-500 shadow-sm">2</div>
                   <p className="text-xs text-charcoal-light italic">Incluye el nombre de la alumna y el link (si es Online).</p>
                </div>
             </div>

             <button 
               className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 bg-sky-500 border-sky-500 hover:bg-sky-600"
               onClick={() => window.location.href = "/api/admin/calendar/auth"}
             >
               <ExternalLink size={16} />
               Conectar con mi cuenta Google
             </button>
             <p className="text-[10px] text-charcoal-lighter text-center mt-4">
               The Heels no guardará tus correos personales, solo registrará las clases en tu agenda.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}

function AgendaCard({ slot }: { slot: any }) {
  const booking = slot.bookings[0];
  const time = new Date(slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const isOnline = booking.modality === "ONLINE";

  return (
    <div className={`card-flat bg-white border border-blush-50 p-2 lg:p-4 shadow-sm hover:shadow-md transition-all overflow-hidden relative group ${
      booking.status === "REALIZADA" ? "opacity-60" : ""
    }`}>
      {booking.status === "REALIZADA" && (
        <div className="absolute top-0 right-0 p-1 bg-emerald-50 text-emerald-500 rounded-bl-lg">
          <CheckCircle size={10} />
        </div>
      )}
      
      <div className="mb-3">
         <p className="text-xs font-bold text-charcoal">{time}</p>
         <p className="text-[9px] uppercase tracking-tighter text-charcoal-lighter font-medium">
           {isOnline ? 30 : slot.durationMinutes} min
         </p>
      </div>

      <div className="flex items-center gap-2 mb-3">
         <div className="w-8 h-8 rounded-full bg-blush-50 flex items-center justify-center text-blush-500 font-heading text-xs font-bold">
           {booking.user.name.charAt(0)}
         </div>
         <div className="min-w-0">
            <p className="text-[11px] font-bold text-charcoal truncate">{booking.user.name}</p>
            <div className="flex items-center gap-1 opacity-60">
               {isOnline ? <Globe size={8} /> : <MapPin size={8} />}
               <span className="text-[8px] font-bold tracking-widest uppercase truncate">{booking.modality}</span>
            </div>
         </div>
      </div>

      <div className="flex gap-1">
         <Link 
            href={`/admin/alumnos/${booking.userId}`}
            className="flex-1 py-1.5 rounded-lg bg-blush-50/50 text-[8px] font-bold text-charcoal-lighter hover:bg-blush-100/50 transition-colors flex items-center justify-center uppercase tracking-wider"
         >
            INFO
         </Link>
         {booking.user.phone ? (
           <a 
              href={`https://wa.me/${booking.user.phone.replace(/\s+/g, '')}?text=Hola%20${booking.user.name.split(' ')[0]}!%20Te%20escribo%20de%20The%20Heels`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-1.5 rounded-lg bg-charcoal text-[8px] font-bold text-white hover:bg-charcoal/90 transition-colors flex items-center justify-center uppercase tracking-wider"
           >
              WHATSAPP
           </a>
         ) : (
           <button 
              disabled
              className="flex-1 py-1.5 rounded-lg bg-charcoal/30 text-[8px] font-bold text-white/50 cursor-not-allowed flex items-center justify-center uppercase tracking-wider"
           >
              SIN TELF.
           </button>
         )}
      </div>
    </div>
  );
}
