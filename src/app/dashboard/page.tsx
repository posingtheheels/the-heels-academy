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

      {/* Active Plan */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-xl text-charcoal">Plan activo</h2>
          {stats.activePlan ? (
             <span className="badge-success">{stats.activePlan.plan.name}</span>
          ) : (
            <span className="badge-warning">Sin plan</span>
          )}
        </div>
        {!stats.activePlan ? (
          <>
            <p className="text-sm text-charcoal-lighter mb-6">
              Aún no tienes un plan activo. Elige uno de nuestros bonos para empezar a reservar clases.
            </p>
            <Link href="/dashboard/planes" className="btn-primary inline-flex items-center gap-2">
              <Sparkles size={14} />
              Comprar bono
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-blush-50/30 border border-blush-100">
            <div className="flex-1">
              <p className="text-sm font-medium text-charcoal">{stats.activePlan.plan.name}</p>
              <p className="text-xs text-charcoal-lighter">
                Has usado {stats.activePlan.usedSessions} de {stats.activePlan.totalSessions} sesiones
              </p>
            </div>
            <div className="w-32 bg-white rounded-full h-2 overflow-hidden border border-blush-100">
               <div 
                 className="bg-blush-400 h-full transition-all duration-500" 
                 style={{ width: `${(stats.activePlan.usedSessions / stats.activePlan.totalSessions) * 100}%` }}
               />
            </div>
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
