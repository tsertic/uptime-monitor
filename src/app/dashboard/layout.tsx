import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-green-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">UP</span>
            </div>
            <span className="font-semibold text-gray-900">UptimePulse</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink href="/dashboard">Overview</NavLink>
          <NavLink href="/dashboard/monitors">Monitors</NavLink>
          <NavLink href="/dashboard/billing">Billing</NavLink>
          <NavLink href="/dashboard/settings">Settings</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <UserButton />
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
    >
      {children}
    </Link>
  );
}
