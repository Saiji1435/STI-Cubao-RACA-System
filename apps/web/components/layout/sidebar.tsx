import Link from "next/link";
import { LayoutDashboard, Calendar, Package, CheckSquare, Settings } from "lucide-react";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Schedules", href: "/schedules" },
  { icon: CheckSquare, label: "Approvals", href: "/approvals" },
  { icon: Package, label: "Inventory", href: "/inventory" },
];

export function Sidebar() {
  return (
    <div className="w-64 border-r bg-white h-full flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white font-bold">S</div>
        <span className="font-bold text-xl text-blue-900 tracking-tight">RACA</span>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} 
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-blue-900 transition-colors">
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 w-full hover:bg-red-50 rounded-lg">
           Logout
        </button>
      </div>
    </div>
  );
}