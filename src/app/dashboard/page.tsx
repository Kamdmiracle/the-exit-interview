'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Heart, MessageCircle, Copy, LogOut, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      // 1. Check for active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/login');
        return;
      }

      // 2. Fetch the profile for the logged-in user
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        console.error("Profile not found:", profileError);
        setLoading(false);
        return;
      }

      setUserProfile(profile);
      await fetchFeedback(profile.id);

      // 3. Set up Real-time listener for THIS user's feedback only
      const channel = supabase
        .channel(`user-feedback-${profile.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'feedback_entries',
            filter: `profile_id=eq.${profile.id}` 
          },
          (payload: { new: any; }) => {
            setEntries((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    initializeDashboard();
  }, [router]);

  async function fetchFeedback(profileId: string) {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching feedback:", error);
    if (data) setEntries(data);
    setLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const copyLink = () => {
    if (!userProfile) return;
    const url = `${window.location.origin}/rate/${userProfile.username}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! Share it with your exes (or current vibes).");
  };

  // Logic Calculations
  const total = entries.length;
  const avgRating = total ? (entries.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;
  const recPercentage = total ? ((entries.filter(e => e.recommend).length / total) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading your stats...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Hey, {userProfile?.full_name?.split(' ')[0] || 'Kamdi'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">Your Personal Vibe Analytics</p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={copyLink}
              className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm"
            >
              <Copy size={16} /> Copy My Link
            </button>
            <button 
              onClick={handleLogout}
              className="bg-slate-200 text-slate-700 p-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatCard title="Average Rating" value={`${avgRating} / 5`} icon={<Star className="text-yellow-500 fill-yellow-500" />} />
          <StatCard title="Recommendation" value={`${recPercentage}%`} icon={<Heart className="text-red-500 fill-red-500" />} />
          <StatCard title="Total Feedback" value={total} icon={<MessageCircle className="text-blue-500" />} />
        </div>

        {/* FEEDBACK LIST */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-slate-400" /> Recent Entries
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">No feedback received yet. Share your link!</div>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className="p-6 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < entry.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic">"{entry.comment || "No comment provided."}"</p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                    <span className={entry.recommend ? "text-green-600 bg-green-50 px-2 py-1 rounded" : "text-red-600 bg-red-50 px-2 py-1 rounded"}>
                      {entry.recommend ? "Recommend" : "Not Recommended"}
                    </span>
                    <span className="text-slate-400 bg-slate-100 px-2 py-1 rounded">Return Score: {entry.return_likelihood}/10</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: any; icon: any }) {
  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between transition hover:shadow-md">
      <div>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <p className="text-3xl font-black text-slate-900">{value}</p>
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl">{icon}</div>
    </div>
  );
}