"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { 
  Trophy, TrendingUp, Calendar, ChevronRight, 
  Dumbbell, Apple, Sparkles, Image as ImageIcon 
} from "lucide-react";

export default function StudentProgressPage() {
  const { data: session } = useSession();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("/api/user/progress");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "POSING": return <Sparkles size={16} className="text-blush-500" />;
      case "ENTRENAMIENTO": return <Dumbbell size={16} className="text-blush-500" />;
      case "NUTRICION": return <Apple size={16} className="text-blush-500" />;
      default: return <TrendingUp size={16} className="text-blush-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Header Section */}
      <header className="mb-12">
        <h1 className="font-heading text-4xl text-charcoal font-light">Evolución <span className="font-medium">Pro</span></h1>
        <p className="text-sm text-charcoal-lighter mt-1">Tu bitácora técnica de The Heels Academy</p>
      </header>

      {/* Timeline Section */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-blush-100 hidden md:block" />
        
        <div className="space-y-12">
          {loading ? (
            <div className="flex justify-center p-20">
              <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="card-flat bg-white border-blush-50 py-20 text-center">
               <TrendingUp size={48} className="text-blush-100 mx-auto mb-4" />
               <p className="text-sm text-charcoal-lighter">Todavía no tienes registros en tu diario. Tu entrenadora añadirá notas técnicas pronto.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative md:pl-16">
                {/* Timeline Dot */}
                <div className="absolute left-[20px] top-4 w-2 h-2 rounded-full border-2 border-blush-500 bg-white hidden md:block z-10" />
                
                <div className="card bg-white shadow-elegant border-none p-6 md:p-8 hover:translate-y-[-4px] transition-all duration-300">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blush-50 flex items-center justify-center">
                          {getCategoryIcon(log.category)}
                        </div>
                        <div>
                          <h3 className="text-lg font-heading font-bold text-charcoal">{log.title}</h3>
                          <div className="flex items-center gap-2 text-[10px] text-charcoal-lighter uppercase font-bold tracking-widest">
                             <Calendar size={10} />
                             {new Date(log.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                     </div>
                     <span className="px-3 py-1 bg-blush-50 text-blush-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                       {log.category}
                     </span>
                  </div>

                  <div className="prose prose-sm max-w-none text-charcoal-light whitespace-pre-wrap">
                    {log.content}
                  </div>

                  {log.imageUrl && (
                    <div className="mt-6 rounded-2xl overflow-hidden aspect-video shadow-sm border border-blush-50">
                       <img src={log.imageUrl} alt={log.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
