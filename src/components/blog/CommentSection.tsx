"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Send, Trash2, ShieldCheck, User } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
}

export function CommentSection({ slug }: { slug: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blog/${slug}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !session || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        const comment = await res.json();
        setComments([...comments, comment]);
        setNewComment("");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setIsSending(false);
    }
  };

  const deleteComment = async (id: string) => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`/api/blog/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="mt-20 pt-10 border-t border-blush-100">
      <div className="flex items-center gap-3 mb-10">
        <MessageSquare size={20} className="text-blush-500" />
        <h3 className="font-heading text-2xl text-charcoal">Preguntas y Chat Pro</h3>
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-12">
          <div className="relative group">
            <textarea
              className="w-full bg-blush-50/30 border border-blush-100 rounded-3xl p-6 text-sm text-charcoal-light focus:outline-none focus:ring-2 focus:ring-blush-200 transition-all min-h-[120px]"
              placeholder="Deja tu duda técnica o comentario para la academia..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || isSending}
              className="absolute bottom-4 right-4 p-3 bg-charcoal text-white rounded-2xl hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105"
            >
              <Send size={16} className={isSending ? "animate-pulse" : ""} />
            </button>
          </div>
        </form>
      ) : (
        <div className="p-8 bg-blush-50/50 rounded-3xl border border-blush-100 text-center mb-12">
           <p className="text-sm text-charcoal-lighter">Inicia sesión para participar en el chat de este artículo.</p>
        </div>
      )}

      <div className="space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-charcoal-lighter italic text-center py-10">Sé la primera en comentar este reporte exclusivo.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="flex-shrink-0">
                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold ${comment.user.role === 'ADMIN' ? 'bg-charcoal text-white' : 'bg-blush-100 text-blush-600'}`}>
                    {comment.user.role === 'ADMIN' ? <ShieldCheck size={16} /> : <User size={16} />}
                 </div>
              </div>
              <div className="flex-1">
                 <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                       <span className={`text-xs font-bold uppercase tracking-widest ${comment.user.role === 'ADMIN' ? 'text-charcoal' : 'text-charcoal-light'}`}>
                          {comment.user.name}
                       </span>
                       {comment.user.role === 'ADMIN' && (
                         <span className="text-[10px] px-1.5 py-0.5 bg-blush-600 text-white rounded font-bold uppercase tracking-wider">Staff</span>
                       )}
                       <span className="text-[10px] text-charcoal-lighter">
                          {new Date(comment.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                    )}
                 </div>
                 <p className="text-sm text-charcoal-light leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                 </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
