import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { LayoutDashboard, Users, Sword, BarChart2, LogOut, Package, Sparkles, Zap, Image as ImageIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  // Login page — no sidebar, middleware handles the redirect
  if (!session) {
    return <div className="min-h-screen bg-dark-900">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-dark-800 border-r border-dark-600 flex flex-col shrink-0">
        <div className="p-4 border-b border-dark-600">
          <Link href="/" className="flex flex-col gap-1">
            <Image src="/logo.png" alt="HOK Builds" width={120} height={26} className="h-6 w-auto object-contain" />
            <p className="text-[10px] text-gray-500">Painel Admin</p>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <NavItem href="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" />
          <div className="pt-2 pb-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider px-3">Conteúdo</p>
          </div>
          <NavItem href="/admin/heroes" icon={<Users size={16} />} label="Heróis" />
          <NavItem href="/admin/builds" icon={<Sword size={16} />} label="Builds" />
          <NavItem href="/admin/stats" icon={<BarChart2 size={16} />} label="Estatísticas" />
          <NavItem href="/admin/banner" icon={<ImageIcon size={16} />} label="Banner" />
          <div className="pt-2 pb-1">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider px-3">Cadastros</p>
          </div>
          <NavItem href="/admin/items" icon={<Package size={16} />} label="Itens" />
          <NavItem href="/admin/arcana" icon={<Sparkles size={16} />} label="Arcana" />
          <NavItem href="/admin/spells" icon={<Zap size={16} />} label="Feitiços" />
        </nav>

        <div className="p-3 border-t border-dark-600">
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-400 hover:text-gold-400 hover:bg-dark-700 rounded-lg transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
