"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Lock } from "lucide-react";

export default function BlogTeaser() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLatestPosts() {
      try {
        const res = await fetch("/api/blog/latest");
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Error fetching latest posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLatestPosts();
  }, []);

  if (loading) return null;

  return (
    <section id="blog-preview" className="py-24 bg-charcoal-darkest relative overflow-hidden">
      {/* Decorative effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blush-500/5 rounded-full blur-3xl -mr-48 -mt-48"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blush-500/10 text-blush-300 text-sm font-medium mb-4 border border-blush-500/20">
            <BookOpen size={16} />
            <span>REVISTA TÉCNICA EXCLUSIVA</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            Aprende como una <span className="italic">PRO</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ¿Quieres los secretos del posing y la preparación de élite? Descubre el contenido exclusivo para nuestras alumnas registradas.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-8 bg-charcoal-light/20 rounded-3xl border border-white/5 border-dashed">
            <Lock className="text-blush-400/30 mb-4" size={48} />
            <p className="text-gray-400 font-light italic">Sincronizando el nuevo contenido para esta semana...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post: any) => (
              <div 
                key={post.id}
                className="group bg-charcoal-light/30 border border-white/5 rounded-2xl p-8 hover:border-blush-500/30 transition-all duration-300 backdrop-blur-sm"
              >
                <span className="text-xs font-medium text-blush-400 uppercase tracking-widest mb-4 block">
                  {post.category}
                </span>
                <h3 className="text-xl font-medium text-white mb-4 line-clamp-2 group-hover:text-blush-200 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed italic">
                  "{post.excerpt?.substring(0, 100)}..."
                </p>
                
                <Link 
                  href="/dashboard/blog"
                  className="inline-flex items-center gap-2 text-white font-medium group/btn"
                >
                  <div className="flex items-center gap-2 px-5 py-2.5 bg-white/5 rounded-full border border-white/10 group-hover/btn:bg-white group-hover/btn:text-charcoal-black transition-all">
                    <Lock size={14} className="text-blush-400 group-hover/btn:text-charcoal-black" />
                    <span>Acceso Alumnas</span>
                    <ArrowRight size={16} className="ml-1 opacity-50 group-hover/btn:opacity-100" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link
            href="/login"
            className="text-gray-500 hover:text-white transition-colors underline underline-offset-4 text-sm"
          >
            ¿Aún no tienes cuenta? Regístrate gratis para empezar a leer
          </Link>
        </div>
      </div>
    </section>
  );
}
