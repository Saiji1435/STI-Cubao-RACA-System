import { Package, ClipboardList, PlusCircle, AlertTriangle, CheckCircle } from "lucide-react";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {/* STI Asset Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Package size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Total Assets</p>
            <p className="text-xl font-bold tracking-tight">124</p>
          </div>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-4">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Good Condition</p>
            <p className="text-xl font-bold tracking-tight text-emerald-700">118</p>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
          <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle size={20} /></div>
          <div>
            <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Defective</p>
            <p className="text-xl font-bold text-red-600 tracking-tight">6</p>
          </div>
        </div>
      </div>

      {/* Admin Controls & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mt-2">
        <div className="flex gap-6">
          <button className="text-[11px] font-black uppercase border-b-2 border-blue-600 pb-2 text-blue-600 tracking-widest">
            Active Inventory
          </button>
          <button className="text-[11px] font-black uppercase text-slate-400 hover:text-slate-600 pb-2 tracking-widest transition-colors flex items-center gap-2">
            <ClipboardList size={14} /> Admin History Log
          </button>
        </div>
        
        <button className="flex items-center gap-2 bg-[#0f172a] text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm active:scale-95">
          <PlusCircle size={14} /> Add New Asset
        </button>
      </div>

      <main>{children}</main>
    </div>
  );
}