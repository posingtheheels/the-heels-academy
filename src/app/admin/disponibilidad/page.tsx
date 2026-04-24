"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Trash2, Calendar, AlertCircle, CheckCircle, X, ChevronRight, List } from "lucide-react";

export default function DisponibilidadPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Selection mode: single or range
  const [mode, setMode] = useState<"SINGLE" | "RANGE">("SINGLE");

  const [formData, setFormData] = useState({
    date: "",
    startDate: "",
    endDate: "",
    durationMinutes: "60",
    type: "AMBAS",
  });
  
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState("");

  const daysLabels = ["L", "M", "X", "J", "V", "S", "D"];

  useEffect(() => {
    fetchSlots();
  }, []);

  async function fetchSlots() {
    try {
      const res = await fetch("/api/slots");
      if (!res.ok) throw new Error("Error fetching slots");
      const data = await res.json();
      setSlots(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function addTime() {
    if (currentTime && !selectedTimes.includes(currentTime)) {
      setSelectedTimes([...selectedTimes, currentTime].sort());
      setCurrentTime("");
    }
  }

  function removeTime(time: string) {
    setSelectedTimes(selectedTimes.filter(t => t !== time));
  }

  function toggleDay(index: number) {
    const day = index + 1; // 1-7 (Mon-Sun)
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  }

  async function handleUpdateType(id: string, newType: string) {
    try {
      const res = await fetch(`/api/slots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: newType }),
      });
      
      if (!res.ok) throw new Error("Error al actualizar la modalidad");
      
      setSlots(slots.map(s => s.id === id ? { ...s, type: newType } : s));
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!confirm("¿Seguro que quieres borrar este horario?")) return;
    
    setError("");
    setSuccess("");
    setDeletingId(id);
    
    try {
      const res = await fetch(`/api/slots/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al borrar");
      
      setSuccess("Horario borrado correctamente");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Update local state immediately for better UX
      setSlots(prev => prev.filter(s => s.id !== id));
      
      // Refresh from server too
      fetchSlots();
    } catch (err: any) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleCreateSlot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (selectedTimes.length === 0) {
      setError("Debes añadir al menos una hora");
      return;
    }
    
    try {
      const allSlots: any[] = [];
      
      if (mode === "SINGLE") {
        if (!formData.date) throw new Error("Debe seleccionar una fecha");
        selectedTimes.forEach(time => {
          allSlots.push({
            dateTime: new Date(`${formData.date}T${time}`).toISOString(),
            durationMinutes: formData.durationMinutes,
            type: formData.type,
          });
        });
      } else {
        if (!formData.startDate || !formData.endDate) throw new Error("Seleccione el rango de fechas");
        if (selectedDays.length === 0) throw new Error("Seleccione al menos un día de la semana");
        
        let current = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        
        while (current <= end) {
          // getDay() gives 0 for Sunday, 1 for Monday...
          // We normalize Sunday to 7
          const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay();
          
          if (selectedDays.includes(dayOfWeek)) {
            const dateStr = current.toISOString().split('T')[0];
            selectedTimes.forEach(time => {
              allSlots.push({
                dateTime: new Date(`${dateStr}T${time}`).toISOString(),
                durationMinutes: formData.durationMinutes,
                type: formData.type,
              });
            });
          }
          current.setDate(current.getDate() + 1);
        }
      }

      if (allSlots.length === 0) throw new Error("No se generaron slots con los criterios seleccionados");

      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(allSlots),
      });

      if (!res.ok) throw new Error("Error al crear los slots");
      
      setSuccess(`${allSlots.length} horarios creados correctamente`);
      setShowForm(false);
      setSelectedTimes([]);
      fetchSlots();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light text-gradient-blush">
            Disponibilidad
          </h1>
          <p className="text-sm text-charcoal-lighter mt-1">
            Gestiona los horarios disponibles para clases
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary gap-2"
        >
          {showForm ? "Cancelar" : <><Plus size={14} /> Gestión avanzada</>}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm mb-6">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {/* Add Slot Form */}
      {showForm && (
        <div className="card mb-8 animate-fade-in-down border-blush-200 shadow-elegant overflow-hidden">
          <div className="bg-blush-50/30 px-6 py-4 border-b border-blush-100 flex items-center justify-between">
            <h3 className="font-heading text-lg text-charcoal flex items-center gap-2">
              <Calendar size={18} className="text-blush-400" />
              Gestión avanzada de horarios
            </h3>
            <div className="flex bg-white p-1 rounded-xl border border-blush-100">
              <button 
                onClick={() => setMode("SINGLE")}
                className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-lg transition-all ${mode === "SINGLE" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-blush-50"}`}
              >
                Día único
              </button>
              <button 
                onClick={() => setMode("RANGE")}
                className={`text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-lg transition-all ${mode === "RANGE" ? "bg-charcoal text-white" : "text-charcoal-lighter hover:bg-blush-50"}`}
              >
                Rango / Recurrente
              </button>
            </div>
          </div>
          
          <form onSubmit={handleCreateSlot} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Dates & Times */}
              <div className="space-y-6">
                {mode === "SINGLE" ? (
                  <div>
                    <label className="input-label">Fecha específica</label>
                    <input 
                      type="date" 
                      className="input" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Fecha inicio</label>
                        <input 
                          type="date" 
                          className="input" 
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="input-label">Fecha fin</label>
                        <input 
                          type="date" 
                          className="input" 
                          required
                          value={formData.endDate}
                          onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="input-label mb-2 block">Días de la semana</label>
                      <div className="flex gap-2">
                        {daysLabels.map((label, index) => (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleDay(index)}
                            className={`w-10 h-10 rounded-xl border font-bold text-xs transition-all ${
                              selectedDays.includes(index + 1)
                                ? "bg-charcoal text-white border-charcoal"
                                : "bg-white text-charcoal-lighter border-blush-100 hover:bg-blush-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="divider-wide" />
                
                <div>
                  <label className="input-label">Añadir horas de clase</label>
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="time" 
                      className="input" 
                      value={currentTime}
                      onChange={(e) => setCurrentTime(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={addTime}
                      className="btn-secondary px-6"
                    >
                      Añadir
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-2xl bg-blush-50/20 border border-blush-100/30">
                    {selectedTimes.length === 0 ? (
                      <span className="text-[10px] text-charcoal-lighter/50 tracking-widest uppercase py-1 px-1">Define el horario...</span>
                    ) : (
                      selectedTimes.map(time => (
                        <div key={time} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-blush-200 rounded-full text-xs font-semibold text-charcoal shadow-sm hover:border-blush-400 transition-colors group">
                          <Clock size={12} className="text-blush-300" />
                          {time}
                          <button type="button" onClick={() => removeTime(time)} className="text-charcoal-lighter hover:text-red-500 transition-colors ml-1">
                            <X size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Settings */}
              <div className="space-y-6">
                <div className="bg-blush-50/30 rounded-3xl p-6 space-y-6">
                  <div>
                    <label className="input-label">Duración de cada clase</label>
                    <select 
                      className="input"
                      value={formData.durationMinutes}
                      onChange={(e) => setFormData({...formData, durationMinutes: e.target.value})}
                    >
                      <option value="30">30 minutos (Express)</option>
                      <option value="60">60 minutos (Estándar)</option>
                      <option value="90">90 minutos (Masterclass)</option>
                    </select>
                  </div>
                  <div>
                    <label className="input-label">Modalidad (global)</label>
                    <select 
                      className="input"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="AMBAS">Cualquier modalidad (Online / Presencial)</option>
                      <option value="ONLINE">Solo clases Online</option>
                      <option value="PRESENCIAL">Solo clases Presenciales</option>
                    </select>
                  </div>
                  
                  <div className="pt-4 border-t border-blush-100 text-center">
                    <p className="text-[10px] uppercase tracking-tighter text-charcoal-lighter font-medium">Recomendación</p>
                    <p className="text-xs text-charcoal-lighter/60 italic px-4 mt-1">
                      Crea bloques de horas consecutivas para una mejor organización de tu agenda
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 mt-12 bg-blush-50/10 -mx-6 -mb-6 px-6 py-6 border-t border-blush-100">
              <button type="submit" className="btn-primary gap-2 flex-1 justify-center py-4 text-sm font-bold shadow-elegant hover:scale-[1.01] active:scale-[0.98]">
                <CheckCircle size={18} />
                Generar todos los horarios
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-ghost flex-1 justify-center py-4 text-sm"
              >
                Cancelar y volver
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Slots List */}
      <div className="space-y-4">
        {loading ? (
          <div className="card text-center py-16">
            <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-charcoal-lighter">Cargando...</p>
          </div>
        ) : slots.length > 0 ? (
          slots.map((slot) => (
            <div key={slot.id} className="card flex items-center justify-between py-4">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-blush-50 flex items-center justify-center">
                  <Calendar size={20} className="text-blush-500" />
                </div>
                <div>
                  <p className="font-heading text-lg text-charcoal">
                    {new Date(slot.dateTime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-charcoal-lighter">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-charcoal-lighter/30" />
                    <span>{slot.durationMinutes} min</span>
                    <span className="w-1 h-1 rounded-full bg-charcoal-lighter/30" />
                    <select
                      value={slot.type}
                      onChange={(e) => handleUpdateType(slot.id, e.target.value)}
                      className="bg-blush-50 border-none text-[10px] font-bold uppercase tracking-wider text-blush-500 rounded-full px-2 py-0.5 cursor-pointer hover:bg-blush-100 transition-colors focus:ring-1 focus:ring-blush-200 outline-none"
                    >
                      <option value="AMBAS">Ambas</option>
                      <option value="ONLINE">Online</option>
                      <option value="PRESENCIAL">Presencial</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${slot.available ? "badge-success" : "badge-warning"}`}>
                  {slot.available ? "Disponible" : "Ocupado"}
                </span>
                <button 
                  onClick={() => handleDeleteSlot(slot.id)}
                  disabled={deletingId === slot.id}
                  className={`p-2 transition-colors ${deletingId === slot.id ? "text-charcoal-lighter animate-pulse" : "text-red-300 hover:text-red-500"}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-16">
            <Clock size={40} className="text-blush-200 mx-auto mb-4" />
            <h2 className="font-heading text-xl text-charcoal mb-2">
              No hay slots creados
            </h2>
            <p className="text-sm text-charcoal-lighter max-w-sm mx-auto">
              Crea horarios disponibles para que las alumnas puedan reservar sus clases
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
