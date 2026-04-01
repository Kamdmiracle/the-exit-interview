'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username.toLowerCase().trim(),
          full_name: fullName,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      alert("Account created! Redirecting to dashboard...");
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-4">
        <h1 className="text-3xl font-black text-slate-900">Get Your Link</h1>
        <input type="text" placeholder="Full Name" className="w-full p-4 border rounded-xl" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        <input type="text" placeholder="Desired Username (for your link)" className="w-full p-4 border rounded-xl" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" className="w-full p-4 border rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" className="w-full p-4 border rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition">
          {loading ? 'Creating Account...' : 'Sign Up Free'}
        </button>
      </form>
    </div>
  );
}