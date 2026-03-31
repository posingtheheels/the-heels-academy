"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, CreditCard, Bell, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState({
    userCount: 0,
    reservationsToday: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    recentActivity: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const [showTodayModal, setShowTodayModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    async function fetchAdminStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("Error fetching admin stats");
        const data = await res.json();
        setStats({
          ...data,
          todayBookings: data.todayBookings || [],
          pendingBookings: data.pendingBookings || []
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAdminStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Panel de administración
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          Resumen general de la academia
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-flat h-28 animate-pulse bg-charcoal/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-flat">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blush-100 flex items-center justify-center">
                <Users size={18} className="text-blush-500" />
              </div>
              <span className="text-xs text-charcoal-lighter uppercase tracking-wide">
                Alumnas
              </span>
            </div>
            <p className="text-3xl font-heading font-bold text-charcoal">{stats.userCount}</p>
          </div>

          <button 
            onClick={() => setShowTodayModal(true)}
            className="card-flat text-left hover:border-emerald-200 hover:bg-emerald-50/10 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar size={18} className="text-emerald-500" />
              </div>
              <span className="text-xs text-charcoal-lighter uppercase tracking-wide">
                Reservas hoy
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-heading font-bold text-charcoal">{stats.reservationsToday}</p>
              <span className="text-[10px] text-emerald-600 font-bold uppercase mb-1">Ver lista</span>
            </div>
          </button>

          <div className="card-flat">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <CreditCard size={18} className="text-sky-500" />
              </div>
              <span className="text-xs text-charcoal-lighter uppercase tracking-wide">
                Ingresos mes
              </span>
            </div>
            <p className="text-3xl font-heading font-bold text-charcoal">{stats.monthlyRevenue} €</p>
          </div>

          <button 
            onClick={() => setShowPendingModal(true)}
            className="card-flat text-left hover:border-amber-200 hover:bg-amber-50/10 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle size={18} className="text-amber-500" />
              </div>
              <span className="text-xs text-charcoal-lighter uppercase tracking-wide">
                Pagos pendientes
              </span>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-heading font-bold text-charcoal">{stats.pendingPayments}</p>
              <span className="text-[10px] text-amber-600 font-bold uppercase mb-1">Ver lista</span>
            </div>
          </button>
        </div>
      )}

      {/* Activity Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl text-charcoal">
                Actividad reciente
              </h2>
            </div>
            
            {loading ? (
                <div className="space-y-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-12 w-full animate-pulse bg-charcoal/5 rounded-xl" />
                  ))}
                </div>
            ) : stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity: any) => {
                  const isCancelled = activity.status === 'CANCELADA';
                  const isRealizada = activity.status === 'REALIZADA';
                  const isConfirmed = activity.status === 'CONFIRMADA';
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blush-50/30 transition-colors border border-transparent hover:border-blush-100/50">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isRealizada || isConfirmed ? 'bg-emerald-50 text-emerald-500' : 
                        isCancelled ? 'bg-red-50 text-red-500' : 
                        'bg-amber-50 text-amber-500'
                      }`}>
                        {isCancelled ? <XCircle size={16} /> : 
                         (isRealizada || isConfirmed) ? <CheckCircle size={16} /> : 
                         <AlertTriangle size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-charcoal font-medium">
                          <span className="text-blush-500">{activity.user.name}</span> {isCancelled ? 'ha cancelado' : isRealizada ? 'ha completado' : 'ha reservado'} una clase
                        </p>
                        <p className="text-xs text-charcoal-lighter">
                          {new Date(activity.dateTime).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-charcoal-lighter/50">Hace poco</span>
                    </div>
                  );
                })}
              </div>
            ) : (
                <div className="text-center py-12">
                  <Clock size={36} className="text-blush-200 mx-auto mb-3" />
                  <p className="text-sm text-charcoal-lighter">No hay actividad reciente</p>
                </div>
            )}
          </div>
        </div>

        {/* System Health / notifications */}
        <div className="space-y-6">
          <div className="card !bg-charcoal text-white border-none shadow-elegant">
            <div className="flex items-center gap-2 mb-4">
               <TrendingUp size={16} className="text-blush-300" />
               <span className="text-[10px] tracking-widest uppercase text-white/50 font-bold">Estado Academia</span>
            </div>
            <h3 className="text-3xl font-heading mb-1 font-light">En marcha</h3>
            <p className="text-xs text-white/40 mb-6">El sistema está funcionando correctamente sin errores detectados.</p>
            <div className="divider-wide !bg-white/10 !my-4" />
            <div className="space-y-3">
               <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Server status</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online
                  </span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Stripe sync</span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="text-white/60">Google Calendar</span>
                  <span className="flex items-center gap-1.5 text-amber-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                    Pending config
                  </span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Bookings Modal */}
      {showTodayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowTodayModal(false)} className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-colors">
              <XCircle size={24} className="opacity-50 hover:opacity-100" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Reservas para Hoy</h3>
            <p className="text-sm text-charcoal-lighter mb-8">Listado de clases programadas para el día de hoy.</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {(stats as any).todayBookings?.length > 0 ? (
                (stats as any).todayBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-blush-50/20 border border-blush-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-xs uppercase tracking-tighter">
                        {new Date(b.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div>
                        <p className="font-bold text-charcoal text-sm">{b.user.name}</p>
                        <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest leading-normal">
                          {b.modality} {b.user.category ? `• ${b.user.category}` : ''} {b.user.federation ? `(${b.user.federation})` : ''}
                        </p>
                      </div>
                    </div>
                    {b.user.phone && (
                      <a 
                        href={`https://wa.me/${b.user.phone.replace(/\s+/g, '')}`} 
                        target="_blank"
                        className="p-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/80 transition-all"
                      >
                        <Bell size={14} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-charcoal-lighter italic">No hay clases para hoy.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pending Payments Modal */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl relative animate-pop-in">
            <button onClick={() => setShowPendingModal(false)} className="absolute top-6 right-6 text-charcoal-lighter hover:text-charcoal transition-colors">
              <XCircle size={24} className="opacity-50 hover:opacity-100" />
            </button>
            <h3 className="font-heading text-2xl font-bold text-charcoal mb-2">Pagos Pendientes</h3>
            <p className="text-sm text-charcoal-lighter mb-8">Clases reservadas con el método de pago presencial o manual.</p>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
              {(stats as any).pendingBookings?.length > 0 ? (
                (stats as any).pendingBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/20 border border-amber-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-[9px] text-center leading-none">
                        PEND.<br />PAGO
                      </div>
                      <div>
                        <p className="font-bold text-charcoal text-sm">{b.user.name}</p>
                        <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest leading-normal">
                          {new Date(b.dateTime).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {new Date(b.dateTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                          <br />
                          {b.user.category ? b.user.category : 'S/C'} {b.user.federation ? `• ${b.user.federation}` : ''}
                        </p>
                      </div>
                    </div>
                    {b.user.phone && (
                      <a 
                        href={`https://wa.me/${b.user.phone.replace(/\s+/g, '')}`} 
                        target="_blank"
                        className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all"
                      >
                        <Bell size={14} />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-charcoal-lighter italic">No hay pagos pendientes.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
