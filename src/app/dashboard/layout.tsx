"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Calendar,
  History,
  User,
  ShoppingBag,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/dashboard/blog", label: "Blog", icon: BookOpen },
  { href: "/dashboard/progreso", label: "Evolución", icon: TrendingUp },
  { href: "/dashboard/reservar", label: "Reservar", icon: Calendar },
  { href: "/dashboard/planes", label: "Comprar Bono", icon: Sparkles },
  { href: "/dashboard/historial", label: "Historial", icon: History },
  { href: "/dashboard/perfil", label: "Perfil", icon: User },
];

export default function DashboardLayout({
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
  }, [status, router]);

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

  if (!session) return null;

  return (
    <div className="min-h-screen bg-blush-50/20">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-blush-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-charcoal hover:text-blush-500 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Link href="/" className="flex flex-col items-center">
            <span className="text-lg font-heading font-bold tracking-wide text-charcoal leading-none">
              THE HEELS
            </span>
          </Link>
          <div className="w-8" />
        </div>
      </header>

      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-blush-100 z-50 
                    transition-transform duration-300 lg:translate-x-0 ${
                      sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-blush-50">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex flex-col">
                <span className="text-[8px] tracking-[0.35em] uppercase font-body font-medium text-charcoal-lighter">
                  Posing
                </span>
                <span className="text-xl font-heading font-bold tracking-wide text-charcoal leading-none">
                  THE HEELS
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-charcoal-lighter hover:text-charcoal"
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
                           text-charcoal-light hover:text-charcoal hover:bg-blush-50 
                           transition-all duration-200 group"
              >
                <item.icon
                  size={18}
                  className="text-charcoal-lighter group-hover:text-blush-500 transition-colors"
                />
                {item.label}
                <ChevronRight
                  size={14}
                  className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blush-300"
                />
              </Link>
            ))}

            {/* Admin link if admin */}
            {(session.user as any)?.role === "ADMIN" && (
              <>
                <div className="divider-wide !my-3" />
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                             text-charcoal-light hover:text-charcoal hover:bg-blush-50 
                             transition-all duration-200 group"
                >
                  <ShoppingBag
                    size={18}
                    className="text-charcoal-lighter group-hover:text-blush-500 transition-colors"
                  />
                  Panel Admin
                  <ChevronRight
                    size={14}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-blush-300"
                  />
                </Link>
              </>
            )}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-blush-50">
            <div className="flex items-center gap-3 px-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-blush-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-blush-600">
                  {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-charcoal truncate">
                  {session.user?.name}
                </p>
                <p className="text-xs text-charcoal-lighter truncate">
                  {session.user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm w-full
                         text-charcoal-lighter hover:text-red-500 hover:bg-red-50 
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
