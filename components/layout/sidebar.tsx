"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/use-auth-store";
import { useConfiguracoes } from "@/hooks/use-configuracoes";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Scissors,
  CalendarDays,
  UserCircle,
  LogOut,
  Menu,
  X,
  Images,
  Settings,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/funcionarias", label: "Funcionárias", icon: Users },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/clientes", label: "Clientes", icon: UserCircle },
  { href: "/galeria", label: "Galeria", icon: Images },
  { href: "/configuracoes", label: "Configurações", icon: Settings }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuthStore();
  const { config } = useConfiguracoes();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          {config?.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={32}
              height={32}
              className="rounded-md object-cover w-8 h-8"
            />
          ) : (
            <span className="text-2xl">💇‍♀️</span>
          )}
          <span className="font-bold text-lg truncate">
            {config?.nomeSalao ?? "SalãoApp"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{usuario?.nome}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t space-y-1">
        <Link
          href="/perfil"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
            pathname === "/perfil"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-gray-100 hover:text-foreground"
          )}
        >
          <User size={18} />
          {usuario?.nome?.split(" ")[0]}
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sair
        </Button>
      </div>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col">
        <NavContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {config?.logoUrl ? (
            <Image
              src={config.logoUrl}
              alt="Logo"
              width={28}
              height={28}
              className="rounded-md object-cover w-7 h-7"
            />
          ) : (
            <span className="text-xl">💇‍♀️</span>
          )}
          <span className="font-bold">{config?.nomeSalao ?? "SalãoApp"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          "md:hidden fixed top-0 left-0 z-40 h-full w-64 bg-white flex flex-col transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>
    </>
  );
}
