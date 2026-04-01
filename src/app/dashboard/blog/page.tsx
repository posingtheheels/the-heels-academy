"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Sparkles, Trophy } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dbInfo, setDbInfo] = useState<any>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          if (data.posts) {
            setPosts(data.posts);
            setDbInfo(data.dbStatus);
          } else {
            setPosts(data);
          }
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

  const [error, setError] = useState("");

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
          {posts.map((post) => (
            <article 
              key={post.id}
              className="group bg-white rounded-[2rem] border border-charcoal-light/5 overflow-hidden hover:shadow-2xl hover:shadow-charcoal/5 transition-all duration-500 flex flex-col"
            >
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-charcoal/5 text-charcoal-light text-[10px] font-bold uppercase tracking-wider rounded-full">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-charcoal-lighter text-[10px]">
                    <Calendar size={12} />
                    {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-charcoal group-hover:text-gold transition-colors duration-300 mb-4 line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-charcoal-lighter text-sm leading-relaxed mb-8 line-clamp-3">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>

                <div className="mt-auto pt-6 border-t border-charcoal-light/5">
                  <Link 
                    href={`/dashboard/blog/${post.slug}`}
                    className="flex items-center justify-between text-gold text-xs font-bold uppercase tracking-widest group/link"
                  >
                    <span>Leer Reporte Completo</span>
                    <ArrowRight className="transform group-hover/link:translate-x-1 transition-transform" size={14} />
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
