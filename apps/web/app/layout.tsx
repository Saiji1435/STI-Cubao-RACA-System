import "./globals.css";
import { Sidebar } from "../components/layout/sidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
          {children}
        </main>
      </body>
    </html>
  );
}