"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Tag,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  List,
  MessageSquare,
  BookOpen, // Added
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/alumnos", label: "Alumnos", icon: Users },
  { href: "/admin/agenda", label: "Agenda", icon: List },
  { href: "/admin/calendario", label: "Calendario", icon: Calendar },
  { href: "/admin/disponibilidad", label: "Disponibilidad", icon: Clock },
  { href: "/admin/tarifas", label: "Tarifas", icon: Tag },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpen }, // Added
  { href: "/admin/feedbacks", label: "Feedbacks", icon: MessageSquare },
];


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
    if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blush-50/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blush-200 border-t-blush-500 rounded-full animate-spin" />
          <p className="text-sm text-charcoal-lighter">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-blush-50/20">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-charcoal/95 backdrop-blur-md px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white/80 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-blush-300" />
            <span className="text-sm font-heading font-bold tracking-wide text-white leading-none">
              ADMIN
            </span>
          </div>
          <div className="w-8" />
        </div>
      </header>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-charcoal z-50 
                    transition-transform duration-300 lg:translate-x-0 ${
                      sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <Link href="/admin" className="flex flex-col">
                <span className="text-[8px] tracking-[0.35em] uppercase font-body font-medium text-white/40">
                  Posing
                </span>
                <span className="text-xl font-heading font-bold tracking-wide text-white leading-none">
                  THE HEELS
                </span>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield size={10} className="text-blush-300" />
                  <span className="text-[9px] tracking-[0.2em] uppercase text-blush-300 font-medium">
                    Admin Panel
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-white/40 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                           text-white/60 hover:text-white hover:bg-white/5 
                           transition-all duration-200 group"
              >
                <item.icon
                  size={18}
                  className="text-white/40 group-hover:text-blush-300 transition-colors"
                />
                {item.label}
                <ChevronRight
                  size={14}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blush-300"
                />
              </Link>
            ))}

            <div className="border-t border-white/10 my-3" />

            <Link
              href="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                         text-white/40 hover:text-white hover:bg-white/5 
                         transition-all duration-200 group"
            >
              <LayoutDashboard
                size={18}
                className="text-white/30 group-hover:text-blush-300 transition-colors"
              />
              Vista alumno
            </Link>
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-blush-300/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blush-300">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "A"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-white/40 truncate">
                  Administrador
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm w-full
                         text-white/40 hover:text-red-400 hover:bg-red-500/10 
                         transition-all duration-200"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
