"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "../../components/ui/button";
import { signOut, useSession } from "../../lib/auth-client"; 
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Settings, 
  LogOut,
  Loader2,
  School,
  ShieldCheck 
} from "lucide-react";
import { toast } from "sonner";
import { isAuthorized } from "../../lib/config"; // Ensure this matches your config path

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // FIXED: Using helper function to avoid ts(2367) comparison error
  const userRole = session?.user?.role;
  const isAdminOrHead = isAuthorized(userRole);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-4 hidden md:flex flex-col shadow-sm">
        <div className="mb-8 px-4 py-4 bg-slate-900 rounded-xl text-white">
          <h2 className="text-xl font-black tracking-tighter uppercase italic">STI RACA</h2>
          <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em]">Campus Management</p>
        </div>
        
        <nav className="space-y-1.5 flex-1">
          {/* General Links */}
          <NavButton 
            href="/dashboard" 
            icon={<LayoutDashboard size={18}/>} 
            label="Overview" 
            active={pathname === "/dashboard"} 
          />
          
          <NavButton 
            href="/dashboard/raca" 
            icon={<FileText size={18}/>} 
            label="RACA Filing" 
            active={pathname === "/dashboard/raca"} 
          />

          {/* Protected Management Links */}
          {isAdminOrHead && (
            <>
              <div className="pt-4 pb-2 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={10}/> Signatory Control
              </div>
              
              <NavButton 
                href="/dashboard/inventory" 
                icon={<Package size={18}/>} 
                label="Inventory" 
                active={pathname === "/dashboard/inventory"} 
              />
              
              <NavButton 
                href="/dashboard/rooms" 
                icon={<School size={18}/>} 
                label="Room Management" 
                active={pathname === "/dashboard/rooms"} 
              />
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-slate-500 hover:text-slate-900 px-4 py-6">
            <Settings size={18} /> 
            <span className="font-bold uppercase text-[10px]">Settings</span>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 px-4 py-6 transition-colors"
          >
            {isLoggingOut ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <LogOut size={18} />
            )}
            <span className="font-bold uppercase text-[10px]">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Reusable Nav Button Component to keep the sidebar code clean
 */
function NavButton({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
  return (
    <Button 
      asChild 
      variant={active ? "secondary" : "ghost"} 
      className={`w-full justify-start gap-3 px-4 py-6 transition-all ${
        active 
          ? 'bg-blue-50 text-blue-700 shadow-sm border-r-2 border-blue-600 rounded-r-none' 
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      <Link href={href}>
        {icon} 
        <span className="font-bold uppercase text-[10px] tracking-tight">{label}</span>
      </Link>
    </Button>
  );
}