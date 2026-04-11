'use client';
import { useState } from 'react';
import { signIn } from '../../lib/auth-client';
import Image from 'next/image';
import StiLogo from "../../components/Logo/StiLogo.png";

export default function LoginPage() {
  // Pre-filled for development speed
  const [email, setEmail] = useState('Saiji_Admin@cubao.sti.edu');
  const [password, setPassword] = useState('Saiji1435');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard", 
      });

      if (error) alert(error.message);
    } catch (err) {
      console.error(err);
      alert("Backend not responding. Entering Dev Bypass mode.");
      window.location.assign("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <form onSubmit={handleLogin} className="flex flex-col gap-4 p-8 bg-white border-4 border-black shadow-[12px_12px_0px_rgba(0,0,0,1)] rounded-xl w-full max-w-sm">
        <div className="flex flex-col items-center mb-4">
          <Image src={StiLogo} alt="STI" width={60} height={60} priority />
          <h1 className="font-black text-xl uppercase mt-2">RACA Login</h1>
        </div>
        
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border-2 border-black p-3 rounded font-bold outline-none" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="border-2 border-black p-3 rounded font-bold outline-none" />
        
        <button type="submit" disabled={loading} className="bg-blue-600 text-white font-black uppercase py-3 border-2 border-black rounded shadow-[0_4px_0_rgba(0,0,0,1)] disabled:bg-slate-400">
          {loading ? "Verifying..." : "Login"}
        </button>
      </form>
    </div>
  );
}