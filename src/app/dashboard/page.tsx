"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CreditCard,
  Clock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState({
    availableSessions: 0,
    upcomingClasses: 0,
    completedClasses: 0,
    activePlan: null as any,
    userPlans: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats"); // Need to create this
        if (!res.ok) throw new Error("Error fetching stats");
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Hola, <span className="font-medium">{session?.user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1">
          Bienvenida a tu panel de The Heels
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className="card-flat h-24 animate-pulse bg-blush-50/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="card-flat flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blush-100 flex items-center justify-center">
              <CreditCard size={20} className="text-blush-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-charcoal">{stats.availableSessions}</p>
              <p className="text-xs text-charcoal-lighter">Sesiones disponibles</p>
            </div>
          </div>

          <div className="card-flat flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Calendar size={20} className="text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-charcoal">{stats.upcomingClasses}</p>
              <p className="text-xs text-charcoal-lighter">Próximas clases</p>
            </div>
          </div>

          <div className="card-flat flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
              <TrendingUp size={20} className="text-sky-500" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold text-charcoal">{stats.completedClasses}</p>
              <p className="text-xs text-charcoal-lighter">Clases completadas</p>
            </div>
          </div>
        </div>
      )}

      {/* Previous Plans History */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-xl text-charcoal flex items-center gap-2">
            <CreditCard size={20} className="text-blush-400" />
            Mis Bonos
          </h2>
          <Link href="/dashboard/planes" className="text-xs font-bold uppercase tracking-widest text-blush-500 hover:text-blush-600 transition-colors">
            Comprar más
          </Link>
        </div>

        {stats.userPlans.length > 0 ? (
          <div className="space-y-4">
            {stats.userPlans.map((up: any) => {
              const isExhausted = up.usedSessions >= up.totalSessions;
              const isPending = up.paymentStatus !== "PAGADO";
              
              return (
                <div 
                  key={up.id} 
                  className={`p-4 rounded-2xl border transition-all ${
                    isExhausted 
                      ? "bg-charcoal-light/[0.02] border-blush-50 opacity-60" 
                      : "bg-white border-blush-100 shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-charcoal">{up.plan.name}</p>
                        {isExhausted ? (
                           <span className="text-[8px] font-bold uppercase py-0.5 px-2 rounded-full border border-charcoal-lighter/30 text-charcoal-lighter">Finalizado</span>
                        ) : isPending ? (
                          <span className="text-[8px] font-bold uppercase py-0.5 px-2 rounded-full border border-amber-200 text-amber-500 bg-amber-50">Pago Pendiente</span>
                        ) : (
                          <span className="text-[8px] font-bold uppercase py-0.5 px-2 rounded-full border border-emerald-200 text-emerald-500 bg-emerald-50">Activo</span>
                        )}
                      </div>
                      <p className="text-[10px] text-charcoal-lighter mt-0.5">
                        {new Date(up.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-heading font-bold text-charcoal leading-none">
                         {up.usedSessions} / {up.totalSessions}
                       </p>
                       <p className="text-[9px] uppercase tracking-tighter text-charcoal-lighter">Sesiones usadas</p>
                    </div>
                  </div>
                  
                  {!isExhausted && !isPending && (
                    <div className="w-full bg-blush-100/30 rounded-full h-1.5 overflow-hidden">
                       <div 
                         className="bg-blush-400 h-full transition-all duration-700" 
                         style={{ width: `${(up.usedSessions / up.totalSessions) * 100}%` }}
                       />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-blush-50/20 rounded-2xl border border-dashed border-blush-100">
             <p className="text-sm text-charcoal-lighter mb-4">Aún no has comprado ningún bono.</p>
             <Link href="/dashboard/planes" className="btn-secondary text-xs py-2 px-6">Ver opciones</Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/reservar"
          className="card group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
              <Calendar size={18} className="text-blush-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-charcoal">Reservar clase</h3>
              <p className="text-xs text-charcoal-lighter">
                Ver disponibilidad y reservar
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-charcoal-lighter group-hover:text-blush-500 group-hover:translate-x-1 transition-all"
          />
        </Link>

        <Link
          href="/dashboard/historial"
          className="card group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blush-50 flex items-center justify-center group-hover:bg-blush-100 transition-colors">
              <Clock size={18} className="text-blush-500" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-charcoal">Mi historial</h3>
              <p className="text-xs text-charcoal-lighter">
                Clases pasadas y próximas
              </p>
            </div>
          </div>
          <ArrowRight
            size={16}
            className="text-charcoal-lighter group-hover:text-blush-500 group-hover:translate-x-1 transition-all"
          />
        </Link>
      </div>
    </div>
  );
}
