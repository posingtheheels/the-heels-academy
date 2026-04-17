"use client";

// v1.0.1 - Borrado de bonos activo
import { useState, useEffect } from "react";
import { 
  ArrowLeft, Mail, Phone, Calendar, Clock, 
  CreditCard, CheckCircle, AlertCircle, TrendingUp,
  Package, ChevronRight, MessageCircle, Trash2,
  UserPlus, Plus, Trophy, Users, Key, Sparkles, Loader2, X, Image as ImageIcon, Edit2, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
  
  // Progress Log State
  const [progressLogs, setProgressLogs] = useState<any[]>([]);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [newLog, setNewLog] = useState({ title: "", content: "", category: "GENERAL", imageUrl: "" });
  const [uploadingImage, setUploadingImage] = useState(false);

  async function handleImageUploadLog(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen es demasiado pesada (máximo 5MB)");
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `progress-${params.id}-${Date.now()}`;

      const { error: uploadError } = await supabase.storage
        .from('feedbacks') // Usamos el mismo bucket por ahora si ya está configurado
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('feedbacks')
        .getPublicUrl(filePath);

      setNewLog({ ...newLog, imageUrl: publicUrl });
    } catch (err: any) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  }

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
    fetchProgressLogs();
  }, [params.id]);

  async function fetchProgressLogs() {
    try {
      const res = await fetch(`/api/admin/progress?userId=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setProgressLogs(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteProgressLog(logId: string) {
    if (!confirm("¿Estás seguro de eliminar este registro de evolución?")) return;
    
    setProcessingId(`deleting-log-${logId}`);
    try {
      const res = await fetch(`/api/admin/progress/${logId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar el registro");
      
      // Update local state
      setProgressLogs(prev => prev.filter(l => l.id !== logId));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleAddProgressLog(e: React.FormEvent) {
    e.preventDefault();
    setProcessingId("adding-log");
    try {
      const res = await fetch("/api/admin/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newLog, userId: params.id }),
      });
      if (!res.ok) throw new Error("Error al añadir nota de progreso");
      setShowAddLogModal(false);
      setNewLog({ title: "", content: "", category: "GENERAL", imageUrl: "" });
      await fetchProgressLogs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  }

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

  async function handleSyncToGoogle(bookingId: string) {
    setProcessingId(`sync-${bookingId}`);
    try {
      const res = await fetch("/api/admin/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al sincronizar");
      
      alert("✅ Sincronizado con Google Calendar con éxito");
      fetchAlumna();
    } catch (err: any) {
      console.error(err);
      alert("❌ Error: " + err.message);
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
      const res = await fetch(`/api/users/${params.id}`, { cache: 'no-store' });
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
                          {editingPlanId === `used-${userPlan.id}` ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                className="w-12 text-center text-sm font-bold border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/50 rounded-t-lg"
                                value={newSessionVal}
                                onChange={(e) => setNewSessionVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleUpdateSessions(userPlan.id, parseInt(newSessionVal));
                                  }
                                  if (e.key === 'Escape') setEditingPlanId(null);
                                }}
                                autoFocus
                              />
                              <button 
                                onClick={() => handleUpdateSessions(userPlan.id, parseInt(newSessionVal))}
                                className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 shadow-sm transition-all"
                              >
                                GUARDAR
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingPlanId(`used-${userPlan.id}`);
                                setNewSessionVal(userPlan.usedSessions.toString());
                              }}
                              className="group flex items-center justify-center text-charcoal hover:text-blush-500 transition-colors bg-blush-50/20 hover:bg-blush-50 py-1 px-2 rounded-xl border border-transparent hover:border-blush-100"
                              title="Modificar sesiones usadas"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-heading font-bold leading-none">
                                  {userPlan.usedSessions}
                                </span>
                                <Edit2 size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )}
                          <span className="text-sm text-charcoal-lighter font-medium">/ {userPlan.totalSessions}</span>
                        </div>
                        <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest text-center mt-1">Usadas</p>
                      </div>
                      
                      <div className="w-px h-8 bg-blush-50" />
                      
                      {/* Remaining Sessions Control */}
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingPlanId === `rem-${userPlan.id}` ? (
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                className="w-12 text-center text-sm font-bold border-b-2 border-emerald-500 focus:outline-none bg-emerald-50/50 rounded-t-lg"
                                value={newSessionVal}
                                onChange={(e) => setNewSessionVal(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const left = parseInt(newSessionVal);
                                    const used = userPlan.totalSessions - left;
                                    handleUpdateSessions(userPlan.id, used);
                                  }
                                  if (e.key === 'Escape') setEditingPlanId(null);
                                }}
                                autoFocus
                              />
                              <button 
                                onClick={() => {
                                  const left = parseInt(newSessionVal);
                                  const used = userPlan.totalSessions - left;
                                  handleUpdateSessions(userPlan.id, used);
                                }}
                                className="px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-600 shadow-sm transition-all"
                              >
                                GUARDAR
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingPlanId(`rem-${userPlan.id}`);
                                setNewSessionVal(userPlan.sessionsRemaining.toString());
                              }}
                              className="group flex flex-col items-center justify-center text-charcoal hover:text-blush-500 transition-colors bg-blush-50/20 hover:bg-blush-50 py-1.5 px-3 rounded-xl border border-transparent hover:border-blush-100"
                              title="Modificar sesiones disponibles"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="text-2xl font-heading font-bold leading-none">
                                  {userPlan.sessionsRemaining}
                                </span>
                                <Edit2 size={12} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )}
                        </div>
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
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          {booking.status !== "CANCELADA" && (
                            <button 
                              onClick={() => handleSyncToGoogle(booking.id)}
                              disabled={processingId === `sync-${booking.id}`}
                              className="p-2 rounded-xl bg-sky-50 text-sky-500 hover:bg-sky-100 transition-all border border-sky-100"
                              title="Sincronizar con Google Calendar"
                            >
                              <RefreshCw size={14} className={processingId === `sync-${booking.id}` ? "animate-spin" : ""} />
                            </button>
                          )}
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

          {/* Progress Dossier / Evolution Log */}
          <div className="pt-8 border-t border-blush-50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-xl text-charcoal flex items-center gap-2">
                <Sparkles size={20} className="text-blush-400" />
                Dossier de Evolución
              </h3>
              <button 
                onClick={() => setShowAddLogModal(true)}
                className="btn-primary !py-2 !px-4 !text-[10px] tracking-widest flex items-center gap-2"
              >
                <Plus size={14} /> Nuevo Registro
              </button>
            </div>

            {progressLogs.length > 0 ? (
              <div className="space-y-6">
                {progressLogs.map((log: any) => (
                  <div key={log.id} className="card bg-white border-blush-100 p-6 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blush-50 text-blush-600 text-[9px] font-bold uppercase tracking-widest rounded-full">
                          {log.category}
                        </span>
                        <span className="text-[10px] text-charcoal-lighter uppercase font-bold tracking-widest">
                          {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteProgressLog(log.id)}
                        disabled={processingId === `deleting-log-${log.id}`}
                        className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        {processingId === `deleting-log-${log.id}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                    <h4 className="font-bold text-charcoal mb-2">{log.title}</h4>
                    <p className="text-sm text-charcoal-light leading-relaxed whitespace-pre-wrap mb-4">
                      {log.content}
                    </p>
                    {log.imageUrl && (
                      <div className="mt-4 rounded-xl overflow-hidden bg-charcoal-light/5 border border-blush-50 max-w-md">
                        <img src={log.imageUrl} alt={log.title} className="w-full h-auto max-h-[80vh] object-contain" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-12 border-dashed border-blush-200 bg-blush-50/5 text-center">
                <TrendingUp size={32} className="text-blush-100 mx-auto mb-3" />
                <p className="text-sm text-charcoal-lighter font-medium">No hay registros de evolución técnica aún.</p>
                <p className="text-xs text-charcoal-lighter/60 mt-1">Añade feedback sobre posing, nutrición o progresos aquí.</p>
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
                    activePlans.map((up: any) => (
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

      {/* Add Progress Log Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button 
              onClick={() => setShowAddLogModal(false)}
              className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-all p-1"
            >
              <Plus size={24} className="rotate-45" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Nuevo Registro de Evolución</h3>
            <p className="text-sm text-charcoal-lighter mb-8">Añade feedback técnico, fotos de progreso o hitos de preparación.</p>

            <form onSubmit={handleAddProgressLog} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Título de la Entrada</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Check-in Posing Abril"
                    className="input !py-3 !text-sm"
                    value={newLog.title}
                    onChange={(e) => setNewLog({ ...newLog, title: e.target.value })}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Categoría</label>
                  <select
                    className="input !py-3 !text-sm"
                    value={newLog.category}
                    onChange={(e) => setNewLog({ ...newLog, category: e.target.value })}
                  >
                    <option value="GENERAL">General</option>
                    <option value="POSING">Posing</option>
                    <option value="NUTRICION">Nutrición</option>
                    <option value="ENTRENAMIENTO">Entrenamiento</option>
                    <option value="EVOLUCION">Evolución / Fotos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Contenido Técnico / Feedback</label>
                <textarea
                  required
                  placeholder="Describe los puntos clave de mejora o el estado actual de la alumna..."
                  className="input !py-4 !text-sm min-h-[150px] leading-relaxed"
                  value={newLog.content}
                  onChange={(e) => setNewLog({ ...newLog, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-charcoal-lighter mb-2">Foto de Progreso (Opcional)</label>
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-blush-50/20 border border-dashed border-blush-100 min-h-[140px]">
                  {uploadingImage ? (
                    <div className="text-center">
                      <Loader2 size={24} className="animate-spin text-blush-500 mx-auto mb-2" />
                      <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest">Subiendo...</p>
                    </div>
                  ) : newLog.imageUrl ? (
                    <div className="relative group w-32 h-32">
                      <img 
                        src={newLog.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full rounded-xl object-cover border border-blush-100 shadow-md"
                      />
                      <button 
                        type="button"
                        onClick={() => setNewLog({...newLog, imageUrl: ""})}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center mx-auto mb-2 text-blush-500">
                        <ImageIcon size={20} />
                      </div>
                      <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest font-medium">JPG, PNG (Máx 5MB)</p>
                    </div>
                  )}
                  <input 
                    type="file"
                    className="hidden"
                    id="progress-image"
                    autoComplete="off"
                    accept="image/*"
                    onChange={handleImageUploadLog}
                    disabled={uploadingImage}
                  />
                  {!uploadingImage && (
                    <label 
                      htmlFor="progress-image"
                      className="mt-3 text-xs text-blush-600 hover:text-blush-700 font-medium cursor-pointer py-2 px-4 rounded-full bg-white shadow-sm border border-blush-100 transition-all"
                    >
                      {newLog.imageUrl ? "Cambiar foto" : "Seleccionar de mi galería"}
                    </label>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={processingId === "adding-log"}
                  className="btn-primary w-full py-4 tracking-[0.2em] uppercase font-bold"
                >
                  {processingId === "adding-log" ? "Guardando..." : "Registrar Evolución"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
