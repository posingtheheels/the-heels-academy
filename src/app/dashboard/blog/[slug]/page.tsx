"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Hash, Share2, Sparkles, Send, EyeOff } from "lucide-react";

export default function BlogPostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
        } else {
          router.push("/dashboard/blog");
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        router.push("/dashboard/blog");
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchPost();
  }, [slug, router]);

  const togglePublish = async () => {
    if (!isAdmin || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !post.published }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
      }
    } catch (err) {
      console.error("Error updating post status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
        <p className="text-sm text-charcoal-lighter">Cargando artículo exclusivo...</p>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      {/* Top Bar with Back Button and Admin Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
        <Link 
          href="/dashboard/blog" 
          className="inline-flex items-center gap-2 text-charcoal-lighter hover:text-charcoal transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Volver al Blog</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-3">
             {!post.published ? (
               <button
                 onClick={togglePublish}
                 disabled={isUpdating}
                 className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
               >
                 <Send size={14} />
                 {isUpdating ? "Publicando..." : "Aprobar y Publicar"}
               </button>
             ) : (
               <button
                 onClick={togglePublish}
                 disabled={isUpdating}
                 className="flex items-center gap-2 px-4 py-2 bg-charcoal-light/10 text-charcoal-lighter rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal-light/20 transition-all disabled:opacity-50"
               >
                 <EyeOff size={14} />
                 {isUpdating ? "Cambiando..." : "Mover a Borrador"}
               </button>
             )}
          </div>
        )}
      </div>

      <article>
        {/* Header Section */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-blush-100/50 text-blush-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-charcoal-lighter text-[11px] font-medium border-l border-blush-100 pl-3">
              <Sparkles size={12} className="text-blush-400" />
              IA Analysis
            </div>
            {!post.published && (
              <span className="ml-auto px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] border border-rose-500/20 rounded">
                Borrador
              </span>
            )}
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl text-charcoal leading-tight mb-8 font-light">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 py-8 border-y border-blush-50/50">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-charcoal text-white flex items-center justify-center text-[10px] font-bold">
                 TH
               </div>
               <div>
                  <p className="text-xs font-bold text-charcoal leading-none">The Heels Academy</p>
                  <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest">Team PRO</p>
               </div>
             </div>
             <div className="flex items-center gap-2 text-charcoal-lighter">
               <Calendar size={14} />
               <span className="text-xs">{new Date(post.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
             </div>
             <div className="flex items-center gap-2 text-charcoal-lighter md:ml-auto">
               <Clock size={14} />
               <span className="text-xs">Lectura de 8 min</span>
             </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-16 rounded-[2.5rem] overflow-hidden shadow-elegant bg-blush-50 aspect-video">
            <img 
               src={post.image} 
               alt={post.title} 
               className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content Content with Premium Typography */}
        <div 
          className="prose prose-lg prose-rose max-w-none 
                     prose-headings:font-heading prose-headings:font-light 
                     prose-p:text-charcoal-light prose-p:leading-relaxed 
                     prose-strong:text-charcoal prose-strong:font-bold
                     prose-img:rounded-3xl"
        >
          {/* Simple markdown/HTML renderer logic (assuming AI provides clean text) */}
          <div className="space-y-6 text-lg" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
        </div>

        {/* Footer actions */}
        <div className="mt-20 pt-10 border-t border-blush-100 flex items-center justify-between">
           <div className="flex gap-2">
              <button className="p-3 bg-blush-50/50 rounded-full text-blush-600 hover:bg-blush-100 transition-colors">
                <Share2 size={18} />
              </button>
           </div>
           <div className="flex items-center gap-4 text-charcoal-light">
              <Hash size={14} className="text-blush-300" />
              <span className="text-[11px] uppercase font-bold tracking-widest">NPC-IFBB-PRO</span>
           </div>
        </div>
      </article>
    </div>
  );
}

