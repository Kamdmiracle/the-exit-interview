'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // IMPORTANT: This data is what your SQL trigger uses to 
        // automatically create the row in your 'profiles' table.
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
      alert("Account created! Redirecting to your dashboard...");
      // Use the 'Hammer' redirect to force the browser to recognize the new session
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <form onSubmit={handleSignup} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md space-y-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Get Your Link</h1>
        <p className="text-slate-500 text-sm">Create an account to start receiving feedback.</p>
        
        <input type="text" placeholder="Full Name" className="w-full p-4 border rounded-xl outline-none focus:border-blue-500" 
          value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          
        <input type="text" placeholder="Desired Username" className="w-full p-4 border rounded-xl outline-none focus:border-blue-500" 
          value={username} onChange={(e) => setUsername(e.target.value)} required />
          
        <input type="email" placeholder="Email Address" className="w-full p-4 border rounded-xl outline-none focus:border-blue-500" 
          value={email} onChange={(e) => setEmail(e.target.value)} required />
          
        <input type="password" placeholder="Create Password" className="w-full p-4 border rounded-xl outline-none focus:border-blue-500" 
          value={password} onChange={(e) => setPassword(e.target.value)} required />
          
        <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Creating Account...' : 'Sign Up Free'}
        </button>
        
        <p className="text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-blue-600 font-bold">Login here</a>
        </p>
      </form>
    </div>
  );
}