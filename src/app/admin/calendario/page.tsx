"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ChevronLeft, ChevronRight, Clock, User, 
  MapPin, Globe, CheckCircle, AlertCircle, Calendar as CalendarIcon,
  Search, X
} from "lucide-react";

type SlotWithBookings = any;

export default function AdminCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [slots, setSlots] = useState<SlotWithBookings[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  async function fetchCalendarData() {
    setLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const res = await fetch(`/api/admin/calendar?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Error fetching calendar");
      const data = await res.json();
      setSlots(data.slots || []);
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const slotsByDay = useMemo(() => {
    const map: Record<number, SlotWithBookings[]> = {};
    slots.forEach((slot) => {
      const d = new Date(slot.dateTime).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(slot);
    });
    return map;
  }, [slots]);

  const tasksByDay = useMemo(() => {
    const map: Record<number, any[]> = {};
    tasks.forEach((task) => {
      const d = new Date(task.date).getDate();
      if (!map[d]) map[d] = [];
      map[d].push(task);
    });
    return map;
  }, [tasks]);

  function getDayColor(day: number) {
    const daySlots = slotsByDay[day] || [];
    if (daySlots.length === 0) return "";
    
    // Check if any slot has a booking that is NOT cancelled
    const activeBookings = daySlots.flatMap(s => s.bookings).filter((b: any) => b.status !== "CANCELADA");
    
    if (activeBookings.length === 0) return "bg-charcoal/10 text-charcoal";
    
    if (activeBookings.some((b: any) => b.status === "REALIZADA")) return "bg-emerald-500 text-white";
    if (activeBookings.some((b: any) => b.status === "PENDIENTE_PAGO")) return "bg-amber-500 text-white";
    if (activeBookings.some((b: any) => b.status === "CONFIRMADA")) return "bg-sky-500 text-white";
    
    return "bg-charcoal/10 text-charcoal";
  }

  const changeMonth = (val: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + val, 1);
    setCurrentDate(newDate);
    setSelectedDay(null);
  };

  const selectedSlots = selectedDay ? slotsByDay[selectedDay] || [] : [];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="font-heading text-4xl text-charcoal font-light">Calendario <span className="font-medium">Admin</span></h1>
        <p className="text-sm text-charcoal-lighter mt-1 mb-6">Gestión unificada de horarios y reservas</p>

        {/* Legend */}
        <div className="flex flex-wrap gap-6 p-4 bg-white rounded-2xl border border-blush-50 shadow-sm">
          {[
            { color: "bg-emerald-500", label: "Clase Realizada" },
            { color: "bg-sky-500", label: "Clase Confirmada" },
            { color: "bg-amber-500", label: "Pendiente Pago" },
            { color: "bg-charcoal/10", label: "Solo Disponibilidad" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`} />
              <span className="text-[10px] uppercase font-bold tracking-widest text-charcoal-light">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Monthly Calendar */}
        <div className="card shadow-elegant border-none p-6">
          <div className="flex items-center justify-between mb-8">
             <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-blush-50 rounded-xl transition-all">
                <ChevronLeft size={20} className="text-charcoal-light" />
             </button>
             <h2 className="font-heading text-2xl font-bold text-charcoal capitalize">
               {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
             </h2>
             <button onClick={() => changeMonth(1)} className="p-2 hover:bg-blush-50 rounded-xl transition-all">
                <ChevronRight size={20} className="text-charcoal-light" />
             </button>
          </div>

          <div className="grid grid-cols-7 gap-2">
             {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
               <div key={d} className="text-center py-2 text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal-lighter">{d}</div>
             ))}
             
             {Array.from({ length: offset }).map((_, i) => <div key={`off-${i}`} />)}
             
             {Array.from({ length: daysInMonth }).map((_, i) => {
               const day = i + 1;
               const isSelected = selectedDay === day;
               const colorClass = getDayColor(day);
               const daySlots = slotsByDay[day] || [];
               const activeBookingsCount = daySlots.flatMap(s => s.bookings).filter((b: any) => b.status !== "CANCELADA").length;

               return (
                 <button
                   key={day}
                   onClick={() => setSelectedDay(day)}
                   className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                     isSelected 
                      ? "ring-2 ring-charcoal ring-offset-2 scale-105 z-10" 
                      : "hover:scale-105"
                   } ${colorClass || "bg-blush-50/30 text-charcoal-light"}`}
                 >
                   <span className="text-lg font-heading font-bold">{day}</span>
                   {daySlots.length > 0 && activeBookingsCount === 0 && (
                     <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blush-300" />
                   )}
                   {activeBookingsCount > 0 && (
                     <span className="text-[8px] font-bold opacity-60 absolute bottom-1.5">
                       {activeBookingsCount} {activeBookingsCount === 1 ? "sesión" : "sesiones"}
                     </span>
                   )}
                   {(tasksByDay[day] || []).length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
                   )}
                 </button>
               );
             })}
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-4">
           <h3 className="font-heading text-xl text-charcoal flex items-center gap-3">
             <CalendarIcon size={20} className="text-blush-400" />
             Detalles del día {selectedDay}
           </h3>
           
           {selectedDay === null ? (
             <div className="card-flat bg-white/50 border-dashed border-blush-100 flex flex-col items-center justify-center py-20 text-center">
                <Search size={32} className="text-blush-200 mb-4" />
                <p className="text-sm text-charcoal-lighter max-w-xs">Selecciona un día con reservas para ver los detalles de las sesiones</p>
             </div>
           ) : (selectedSlots.length === 0 && (tasksByDay[selectedDay] || []).length === 0) ? (
             <div className="card-flat bg-white border-blush-50 py-12 text-center text-charcoal-lighter">
                No hay horarios ni tareas para este día.
             </div>
           ) : (
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Admin Tasks */}
                {(tasksByDay[selectedDay] || []).map(task => (
                   <div key={task.id} className="card-flat bg-rose-50/50 border-rose-200 border-l-4 border-l-rose-500">
                      <div className="flex items-center gap-3 mb-2">
                         <AlertCircle size={16} className="text-rose-500" />
                         <p className="text-sm font-bold text-charcoal">{task.title}</p>
                      </div>
                      <p className="text-xs text-charcoal-light mb-1">
                         {task.description}
                      </p>
                   </div>
                ))}
                {/* Sessions */}
                {selectedSlots.map((slot:any) => (
                   <SlotDetailCard key={slot.id} slot={slot} />
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function SlotDetailCard({ slot }: { slot: any }) {
  const activeBooking = slot.bookings.find((b: any) => b.status !== "CANCELADA");
  const displayBooking = activeBooking || slot.bookings[0]; // For modality/name info
  const isActuallyLibre = !activeBooking;
  const time = new Date(slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`card-flat bg-white border-l-4 transition-all shadow-sm ${
      isActuallyLibre ? "border-l-gray-300" :
      activeBooking.status === "REALIZADA" ? "border-l-emerald-500" :
      activeBooking.status === "CONFIRMADA" ? "border-l-sky-500" :
      "border-l-amber-500"
    }`}>
      <div className="flex justify-between items-start mb-4">
         <div>
          <p className="text-xl font-heading font-bold text-charcoal">{time}</p>
          <p className="text-[10px] uppercase font-bold text-charcoal-lighter tracking-widest">
            {displayBooking?.modality === "ONLINE" ? 30 : slot.durationMinutes} MIN • {slot.type}
          </p>
         </div>
         <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
           isActuallyLibre ? "bg-gray-100 text-gray-400" :
           activeBooking.status === "REALIZADA" ? "bg-emerald-50 text-emerald-600" :
           activeBooking.status === "CONFIRMADA" ? "bg-sky-50 text-sky-600" :
           "bg-amber-50 text-amber-600"
         }`}>
           {isActuallyLibre ? "LIBRE" : activeBooking.status}
         </div>
      </div>

      {displayBooking ? (
        <div className="space-y-3 pt-3 border-t border-blush-50/50">
           {isActuallyLibre && (
             <div className="flex items-center gap-2 mb-1">
               <div className="w-1 h-3 bg-red-400 rounded-full" />
               <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Anteriormente cancelada</p>
             </div>
           )}
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blush-50 flex items-center justify-center text-blush-500">
                <User size={14} />
              </div>
              <div>
                 <p className="text-sm font-medium text-charcoal">{displayBooking.user.name}</p>
                 <p className="text-[10px] text-charcoal-lighter line-clamp-1">{displayBooking.user.email}</p>
              </div>
           </div>
           <div className="flex items-center gap-2 text-xs text-charcoal-light">
              <div className="w-5 h-5 flex items-center justify-center opacity-60">
                 {displayBooking.modality === "ONLINE" ? <Globe size={12} /> : <MapPin size={12} />}
              </div>
              Modalidad {displayBooking.modality}
           </div>
        </div>
      ) : (
        <p className="text-xs text-charcoal-lighter italic pt-2 border-t border-blush-50/50">
           Este horario todavía no tiene ninguna reserva.
        </p>
      )}
    </div>
  );
}
