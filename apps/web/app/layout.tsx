// apps/web/app/layout.tsx
import "./globals.css";
import Image from "next/image";
import StiLogo from "../components/Logo/StiLogo.png"; 
import { QueryProvider } from "../components/providers/query-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex flex-col h-screen overflow-hidden bg-white antialiased text-slate-900 font-sans">
        <QueryProvider>
          {/* HEADER - Adjusted height to h-[120px] to fit your 88px logo comfortably */}
          <header className="min-h-[110px] py-4 bg-[#dbeafe] flex items-center justify-between px-8 z-50 shrink-0 border-b border-[#BFDBFE] shadow-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <Image 
                  src={StiLogo} 
                  alt="STI" 
                  // Your requested size: 88px
                  width={88} 
                  height={88} 
                  priority 
                  className="object-contain"
                />
                
                {/* Clean, official RACA text scaled up */}
                <div className="flex flex-col justify-center">
                  <span className="font-black text-[36px] uppercase leading-none text-slate-900">

                  </span>
                  <span className="text-[18px] font-bold text-slate-600 uppercase tracking-tight mt-1">
                    REQUEST FOR APPROVAL OF CAMPUS ACTIVITY/VENUE
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Profile - Scaled to match the larger header */}
            <div className="flex items-center gap-5">
              <div className="text-right leading-tight hidden sm:block">
                <p className="text-[18px] font-bold text-slate-800 uppercase tracking-tight"></p>
                <p className="text-[12px] text-blue-700 font-black uppercase tracking-tighter"></p>
              </div>
              {/* Scaled the avatar box slightly to balance the header */}
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border-2 border-white flex items-center justify-center text-white font-black text-sm shadow-lg">
                
              </div>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden">
            {/* SCROLLABLE CONTENT AREA */}
            <main className="flex-1 overflow-y-auto p-8 scroll-smooth bg-white">
              <div className="max-w-[1600px] mx-auto min-h-full">
                {children}
              </div>
            </main>
          </div>
          
          {/* FOOTER */}
          <footer className="py-4 text-center border-t bg-slate-50 shrink-0 shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.25em]">
              © 2026 - STI College Cubao | RACA
            </p>
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}