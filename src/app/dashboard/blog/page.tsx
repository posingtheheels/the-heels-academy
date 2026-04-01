"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Calendar, ArrowRight, Sparkles, Trophy } from "lucide-react";

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch("/api/blog");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          const errData = await res.json();
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
           <BookOpen size={48} className="text-blush-200" />
           <p className="text-charcoal-lighter font-medium">Estamos preparando los nuevos artículos semanales...</p>
           <p className="text-xs text-charcoal-lighter/60">Vuelve el próximo lunes o jueves para el contenido generado por IA.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link 
               key={post.id} 
               href={`/dashboard/blog/${post.slug}`}
               className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-blush-50/50 hover:shadow-elegant transition-all duration-500 hover:-translate-y-2"
            >
              {/* Image Placeholder/Thumbnail */}
              <div className="relative aspect-[16/10] bg-blush-50 overflow-hidden">
                <img 
                  src={post.image || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop"} 
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content Card */}
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-charcoal-lighter text-[11px] mb-4">
                    <Calendar size={13} />
                    {new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </div>
                <h3 className="font-heading text-xl text-charcoal mb-4 group-hover:text-blush-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-charcoal-light text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mb-6 flex-1">
                  {post.excerpt || post.content.substring(0, 150) + "..."}
                </p>
                <div className="pt-6 border-t border-blush-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blush-500">
                    Leer más
                  </span>
                  <ArrowRight size={16} className="text-blush-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
