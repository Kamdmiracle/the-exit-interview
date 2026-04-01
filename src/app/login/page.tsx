'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // This function ONLY checks existing credentials.
    // It does NOT need metadata like name or username.
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // SUCCESS: Using a hard redirect to ensure the Dashboard 
      // picks up the authenticated session immediately.
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Log in to manage your vibe checks.</p>
        </div>

        <div className="space-y-4">
          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition" 
            value={email} onChange={(e) => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Password" 
            className="w-full p-4 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none transition" 
            value={password} onChange={(e) => setPassword(e.target.value)} required 
          />

          <button 
            disabled={loading} 
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-sm text-slate-500 font-medium">
          New here? <a href="/signup" className="text-blue-600 font-bold">Create an account</a>
        </p>
      </form>
    </div>
  );
}