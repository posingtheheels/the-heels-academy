"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Sparkles, Trophy, Filter, Eye, EyeOff } from "lucide-react";

export default function BlogPage() {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT" | "SCHEDULED">("ALL");

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const now = new Date();

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || data);
        } else {
          const errData = await res.json();
          if (errData.availableModels) {
            (window as any)._lastAvailableModels = errData.availableModels;
          }
          setError(errData.error || "Error al cargar los artículos");
        }
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError("Error de conexión con la biblioteca");
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
        <p className="text-sm text-charcoal-lighter">Cargando biblioteca exclusiva...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header section with Premium feel */}
      <div className="mb-12 relative overflow-hidden rounded-[2rem] bg-charcoal p-8 md:p-14 text-white">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Trophy size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blush-500/20 text-blush-200 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 border border-blush-500/30">
            <Sparkles size={12} />
            Exclusive Content
          </div>
          <h1 className="font-heading text-4xl md:text-6xl font-light mb-6 leading-tight">
            The Heels Academy <span className="italic font-normal text-blush-200">Blog Pro</span>
          </h1>
          <p className="text-charcoal-lightest text-lg md:text-xl font-light leading-relaxed max-w-xl">
            Tu guía de élite para el mundo del culturismo. Curiosidades, técnica de posing y preparación para competición.
          </p>
        </div>
      </div>

      {/* Admin Filters */}
      {isAdmin && posts.length > 0 && (
        <div className="flex items-center gap-4 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-blush-50 w-fit">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-lighter mr-2">
            <Filter size={14} />
            Filtrar:
          </div>
          <button 
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "ALL" ? "bg-charcoal text-white shadow-lg" : "text-charcoal-lighter hover:bg-blush-50"}`}
          >
            Todos ({posts.length})
          </button>
          <button 
            onClick={() => setFilter("PUBLISHED")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "PUBLISHED" ? "bg-emerald-500 text-white shadow-lg" : "text-charcoal-lighter hover:bg-emerald-50"}`}
          >
            Publicados ({posts.filter(p => p.published && (!p.scheduledAt || new Date(p.scheduledAt) <= now)).length})
          </button>
          <button 
            onClick={() => setFilter("SCHEDULED")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "SCHEDULED" ? "bg-sky-500 text-white shadow-lg" : "text-charcoal-lighter hover:bg-sky-50"}`}
          >
            Programados ({posts.filter(p => p.published && p.scheduledAt && new Date(p.scheduledAt) > now).length})
          </button>
          <button 
            onClick={() => setFilter("DRAFT")}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === "DRAFT" ? "bg-rose-500 text-white shadow-lg" : "text-charcoal-lighter hover:bg-rose-50"}`}
          >
            Borradores ({posts.filter(p => !p.published).length})
          </button>
        </div>
      )}

      {/* Grid of Posts */}
      {posts.length === 0 ? (
        <div className="card-flat bg-white py-20 text-center flex flex-col items-center gap-4">
          <BookOpen className="text-charcoal-lighter/20" size={48} />
          <div className="space-y-1">
            <p className="text-charcoal-light font-medium">Próximamente nuevos artículos</p>
            <p className="text-charcoal-lighter text-sm">Estamos preparando el mejor contenido técnico para ti.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts
            .filter(post => {
              const isScheduled = post.published && post.scheduledAt && new Date(post.scheduledAt) > now;
              const isPublished = post.published && !isScheduled;
              
              if (filter === "PUBLISHED") return isPublished;
              if (filter === "SCHEDULED") return isScheduled;
              if (filter === "DRAFT") return !post.published;
              return true;
            })
            .map((post) => (
            <article 
              key={post.id}
              className="group bg-white rounded-[2rem] border border-charcoal-light/10 overflow-hidden hover:shadow-2xl hover:shadow-charcoal/10 transition-all duration-500 flex flex-col"
            >
              {/* Technical Report Header */}
              {/* Technical Report Header - Instead of Image */}
              <div className="min-h-[10rem] bg-charcoal p-6 flex flex-col justify-end relative overflow-hidden group-hover:bg-charcoal/95 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-white">
                  <BookOpen size={100} />
                </div>
                <div className="absolute top-4 left-6 flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-white/20">
                    {post.category}
                  </span>
                  {!post.published && (
                    <span className="px-3 py-1 bg-rose-500/20 backdrop-blur-sm text-rose-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-rose-500/30 animate-pulse">
                      Borrador
                    </span>
                  )}
                  {post.published && post.scheduledAt && new Date(post.scheduledAt) > now && (
                    <span className="px-3 py-1 bg-sky-500/20 backdrop-blur-sm text-sky-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded border border-sky-500/30">
                      Programado
                    </span>
                  )}
                </div>

                <h3 className="text-white text-lg font-bold leading-snug relative z-10 pt-10 group-hover:text-gold transition-colors duration-300">
                  {post.title}
                </h3>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-6 text-charcoal-lighter text-[10px] uppercase tracking-widest font-medium">
                  <Calendar size={12} className="text-gold" />
                  {new Date(post.scheduledAt || post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </div>

                <p className="text-charcoal-lighter text-sm leading-relaxed mb-8 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>

                <div className="mt-auto pt-6 border-t border-charcoal-light/5">
                  <Link 
                    href={`/dashboard/blog/${post.slug}`}
                    className="flex items-center justify-between text-gold text-[11px] font-bold uppercase tracking-[0.2em] group/link"
                  >
                    <span>Acceder al Reporte</span>
                    <ArrowRight className="transform group-hover/link:translate-x-2 transition-transform" size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
