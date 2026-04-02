"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Hash, Share2, Sparkles, Send, EyeOff, Edit3, Save, X } from "lucide-react";
import { CommentSection } from "@/components/blog/CommentSection";


export default function BlogPostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState({ title: "", content: "", excerpt: "" });

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          setEditContent({ title: data.title, content: data.content, excerpt: data.excerpt || "" });
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

  const saveChanges = async () => {
    if (!isAdmin || isUpdating) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editContent,
          published: post.published
        }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Error saving post changes:", err);
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-40 border-b border-blush-50">
        <Link 
          href="/dashboard/blog" 
          className="inline-flex items-center gap-2 text-charcoal-lighter hover:text-charcoal transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Blog</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-4">
             {isEditing ? (
               <div className="flex gap-2">
                 <button
                   onClick={() => setIsEditing(false)}
                   className="flex items-center gap-2 px-4 py-2 bg-charcoal-light/10 text-charcoal-lighter rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal-light/20 transition-all"
                 >
                   <X size={14} />
                   Cancelar
                 </button>
                 <button
                   onClick={saveChanges}
                   disabled={isUpdating}
                   className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                 >
                   <Save size={14} />
                   {isUpdating ? "Guardando..." : "Guardar Cambios"}
                 </button>
               </div>
             ) : (
               <>
                 <button
                   onClick={() => setIsEditing(true)}
                   className="flex items-center gap-2 px-4 py-2 bg-charcoal-light/10 text-charcoal-lighter rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-charcoal-light/20 transition-all"
                 >
                   <Edit3 size={14} />
                   Editar
                 </button>
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
               </>
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
            {!post.published ? (
              <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-[0.2em] border border-rose-500/20 rounded">
                Borrador
              </span>
            ) : post.scheduledAt && new Date(post.scheduledAt) > new Date() ? (
              <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20 rounded">
                Programado: {new Date(post.scheduledAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            ) : (
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 rounded">
                Publicado
              </span>
            )}
          </div>
          
          {isEditing ? (
             <div className="space-y-4 mb-8">
               <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-lighter">Título del Reporte</label>
               <input 
                 className="w-full text-3xl font-heading bg-blush-50/50 border border-blush-100 p-4 rounded-2xl text-charcoal"
                 value={editContent.title}
                 onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
               />
               <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-lighter">Breve Resumen (Excerpt)</label>
               <textarea 
                 className="w-full text-sm bg-blush-50/50 border border-blush-100 p-4 rounded-2xl text-charcoal-light h-20"
                 value={editContent.excerpt}
                 onChange={(e) => setEditContent({ ...editContent, excerpt: e.target.value })}
               />
             </div>
          ) : (
             <h1 className="font-heading text-4xl md:text-5xl lg:text-7xl text-charcoal leading-tight mb-8 font-light">
               {post.title}
             </h1>
          )}

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
               <span className="text-xs">Lectura Pro</span>
             </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && !isEditing && (
          <div className="mb-16 rounded-[2.5rem] overflow-hidden shadow-elegant bg-blush-50 aspect-video">
            <img 
               src={post.image} 
               alt={post.title} 
               className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content Content */}
        <div className="max-w-none">
          {isEditing ? (
             <div className="space-y-4">
               <label className="text-[10px] font-bold uppercase tracking-widest text-charcoal-lighter">Contenido del Reporte (Soporta HTML básico)</label>
               <textarea 
                 className="w-full min-h-[600px] bg-blush-50/50 border border-blush-100 p-8 rounded-3xl text-charcoal font-sans leading-relaxed text-lg"
                 value={editContent.content}
                 onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
               />
             </div>
          ) : (
            <div 
              className="prose prose-lg prose-rose max-w-none 
                         prose-headings:font-heading prose-headings:font-light 
                         prose-p:text-charcoal-light prose-p:leading-relaxed 
                         prose-strong:text-charcoal prose-strong:font-bold
                         prose-img:rounded-3xl"
            >
              <div className="space-y-6 text-lg" dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
          )}
        </div>

        {/* Comment Section (Safe for all users to see, restricted to logged users to post) */}
        {!isEditing && post.published && (
          <CommentSection slug={post.slug} />
        )}

        {/* Footer actions */}
        {!isEditing && (
          <div className="mt-10 pt-10 border-t border-blush-100 flex items-center justify-between">
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
        )}
      </article>
    </div>
  );
}


