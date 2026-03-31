"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Tag, ToggleLeft, ToggleRight, AlertCircle } from "lucide-react";

export default function TarifasPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/plans");
        if (!res.ok) throw new Error("Error fetching plans");
        const data = await res.json();
        setPlans(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
            Tarifas
          </h1>
          <p className="text-sm text-charcoal-lighter mt-1">
            Gestiona los planes y precios de la academia
          </p>
        </div>
        <button className="btn-primary gap-2">
          <Plus size={14} />
          Nueva tarifa
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="card h-64 animate-pulse bg-blush-50/50" />
          ))}
        </div>
      ) : error ? (
        <div className="card text-center py-12">
           <AlertCircle size={32} className="text-red-300 mx-auto mb-3" />
           <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card group hover:border-blush-200 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`badge ${
                    plan.type === "ONLINE" ? "badge-info" : "badge-blush"
                  }`}
                >
                  {plan.type}
                </span>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-blush-50 transition-colors">
                    <Edit2 size={14} className="text-charcoal-lighter" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={14} className="text-red-300" />
                  </button>
                </div>
              </div>

              <h3 className="font-heading text-lg font-semibold text-charcoal mb-1 line-clamp-1">
                {plan.name}
              </h3>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-heading font-bold text-charcoal">
                  {plan.price}
                </span>
                <span className="text-sm text-charcoal-lighter">€</span>
              </div>

              <div className="divider-wide !my-3" />

              <div className="space-y-2 text-sm text-charcoal-light">
                <div className="flex justify-between">
                  <span>Sesiones</span>
                  <span className="font-medium">{plan.totalSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duración</span>
                  <span className="font-medium">{plan.durationMinutes} min</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Estado</span>
                  <button className="flex items-center gap-1.5">
                    {plan.active ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} className="text-charcoal-lighter" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        plan.active ? "text-emerald-600" : "text-charcoal-lighter"
                      }`}
                    >
                      {plan.active ? "Activa" : "Inactiva"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <Tag size={40} className="text-blush-200 mx-auto mb-4" />
          <h2 className="font-heading text-xl text-charcoal mb-2">
            No hay tarifas creadas
          </h2>
          <p className="text-sm text-charcoal-lighter max-w-sm mx-auto">
            Crea el primer plan de tarifas para la academia
          </p>
        </div>
      )}
    </div>
  );
}
