"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Filter, User as UserIcon, LogIn, AlertCircle, ChevronRight, CheckCircle } from "lucide-react";

export default function AlumnosPage() {
  const [alumnas, setAlumnas] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<"ALL" | "ACTIVE_PLANS" | "NO_PLANS">("ALL");

  useEffect(() => {
    async function fetchAlumnas() {
      try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Error fetching alumnas");
        const data = await res.json();
        setAlumnas(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAlumnas();
  }, []);

  const filteredAlumnas = alumnas.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "ACTIVE_PLANS") return matchesSearch && a.activePlansCount > 0;
    if (filter === "NO_PLANS") return matchesSearch && a.activePlansCount === 0;
    return matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
            Alumnas
          </h1>
          <p className="text-sm text-charcoal-lighter mt-1">
            Gestiona las alumnas de la academia
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-lighter"
          />
          <input
            type="text"
            className="input pl-11"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex p-1 bg-white border border-blush-50 rounded-2xl shadow-sm">
          <button 
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${filter === "ALL" ? "bg-charcoal text-white shadow-elegant" : "text-charcoal-lighter hover:text-charcoal"}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter("ACTIVE_PLANS")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${filter === "ACTIVE_PLANS" ? "bg-emerald-500 text-white shadow-elegant" : "text-charcoal-lighter hover:text-charcoal"}`}
          >
            Con Bonos
          </button>
          <button 
            onClick={() => setFilter("NO_PLANS")}
            className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${filter === "NO_PLANS" ? "bg-amber-500 text-white shadow-elegant" : "text-charcoal-lighter hover:text-charcoal"}`}
          >
            Sin Bonos
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="card text-center py-16">
          <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-charcoal-lighter">Cargando alumnas...</p>
        </div>
      ) : error ? (
        <div className="card text-center py-16">
          <AlertCircle size={40} className="text-red-300 mx-auto mb-4" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : filteredAlumnas.length > 0 ? (
        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blush-50/50 border-b border-blush-100">
                  <th className="px-6 py-4 text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-4 text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Estado Bono</th>
                  <th className="px-6 py-4 text-xs font-medium text-charcoal-lighter uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-4 text-xs font-medium text-charcoal-lighter uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blush-50">
                {filteredAlumnas.map((alumna) => (
                  <tr key={alumna.id} className="hover:bg-blush-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-sm text-charcoal font-medium">{alumna.name}</p>
                      {alumna.role === "ADMIN" && <span className="text-[9px] uppercase font-bold text-sky-500 tracking-tighter">Administrador</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-light">{alumna.email}</td>
                    <td className="px-6 py-4">
                      {alumna.activePlansCount > 0 ? (
                        <div className="flex items-center gap-1.5 text-emerald-600">
                          <CheckCircle size={12} />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{alumna.activePlansCount} bono{alumna.activePlansCount > 1 ? 's' : ''} activo{alumna.activePlansCount > 1 ? 's' : ''}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-tight text-charcoal-lighter opacity-40">Sin bonos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-charcoal-light">{alumna.phone || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/alumnos/${alumna.id}`}
                        className="text-blush-500 hover:text-blush-600 text-sm font-medium inline-flex items-center gap-1 group/btn"
                      >
                        Ver ficha
                        <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card text-center py-16">
          <UserIcon size={40} className="text-blush-200 mx-auto mb-4" />
          <h2 className="font-heading text-xl text-charcoal mb-2">No se encontraron alumnas</h2>
          <p className="text-sm text-charcoal-lighter max-w-sm mx-auto">Intenta ajustar tu búsqueda</p>
        </div>
      )}
    </div>
  );
}
