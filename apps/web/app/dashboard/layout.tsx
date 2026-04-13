"use client"; // Ensure this is at the top since we're using event handlers

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // To redirect after logout
import { Button } from "../../components/ui/button";
import { signOut } from "../../lib/auth-client"; // Import your signout method
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Settings, 
  LogOut,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            router.push("/login"); // Redirect to login page
          },
        },
      });
    } catch (error) {
      toast.error("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card p-4 hidden md:flex flex-col">
        <div className="mb-8 px-4 py-2">
          <h2 className="text-xl font-bold tracking-tight text-primary">STI RACA</h2>
          <p className="text-xs text-muted-foreground italic">Campus Management</p>
        </div>
        
        <nav className="space-y-2 flex-1">
          <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary transition-all px-4 py-6">
            <Link href="/dashboard">
              <LayoutDashboard size={20} /> 
              <span className="font-semibold">Overview</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary transition-all px-4 py-6">
            <Link href="/dashboard/raca">
              <FileText size={20} /> 
              <span className="font-semibold">RACA Filing</span>
            </Link>
          </Button>

          <Button asChild variant="ghost" className="w-full justify-start gap-3 hover:bg-primary/10 hover:text-primary transition-all px-4 py-6">
            <Link href="/dashboard/inventory">
              <Package size={20} /> 
              <span className="font-semibold">Inventory</span>
            </Link>
          </Button>
        </nav>

        {/* Bottom Actions */}
        <div className="pt-4 border-t space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground px-4 py-6">
            <Settings size={20} /> 
            <span>Settings</span>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 px-4 py-6"
          >
            {isLoggingOut ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <LogOut size={20} />
            )}
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="container py-8 px-6 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}