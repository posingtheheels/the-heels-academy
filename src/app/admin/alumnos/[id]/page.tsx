"use client";

// v1.0.1 - Borrado de bonos activo
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Mail, Phone, Calendar, Clock, 
  CreditCard, CheckCircle, AlertCircle, TrendingUp,
  Package, ChevronRight, MessageCircle, Trash2,
  UserPlus, Plus, Trophy, Users, Key
} from "lucide-react";
import Link from "next/link";

export default function AlumnaFichaPage({ params }: { params: { id: string } }) {
  const [alumna, setAlumna] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [allPlans, setAllPlans] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [showAddPlanModal, setShowAddPlanModal] = useState(false);
  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [newSessionVal, setNewSessionVal] = useState("");

  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState<any>(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", category: "", federation: "" });
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (alumna) {
      setEditForm({
        name: alumna.name,
        email: alumna.email,
        phone: alumna.phone || "",
        category: alumna.category || "",
        federation: alumna.federation || ""
      });
    }
  }, [alumna]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProcessingId("editing");
    try {
      const res = await fetch(`/api/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Error al actualizar perfil");
      setShowEditModal(false);
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) return alert("Mínimo 6 caracteres");
    setProcessingId("resetting");
    try {
      const res = await fetch(`/api/users/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) throw new Error("Error al restablecer contraseña");
      alert("Contraseña actualizada correctamente");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  useEffect(() => {
    fetchAlumna();
    fetchAdminData();
  }, [params.id]);

  async function fetchAdminData() {
    try {
      const [plansRes, slotsRes] = await Promise.all([
        fetch("/api/plans?active=true"),
        fetch("/api/slots?available=true")
      ]);
      setAllPlans(await plansRes.json());
      setAllSlots(await slotsRes.json());
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAssignPlan(planId: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/user-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: params.id, planId }),
      });
      if (!res.ok) throw new Error("Error al asignar bono");
      setShowAddPlanModal(false);
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateSessions(planId: string, used: number) {
    setProcessingId(planId);
    try {
      const res = await fetch(`/api/admin/user-plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usedSessions: used }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setEditingPlanId(null);
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDeleteUserPlan(userPlanId: string) {
    if (!confirm("¿Seguro que quieres eliminar este bono? Esta acción no se puede deshacer.")) return;
    
    setProcessingId(userPlanId);
    try {
      const res = await fetch(`/api/admin/user-plans/${userPlanId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el bono");
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAddManualBooking(slotId: string, userPlanId?: string) {
    setProcessingId(slotId);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          slotId, 
          targetUserId: params.id,
          userPlanId,
          paymentMethod: userPlanId ? "BONO" : "EN_CLASE"
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al añadir reserva");
      }
      setShowAddBookingModal(false);
      setSelectedSlotForBooking(null);
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function fetchAlumna() {
    try {
      const res = await fetch(`/api/users/${params.id}`);
      if (!res.ok) throw new Error("Error fetching alumna details");
      const data = await res.json();
      setAlumna(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking(bookingId: string) {
    if (!confirm("¿Seguro que quieres cancelar esta clase? Se devolverá la sesión al bono de la alumna.")) return;
    
    setProcessingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al cancelar");
      }
      
      // Refresh data to show updated sessions and status
      await fetchAlumna();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-blush-100 border-t-blush-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !alumna) {
    return (
      <div className="card text-center py-20 border-red-100 bg-red-50/20">
        <AlertCircle size={48} className="text-red-300 mx-auto mb-4" />
        <h2 className="text-xl font-heading text-charcoal mb-4">{error || "No se encontró la alumna"}</h2>
        <Link href="/admin/alumnos" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Volver al listado
        </Link>
      </div>
    );
  }

  // Calculate stats
  const userPlans = alumna.userPlans || [];
  
  // All plans with calculated remaining sessions
  const enrichedPlans = userPlans.map((p: any) => ({
    ...p,
    sessionsRemaining: p.totalSessions - p.usedSessions,
    isExhausted: p.usedSessions >= p.totalSessions
  })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activePlans = enrichedPlans.filter((p: any) => !p.isExhausted && p.paymentStatus === "PAGADO");

  const completedBookings = alumna.bookings?.filter((b: any) => b.status === "REALIZADA") || [];
  const pendingBookings = alumna.bookings?.filter((b: any) => b.status === "CONFIRMADA" || b.status === "PENDING") || [];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/alumnos" 
          className="p-2 bg-white border border-blush-100 rounded-xl text-charcoal-lighter hover:text-blush-500 hover:border-blush-500 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-3xl text-charcoal font-light">Ficha de Alumna</h1>
          <p className="text-xs text-charcoal-lighter uppercase tracking-widest mt-1">Gestión individualizada</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card shadow-elegant border-blush-100 flex flex-col items-center text-center p-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blush-50 to-blush-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-heading text-blush-600 mb-4">
              {alumna.name.charAt(0)}
            </div>
            <h2 className="font-heading text-2xl text-charcoal font-semibold">{alumna.name}</h2>
            <p className="text-sm text-blush-500 font-medium uppercase tracking-wider mb-6">{alumna.role}</p>
            
            <div className="w-full space-y-4 pt-6 border-t border-blush-50">
              <div className="flex items-center gap-3 text-sm text-charcoal-light">
                <Mail size={16} className="text-blush-400" />
                <span className="truncate">{alumna.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-charcoal-light group/phone">
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-blush-400" />
                  <span>{alumna.phone || "No indicado"}</span>
                </div>
                {alumna.phone && (
                  <a 
                    href={`https://wa.me/${alumna.phone.replace(/\s+/g, '')}?text=Hola%20${alumna.name.split(' ')[0]}!%20Te%20escribo%20de%20The%20Heels`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 opacity-0 group-hover/phone:opacity-100 transition-all hover:bg-emerald-100"
                    title="Hablar por WhatsApp"
                  >
                    <MessageCircle size={14} />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-light">
                <Calendar size={16} className="text-blush-400" />
                <span>Alta: {new Date(alumna.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              
              <div className="divider-wide !my-2" />
              
              <div className="flex items-center gap-3 text-sm text-charcoal-light">
                <Trophy size={16} className="text-blush-400" />
                <span>Categoría: {alumna.category || "Sin definir"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-charcoal-light">
                <Users size={16} className="text-blush-400" />
                <span>Federación: {alumna.federation || "Sin definir"}</span>
              </div>
            </div>

            <div className="flex gap-2 w-full mt-8">
              <button 
                onClick={() => setShowEditModal(true)}
                className="btn-primary flex-1 py-3 text-xs"
              >
                Editar Perfil
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="p-3 rounded-2xl bg-charcoal-light text-white hover:bg-charcoal transition-all shadow-sm"
                title="Cambiar Contraseña"
              >
                <Key size={16} />
              </button>
            </div>
          </div>

          {/* Activity Mini Stats */}
          <div className="card bg-charcoal text-white p-6 shadow-elegant overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
            <h3 className="text-xs uppercase tracking-widest text-white/50 mb-4 flex items-center gap-2">
              <TrendingUp size={14} /> Resumen Actividad
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-heading font-bold">{completedBookings.length}</p>
                <p className="text-[10px] text-white/40 uppercase tracking-tighter">Clases hechas</p>
              </div>
              <div>
                <p className="text-2xl font-heading font-bold tracking-tight text-blush-300">
                  {activePlans.reduce((acc: number, p: any) => acc + p.sessionsRemaining, 0)}
                </p>
                <p className="text-[10px] text-white/40 uppercase tracking-tighter">Sesiones disp.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Bonus History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl text-charcoal flex items-center gap-2">
                <Package size={20} className="text-blush-400" />
                Historial de Bonos
              </h3>
              <button 
                onClick={() => setShowAddPlanModal(true)}
                className="text-xs font-bold uppercase tracking-widest text-blush-500 hover:text-blush-600 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Asignar Bono
              </button>
            </div>

            {enrichedPlans.length > 0 ? (
              <div className="space-y-4">
                {enrichedPlans.map((userPlan: any) => (
                  <div 
                    key={userPlan.id} 
                    className={`card shadow-sm flex items-center justify-between p-5 group transition-all border-l-4 ${
                      userPlan.isExhausted 
                        ? "border-l-charcoal-light bg-charcoal-light/5 opacity-80" 
                        : userPlan.paymentStatus === "PAGADO" 
                          ? "border-l-emerald-400" 
                          : "border-l-amber-400"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-charcoal">{userPlan.plan.name}</h4>
                        {userPlan.isExhausted ? (
                          <span className="text-[8px] uppercase font-bold text-charcoal-lighter border border-charcoal-lighter/30 px-1.5 py-0.5 rounded">Agotado</span>
                        ) : userPlan.paymentStatus !== "PAGADO" ? (
                          <span className="text-[8px] uppercase font-bold text-amber-500 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded">Pendiente Pago</span>
                        ) : (
                          <span className="text-[8px] uppercase font-bold text-emerald-500 border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 rounded">Activo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-charcoal-lighter">
                          Comprado: {new Date(userPlan.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        <span className="text-xs text-charcoal-lighter/60 font-mono">ID: {userPlan.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {/* Used Sessions Control */}
                      <div className="text-right space-y-1">
                        <div className="flex items-center justify-end gap-2">
                          {editingPlanId === userPlan.id ? (
                            <div className="flex items-center gap-1">
                              <input 
                                type="number" 
                                className="w-12 text-center text-sm font-bold border-b border-blush-300 focus:outline-none"
                                value={newSessionVal}
                                onChange={(e) => setNewSessionVal(e.target.value)}
                                autoFocus
                              />
                              <button 
                                onClick={() => handleUpdateSessions(userPlan.id, parseInt(newSessionVal))}
                                className="p-1 text-emerald-500 hover:bg-emerald-50 rounded"
                              >
                                <CheckCircle size={14} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingPlanId(userPlan.id);
                                setNewSessionVal(userPlan.usedSessions.toString());
                              }}
                              className="text-2xl font-heading font-bold text-charcoal group-hover:text-blush-500 transition-colors"
                            >
                              {userPlan.usedSessions}
                            </button>
                          )}
                          <span className="text-sm text-charcoal-lighter font-medium">/ {userPlan.totalSessions}</span>
                        </div>
                        <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest">Usadas</p>
                      </div>
                      
                      <div className="w-px h-8 bg-blush-50" />
                      
                      {/* Remaining Sessions */}
                      <div className="text-right">
                        <p className="text-2xl font-heading font-bold text-charcoal leading-none">
                          {userPlan.sessionsRemaining}
                        </p>
                        <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest mt-1">Disp.</p>
                      </div>

                      <div className="w-px h-8 bg-blush-50" />

                      {/* Delete Button */}
                      <button 
                        onClick={() => handleDeleteUserPlan(userPlan.id)}
                        disabled={processingId === userPlan.id}
                        className="p-2.5 text-charcoal-lighter hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar Bono"
                      >
                        {processingId === userPlan.id ? (
                          <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 border-dashed border-blush-200 bg-blush-50/10 text-center">
                <CreditCard size={32} className="text-blush-200 mx-auto mb-3" />
                <p className="text-sm text-charcoal-lighter">Esta alumna no tiene bonos activos actualmente.</p>
                <button 
                  onClick={() => setShowAddPlanModal(true)}
                  className="text-blush-500 text-xs font-semibold mt-4 hover:underline"
                >
                  Asignar bono manualmente
                </button>
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-xl text-charcoal flex items-center gap-2">
                <Clock size={20} className="text-blush-400" />
                Historial de Reservas
              </h3>
              <button 
                onClick={() => setShowAddBookingModal(true)}
                className="text-xs font-bold uppercase tracking-widest text-blush-500 hover:text-blush-600 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Añadir Reserva
              </button>
            </div>

            {alumna.bookings?.length > 0 ? (
              <div className="card !p-0 overflow-hidden shadow-elegant">
                <table className="w-full text-left font-body">
                  <thead className="bg-blush-50/50 border-b border-blush-100">
                    <tr>
                      <th className="px-6 py-3 text-[10px] uppercase font-bold text-charcoal-lighter tracking-widest">Fecha</th>
                      <th className="px-6 py-3 text-[10px] uppercase font-bold text-charcoal-lighter tracking-widest text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blush-50">
                    {alumna.bookings.map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-blush-50/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
                               booking.status === 'CANCELADA' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                             }`}>
                               {booking.status === 'CANCELADA' ? 'X' : '✓'}
                             </div>
                             <div>
                                <p className="text-sm font-bold text-charcoal">
                                  {new Date(booking.slot.dateTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                                </p>
                                <p className="text-[10px] text-charcoal-lighter uppercase tracking-tighter">
                                  {new Date(booking.slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {booking.modality}
                                </p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {booking.status !== "CANCELADA" && booking.status !== "REALIZADA" && (
                            <button 
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={processingId === booking.id}
                              className="btn-ghost !py-1.5 !px-3 text-[10px] font-bold text-red-400 hover:text-red-600 hover:bg-red-50"
                            >
                              {processingId === booking.id ? "..." : "CANCELAR"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card p-8 border-dashed border-blush-200 bg-blush-50/10 text-center">
                <Calendar size={32} className="text-blush-200 mx-auto mb-3" />
                <p className="text-sm text-charcoal-lighter">Sin reservas registradas.</p>
                <button 
                  onClick={() => setShowAddBookingModal(true)}
                  className="text-blush-500 text-xs font-semibold mt-4 hover:underline"
                >
                  Adjudicar clase manualmente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Plan Modal */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowAddPlanModal(false)} className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-colors">
              <Plus size={20} className="rotate-45" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Asignar Nuevo Bono</h3>
            <p className="text-sm text-charcoal-lighter mb-8">Selecciona un plan para añadirlo directamente a la cuenta de la alumna.</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {allPlans.map(plan => (
                <button 
                  key={plan.id}
                  onClick={() => handleAssignPlan(plan.id)}
                  className="w-full text-left p-4 rounded-2xl border border-blush-50 hover:border-blush-400 hover:bg-blush-50/30 transition-all flex items-center justify-between group"
                >
                  <div>
                    <p className="font-bold text-charcoal group-hover:text-blush-600 transition-colors">{plan.name}</p>
                    <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest mt-1">{plan.totalSessions} Sesiones • {plan.price}€</p>
                  </div>
                  <ChevronRight size={16} className="text-blush-200 group-hover:text-blush-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Booking Modal */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button 
              onClick={() => {
                setShowAddBookingModal(false);
                setSelectedSlotForBooking(null);
              }} 
              className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-colors p-1"
            >
              <Plus size={20} className="rotate-45" />
            </button>

            {!selectedSlotForBooking ? (
              <>
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Adjudicar Clase</h3>
                <p className="text-sm text-charcoal-lighter mb-8">Paso 1: Elige un horario disponible.</p>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {allSlots.filter(s => s.available).length > 0 ? (
                    allSlots.filter(s => s.available).map(slot => (
                      <button 
                        key={slot.id}
                        onClick={() => setSelectedSlotForBooking(slot)}
                        className="w-full text-left p-4 rounded-2xl border border-blush-50 hover:border-blush-400 hover:bg-blush-50/30 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-charcoal group-hover:text-blush-600 transition-colors">
                            {new Date(slot.dateTime).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </p>
                          <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest mt-1 flex items-center gap-2">
                            <Clock size={10} /> {new Date(slot.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {slot.type}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-blush-200 group-hover:text-blush-500 transition-colors" />
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-charcoal-lighter py-8">No hay horarios disponibles próximamente.</p>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setSelectedSlotForBooking(null)}
                  className="mb-4 text-[10px] uppercase font-bold tracking-widest text-blush-500 flex items-center gap-1 hover:gap-2 transition-all p-1"
                >
                  <ArrowLeft size={12} /> Volver a horarios
                </button>
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Consumir Bono</h3>
                <p className="text-sm text-charcoal-lighter mb-8">
                  Paso 2: ¿A qué bono descontamos esta clase?
                  <br /><span className="text-[10px] text-blush-400 font-bold uppercase">{new Date(selectedSlotForBooking.dateTime).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </p>
                
                <div className="space-y-3">
                  {activePlans.length > 0 ? (
                    activePlans.map(up => (
                      <button 
                        key={up.id}
                        onClick={() => handleAddManualBooking(selectedSlotForBooking.id, up.id)}
                        className="w-full text-left p-4 rounded-2xl border border-blush-50 hover:border-emerald-400 hover:bg-emerald-50/10 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <p className="font-bold text-charcoal group-hover:text-emerald-600 transition-colors">{up.plan.name}</p>
                          <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest mt-1">
                            Quedan {up.totalSessions - up.usedSessions} de {up.totalSessions}
                          </p>
                        </div>
                        <CheckCircle size={16} className="text-emerald-200 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold uppercase text-center mb-4">
                      La alumna no tiene bonos activos
                    </div>
                  )}

                  <div className="divider-wide !my-2" />

                  <button 
                    onClick={() => handleAddManualBooking(selectedSlotForBooking.id)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-blush-200 text-charcoal-light hover:border-blush-500 hover:text-blush-600 transition-all text-xs font-bold uppercase tracking-widest"
                  >
                    Omitir bono (Pagar en clase / Gratis)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative animate-pop-in border-none">
            <button 
              onClick={() => setShowEditModal(false)} 
              className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-all p-1"
            >
              <Trash2 size={24} className="opacity-40 hover:opacity-100 rotate-45" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Editar Perfil</h3>
            <p className="text-sm text-charcoal-lighter mb-8 flex items-center gap-2">
              <Mail size={14} /> Actualiza los datos de la cuenta
            </p>

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="input !py-3 !text-sm"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="input !py-3 !text-sm"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Teléfono</label>
                <input
                  type="text"
                  className="input !py-3 !text-sm"
                  placeholder="Ej: 600 000 000"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Categoría</label>
                  <input
                    type="text"
                    className="input !py-3 !text-sm"
                    placeholder="Ej: Bikini"
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Federación</label>
                  <input
                    type="text"
                    className="input !py-3 !text-sm"
                    placeholder="Ej: NPC"
                    value={editForm.federation}
                    onChange={(e) => setEditForm({ ...editForm, federation: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary flex-1 py-3 text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processingId === "editing"}
                  className="btn-primary flex-1 py-3 text-xs tracking-widest"
                >
                  {processingId === "editing" ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative animate-pop-in border-none">
            <button 
              onClick={() => setShowPasswordModal(false)} 
              className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-all p-1"
            >
              <Trash2 size={24} className="opacity-40 hover:opacity-100 rotate-45" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2 text-center">Reiniciar Contraseña</h3>
            <p className="text-sm text-charcoal-lighter mb-8 text-center">Establece una nueva contraseña de acceso para esta alumna.</p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Nueva Contraseña</label>
                <input
                  type="text"
                  required
                  placeholder="Mínimo 6 caracteres"
                  className="input !py-3 !text-sm text-center"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={processingId === "resetting"}
                className="btn-primary w-full py-3 text-xs tracking-widest mt-2"
              >
                {processingId === "resetting" ? "Cambiando..." : "Actualizar Contraseña"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
