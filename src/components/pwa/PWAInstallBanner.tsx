"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
       return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 5 seconds
      setTimeout(() => setShowBanner(true), 5000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] animate-slide-up">
      <div className="bg-charcoal text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blush-500 flex items-center justify-center">
            <Download size={20} />
          </div>
          <div>
            <p className="text-sm font-bold">Instala The Heels</p>
            <p className="text-[10px] text-white/60">Acceso rápido a tus clases y blog</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleInstall}
            className="px-4 py-2 bg-blush-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blush-600 transition-colors"
          >
            Instalar
          </button>
          <button 
            onClick={() => setShowBanner(false)}
            className="p-2 text-white/40 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
