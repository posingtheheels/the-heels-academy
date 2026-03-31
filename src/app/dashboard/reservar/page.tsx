"use client";

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch("/api/slots?available=true");
      if (!res.ok) throw new Error("Error fetching slots");
      const data = await res.json();
      setSlots(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const monthName = currentMonth.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
    setSelectedDate(null);
  };

  const today = new Date();
  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const hasSlots = (day: number) => {
    return slots.some(slot => {
      const d = new Date(slot.dateTime);
      return d.getDate() === day && 
             d.getMonth() === currentMonth.getMonth() && 
             d.getFullYear() === currentMonth.getFullYear();
    });
  };

  const daySlots = selectedDate ? slots.filter(slot => {
    const d = new Date(slot.dateTime);
    return d.getDate() === selectedDate && 
           d.getMonth() === currentMonth.getMonth() && 
           d.getFullYear() === currentMonth.getFullYear();
  }) : [];

  const [selectedModality, setSelectedModality] = useState<Record<string, string>>({});

  async function handleBook(slotId: string, method: string) {
    const slot = slots.find(s => s.id === slotId);
    setBookingLoading(true);
    setError("");
    
    // Determine modality: Use the selected one if "AMBAS", otherwise use the slot's fixed type
    const modality = slot.type === "AMBAS" 
      ? (selectedModality[slotId] || "PRESENCIAL") 
      : slot.type;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId,
          paymentMethod: method, // "BONO" or "EN_CLASE"
          modality: modality,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al realizar la reserva");
      
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/historial"), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBookingLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-emerald-500" />
        </div>
        <h2 className="font-heading text-3xl text-charcoal mb-4">¡Reserva confirmada!</h2>
        <p className="text-charcoal-lighter mb-8">Te hemos enviado un email con los detalles. Redirigiendo a tu historial...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Reservar clase
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          Selecciona un día para ver las horas disponibles
        </p>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm animate-fade-in">
          <div className="card-flat bg-white w-full max-w-sm p-8 shadow-2xl border-none text-center animate-pop-in">
             <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
               <AlertCircle size={32} className="text-red-500" />
             </div>
             <h3 className="font-heading text-xl font-bold text-charcoal mb-3">
               Ops! Algo ha fallado
             </h3>
             <p className="text-sm text-charcoal-lighter mb-8 leading-relaxed">
               {error}
             </p>
             <button 
               onClick={() => setError("")}
               className="btn-primary w-full py-4 text-xs font-bold uppercase tracking-[0.2em]"
             >
               Entendido
             </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calendar Card */}
        <div className="card h-fit">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-blush-50 transition-colors"
            >
              <ChevronLeft size={18} className="text-charcoal-light" />
            </button>
            <h2 className="font-heading text-xl text-charcoal capitalize whitespace-nowrap">
              {monthName}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-blush-50 transition-colors"
            >
              <ChevronRight size={18} className="text-charcoal-light" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
              <div key={day} className="text-center text-[10px] uppercase tracking-widest text-charcoal-lighter py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasAvailable = hasSlots(day);
              const isSelected = selectedDate === day;

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all duration-200 relative ${
                    isSelected
                      ? "bg-charcoal text-white shadow-elegant"
                      : isToday(day)
                      ? "bg-blush-100 text-charcoal font-semibold"
                      : hasAvailable
                      ? "text-charcoal hover:bg-blush-50"
                      : "text-charcoal-lighter/30"
                  }`}
                >
                  {day}
                  {hasAvailable && !isSelected && (
                    <div className="w-1 h-1 rounded-full bg-blush-400 absolute bottom-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Slots Content */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl text-charcoal mb-4 flex items-center gap-2">
            <Clock size={18} className="text-blush-300" />
            Horarios {selectedDate && `para el día ${selectedDate}`}
          </h3>
          
          {loading ? (
             <div className="card text-center py-12">
               <div className="w-6 h-6 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin mx-auto mb-2" />
               <p className="text-xs text-charcoal-lighter">Cargando horarios...</p>
             </div>
          ) : !selectedDate ? (
            <div className="card text-center py-12 border-dashed border-blush-200 bg-transparent">
              <CalendarIcon size={32} className="text-blush-200 mx-auto mb-3" />
              <p className="text-sm text-charcoal-lighter">
                Selecciona un día del calendario
              </p>
            </div>
          ) : daySlots.length > 0 ? (
            daySlots.map(slot => (
                <div key={slot.id} className="card group hover:border-blush-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-2xl font-heading font-medium text-charcoal">
                        {new Date(slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-charcoal-lighter tracking-wide uppercase">
                        {slot.type === "AMBAS" 
                          ? ((selectedModality[slot.id] || "PRESENCIAL") === "ONLINE" ? "30 MIN" : "60 MIN") 
                          : `${slot.durationMinutes} MIN`} • {slot.type}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
                      <Clock size={16} className="text-blush-400" />
                    </div>
                  </div>

                  {/* Modality Selector if AMBAS */}
                  {slot.type === "AMBAS" && (
                    <div className="mb-4 p-1 bg-blush-50/30 rounded-xl flex gap-1 border border-blush-100/50">
                      <button 
                        onClick={() => setSelectedModality({...selectedModality, [slot.id]: "PRESENCIAL"})}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                          (selectedModality[slot.id] || "PRESENCIAL") === "PRESENCIAL"
                            ? "bg-white text-charcoal shadow-sm"
                            : "text-charcoal-lighter hover:text-charcoal"
                        }`}
                      >
                        Presencial
                      </button>
                      <button 
                        onClick={() => setSelectedModality({...selectedModality, [slot.id]: "ONLINE"})}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-all ${
                          selectedModality[slot.id] === "ONLINE"
                            ? "bg-white text-charcoal shadow-sm"
                            : "text-charcoal-lighter hover:text-charcoal"
                        }`}
                      >
                        Online
                      </button>
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => handleBook(slot.id, "BONO")}
                      disabled={bookingLoading}
                      className="btn-primary py-2 text-xs w-full flex items-center justify-center gap-2"
                    >
                      {bookingLoading ? (
                        <div className="w-4 h-4 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
                      ) : (
                        "Reservar con mi bono"
                      )}
                    </button>
                    
                    {/* Hide pay-in-class if online is selected for AMBAS slots */}
                    {(!(selectedModality[slot.id] === "ONLINE") || slot.type === "AMBAS") && (
                      <button 
                        onClick={() => handleBook(slot.id, "EN_CLASE")}
                        disabled={bookingLoading}
                        className="btn-secondary py-2 text-xs w-full"
                      >
                        {bookingLoading ? "Procesando..." : "Reservar y pagar en clase"}
                      </button>
                    )}
                  </div>
                </div>
            ))
          ) : (
            <div className="card text-center py-12">
              <CalendarIcon size={32} className="text-blush-200 mx-auto mb-3" />
              <p className="text-sm text-charcoal-lighter">
                No hay horarios disponibles para este día
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
