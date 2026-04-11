import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "../../components/ui/button";
import { LayoutDashboard, FileText, Package, Settings, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-6 hidden md:flex flex-col">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-bold tracking-tight text-primary">STI RACA</h2>
          <p className="text-xs text-muted-foreground italic">Campus Management</p>
        </div>
        
        <nav className="space-y-1 flex-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <LayoutDashboard size={18} /> Overview
            </Button>
          </Link>
          <Link href="/dashboard/raca">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <FileText size={18} /> RACA Filing
            </Button>
          </Link>
          <Link href="/dashboard/inventory">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Package size={18} /> Inventory
            </Button>
          </Link>
        </nav>

        <div className="pt-4 border-t space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <Settings size={18} /> Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive">
            <LogOut size={18} /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}