import "./globals.css";
import { Sidebar } from "../components/layout/sidebar";
import { Toaster } from "sonner"; 

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
        
        {/* ✅ This will now show Green for success and Red for errors */}
        <Toaster 
          position="top-center" 
          richColors 
          expand={false} 
          closeButton 
        />
      </body>
    </html>
  );
}