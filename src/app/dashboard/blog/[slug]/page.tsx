"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Hash, Share2, Sparkles } from "lucide-react";

export default function BlogPostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="max-w-4xl mx-auto pb-20">
      {/* Back Button */}
      <Link 
        href="/dashboard/blog" 
        className="inline-flex items-center gap-2 text-charcoal-lighter hover:text-charcoal transition-colors mb-10 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Volver al Blog</span>
      </Link>

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
          </div>
          
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl text-charcoal leading-tight mb-8">
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
             <div className="flex items-center gap-2 text-charcoal-lighter ml-auto">
               <Clock size={14} />
               <span className="text-xs">Lectura de 5 min</span>
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
          <div className="space-y-6" dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }} />
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
