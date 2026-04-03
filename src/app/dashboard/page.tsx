'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase'; 
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Heart, MessageCircle, Copy, LogOut, Loader2, Zap, Clock } from 'lucide-react';
import VibeChart from '../../components/charts/VibeChart';

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  const fetchFeedback = useCallback(async (profileId: string) => {
    const { data, error } = await supabase
      .from('feedback_entries')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false });

    if (data) setEntries(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        await fetchFeedback(profile.id);
      } else {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [router, fetchFeedback]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const copyLink = () => {
    if (!userProfile) return;
    const url = `${window.location.origin}/rate/${userProfile.username}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! Share it with your vibes.");
  };

  const total = entries.length;
  const avgRating = total ? (entries.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;
  const recPercentage = total ? ((entries.filter(e => e.recommend === true || e.recommend === 'Yes').length / total) * 100).toFixed(0) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <Loader2 className="animate-spin mr-2" /> Loading your stats...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Hey, {userProfile?.full_name?.split(' ')[0] || 'Kamdi'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium italic">Your Personal Vibe Analytics</p>
          </div>

          <div className="flex gap-3">
            <button onClick={copyLink} className="bg-white border border-slate-200 px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition shadow-sm text-slate-700">
              <Copy size={16} /> Copy My Link
            </button>
            <button onClick={handleLogout} className="bg-slate-200 text-slate-700 p-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition" title="Logout">
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

        <div className="mb-12">
          <VibeChart data={entries} />
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
                <div key={entry.id} className="p-8 hover:bg-slate-50 transition">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} className={i < entry.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                      ))}
                    </div>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Detailed Stats Grid (Only show if new data exists) */}
                  {(entry.satisfaction || entry.energy_chemistry || entry.duration_rating) && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <StatMini label="Satisfaction" value={`${entry.satisfaction || 0}/5`} />
                      <StatMini label="Energy" value={`${entry.energy_chemistry || 0}/5`} />
                      <StatMini label="Duration" value={entry.duration_rating || 'N/A'} />
                      <StatMini label="Recommend" value={typeof entry.recommend === 'boolean' ? (entry.recommend ? 'Yes' : 'No') : (entry.recommend || 'N/A')} />
                    </div>
                  )}

                  {/* Main Comment */}
                  <div className="relative">
                    <p className="text-slate-800 leading-relaxed italic text-lg pr-4">
                      "{entry.comment || "No parting words provided."}"
                    </p>
                  </div>

                  {/* Tags & Highlights */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    {entry.one_word && (
                      <span className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                        # {entry.one_word}
                      </span>
                    )}
                    {entry.highlight && (
                      <span className="px-4 py-1.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full">
                        Highlight: {entry.highlight}
                      </span>
                    )}
                    {entry.return_likelihood && (
                       <span className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">
                       Return Score: {entry.return_likelihood}/10
                     </span>
                    )}
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

// Sub-components remains at the bottom
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

function StatMini({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700">{value || 'N/A'}</p>
    </div>
  );
}