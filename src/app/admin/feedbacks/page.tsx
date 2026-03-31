"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MessageSquare, ToggleLeft, ToggleRight, AlertCircle, X, Star, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    role: "",
    rating: 5,
    imageUrl: "",
    active: true,
  });

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/feedbacks");
      if (!res.ok) throw new Error("Error fetching feedbacks");
      const data = await res.json();
      setFeedbacks(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleOpenModal = (feedback: any = null) => {
    if (feedback) {
      setEditingFeedback(feedback);
      setFormData({
        name: feedback.name,
        message: feedback.message,
        role: feedback.role || "",
        rating: feedback.rating || 5,
        imageUrl: feedback.imageUrl || "",
        active: feedback.active,
      });
    } else {
      setEditingFeedback(null);
      setFormData({
        name: "",
        message: "",
        role: "",
        rating: 5,
        imageUrl: "",
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFeedback(null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("La imagen es demasiado pesada (máximo 2MB)");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `feedback-${Date.now()}-${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('feedbacks')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feedbacks')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (err: any) {
      alert("Error subiendo imagen: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFeedback 
        ? `/api/feedbacks/${editingFeedback.id}` 
        : "/api/feedbacks";
      const method = editingFeedback ? "PATCH" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al guardar feedback");
      
      handleCloseModal();
      fetchFeedbacks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este feedback?")) return;
    try {
      const res = await fetch(`/api/feedbacks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchFeedbacks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleStatus = async (feedback: any) => {
    try {
      const res = await fetch(`/api/feedbacks/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !feedback.active }),
      });
      if (!res.ok) throw new Error("Error updating status");
      fetchFeedbacks();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl md:text-4xl text-charcoal font-light">
            Feedbacks y Testimonios
          </h1>
          <p className="text-sm text-charcoal-lighter mt-1">
            Gestiona las opiniones de las alumnas que aparecen en la web
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary gap-2"
        >
          <Plus size={14} />
          Nuevo feedback
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
             <div key={i} className="card h-48 animate-pulse bg-blush-50/50" />
          ))}
        </div>
      ) : error ? (
        <div className="card text-center py-12">
           <AlertCircle size={32} className="text-red-300 mx-auto mb-3" />
           <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : feedbacks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb) => (
            <div key={fb.id} className={`card group transition-all duration-300 ${!fb.active ? "opacity-60" : ""}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5 text-yellow-400">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenModal(fb)}
                    className="p-1.5 rounded-lg hover:bg-blush-50 transition-colors"
                  >
                    <Edit2 size={14} className="text-charcoal-lighter" />
                  </button>
                  <button 
                    onClick={() => handleDelete(fb.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} className="text-red-300" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-charcoal-light italic mb-4 line-clamp-4">
                "{fb.message}"
              </p>

              <div className="divider-wide !my-3" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {fb.imageUrl ? (
                    <div className="w-10 h-10 rounded-full bg-blush-100 overflow-hidden border border-blush-100">
                      <img src={fb.imageUrl} alt={fb.name} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blush-100 flex items-center justify-center text-blush-600 font-heading font-bold">
                      {fb.name?.charAt(0) || "A"}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-semibold text-charcoal leading-none mb-1">{fb.name || "Alumna Anónima"}</h4>
                    <p className="text-[10px] text-charcoal-lighter uppercase tracking-wider">{fb.role || "Alumna"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleStatus(fb)}
                  className="flex items-center gap-1 focus:outline-none"
                >
                  {fb.active ? (
                    <ToggleRight size={20} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={20} className="text-charcoal-lighter" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-16">
          <MessageSquare size={40} className="text-blush-200 mx-auto mb-4" />
          <h2 className="font-heading text-xl text-charcoal mb-2">
            No hay feedbacks cargados
          </h2>
          <p className="text-sm text-charcoal-lighter max-w-sm mx-auto">
            Añade testimonios reales para generar confianza en las nuevas alumnas
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-fade-in-up shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-blush-50 flex items-center justify-between flex-shrink-0">
              <h3 className="font-heading text-xl text-charcoal uppercase tracking-widest font-medium">
                {editingFeedback ? "Editar Feedback" : "Nuevo Feedback"}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="p-2 text-charcoal-lighter hover:text-charcoal rounded-full hover:bg-blush-50 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Nombre de la alumna</label>
                    <input 
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ej: Paula García (opcional)"
                    />
                  </div>

                  <div>
                    <label className="input-label">Categoría / Título (Opcional)</label>
                    <input 
                      type="text"
                      className="input"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      placeholder="Ej: Bikini Fitness NPC"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-blush-50/20 border-2 border-dashed border-blush-100 min-h-[140px]">
                  {uploading ? (
                    <div className="text-center">
                      <Loader2 size={24} className="animate-spin text-blush-500 mx-auto mb-2" />
                      <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest font-medium">Subiendo...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <div className="relative group w-24 h-24">
                      <img 
                        src={formData.imageUrl} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-white shadow-md"
                      />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, imageUrl: ""})}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-red-500 hover:text-red-600 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-blush-100 flex items-center justify-center mx-auto mb-2 text-blush-500">
                        <Plus size={20} />
                      </div>
                      <p className="text-[10px] text-charcoal-lighter uppercase tracking-widest font-medium">Foto</p>
                    </div>
                  )}
                  <input 
                    type="file"
                    className="hidden"
                    id="feedback-image"
                    autoComplete="off"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  {!uploading && (
                    <label 
                      htmlFor="feedback-image"
                      className="mt-2 text-xs text-blush-600 hover:text-blush-700 font-medium cursor-pointer"
                    >
                      {formData.imageUrl ? "Cambiar foto" : "Subir foto"}
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="input-label">Testimonio</label>
                <textarea 
                  className="input min-h-[100px] resize-none"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Escribe lo que ha dicho sobre la academia..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Valoración</label>
                  <select 
                    className="input"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  >
                    {[5,4,3,2,1].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Estrella' : 'Estrellas'}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col justify-end">
                   <button 
                    type="button"
                    onClick={() => setFormData({...formData, active: !formData.active})}
                    className="flex items-center gap-2 text-sm text-charcoal-light focus:outline-none mb-1 h-[46px]"
                  >
                    {formData.active ? (
                      <ToggleRight size={32} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={32} className="text-charcoal-lighter" />
                    )}
                    Visible
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3 flex-shrink-0">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingFeedback ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
