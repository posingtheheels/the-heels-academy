"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Check, Sparkles, AlertCircle, ShoppingBag, 
  ArrowRight, Heart, Timer
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function BuyPlanPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/user/plans");
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

  async function handleBuy(planId: string) {
    setPurchasing(planId);
    setError("");
    try {
      const res = await fetch("/api/user/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al realizar la compra");
      }
      
      // Success! Go back to dashboard to see the active plan
      router.push("/dashboard?welcome=plan-activated");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-4 border-blush-100 border-t-blush-500 rounded-full animate-spin" />
        <p className="text-sm text-charcoal-lighter animate-pulse">Cargando opciones...</p>
      </div>
    );
  }

  const onlinePlans = plans.filter(p => p.type === "ONLINE");
  const presencialPlans = plans.filter(p => p.type === "PRESENCIAL");

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
          Nuestros Bonos
        </h1>
        <p className="text-sm text-charcoal-lighter mt-1 italic">
          Invierte en tu versión más profesional
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm mb-8 animate-shake">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="space-y-12">
        {/* ONLINE Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-blush-100 pb-3">
             <div className="w-8 h-8 rounded-full bg-blush-50 flex items-center justify-center text-blush-500">
               <ShoppingBag size={14} />
             </div>
             <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal-lighter">Sesiones Online</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {onlinePlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onBuy={() => handleBuy(plan.id)}
                isPurchasing={purchasing === plan.id}
              />
            ))}
          </div>
        </div>

        {/* PRESENCIAL Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-blush-100 pb-3">
             <div className="w-8 h-8 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal-lighter">
               <Heart size={14} />
             </div>
             <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-charcoal-lighter">Sesiones Presenciales</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {presencialPlans.map((plan) => (
              <PlanCard 
                key={plan.id} 
                plan={plan} 
                onBuy={() => handleBuy(plan.id)}
                isPurchasing={purchasing === plan.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlanCard({ plan, onBuy, isPurchasing }: { plan: any, onBuy: () => void, isPurchasing: boolean }) {
  return (
    <div className="card-flat bg-white border-blush-50 hover:border-blush-200 transition-all shadow-sm hover:shadow-elegant flex flex-col h-full group p-6">
       <div className="mb-6">
         <h3 className="font-heading text-lg font-semibold text-charcoal uppercase tracking-wider">{plan.name}</h3>
         <p className="text-xs text-charcoal-lighter mt-1 italic">{plan.description}</p>
       </div>
       
       <div className="mb-8">
         <span className="text-4xl font-heading font-bold text-charcoal">{plan.price}€</span>
         <p className="text-[10px] uppercase font-bold text-blush-500 tracking-widest mt-1 flex items-center gap-1.5">
           <Timer size={10} />
           {plan.durationMinutes} min / sesión
         </p>
       </div>
       
       <ul className="space-y-3 mb-8 flex-1">
         {[
           "Reserva inmediata",
           "Caducidad 90 días",
           "Cancelación 24h antes",
           "Contacto vía WhatsApp"
         ].map((feat, i) => (
           <li key={i} className="flex items-center gap-2 text-xs text-charcoal-light">
             <Check size={12} className="text-emerald-400" />
             {feat}
           </li>
         ))}
       </ul>
       
       <button 
         onClick={onBuy}
         disabled={isPurchasing}
         className="btn-primary w-full py-3.5 text-xs font-bold gap-2 group-hover:scale-105 transition-transform"
       >
         {isPurchasing ? (
           <div className="w-4 h-4 border-2 border-charcoal/20 border-t-charcoal rounded-full animate-spin" />
         ) : (
           <CreditCard size={14} />
         )}
         {isPurchasing ? "Procesando..." : `Comprar ahora`}
       </button>
    </div>
  );
}
