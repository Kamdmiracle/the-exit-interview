'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Heart, MessageCircle, Copy, LogOut, Loader2, Zap, Smile, Clock, ShieldCheck } from 'lucide-react';
import VibeChart from '../../components/charts/VibeChart';

export default function Dashboard() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();

  const fetchFeedback = useCallback(async (profileId: string) => {
    // We select '*' to ensure all your new form columns are fetched
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
      if (!session) return router.push('/login');

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

  const copyLink = () => {
    const url = `${window.location.origin}/rate/${userProfile?.username}`;
    navigator.clipboard.writeText(url);
    alert("Link copied! Ready to share.");
  };

  const total = entries.length;
  const avgRating = total ? (entries.reduce((acc, curr) => acc + curr.rating, 0) / total).toFixed(1) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-12 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight">Hey, {userProfile?.full_name?.split(' ')[0]}</h1>
            <p className="text-slate-500 italic">Your Detailed Vibe Analytics</p>
          </div>
          <div className="flex gap-3">
            <button onClick={copyLink} className="bg-white border px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition">
              <Copy size={16} /> Copy Link
            </button>
            <button onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} className="bg-slate-200 p-3 rounded-2xl hover:bg-red-50 hover:text-red-600 transition">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* TOP STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Overall Avg" value={`${avgRating}/5`} icon={<Star className="text-yellow-500 fill-yellow-500" />} />
          <StatCard title="Total Entries" value={total} icon={<MessageCircle className="text-blue-500" />} />
          <StatCard title="Latest Vibe" value={entries[0]?.one_word || 'N/A'} icon={<Zap className="text-purple-500" />} />
        </div>

        <VibeChart data={entries} />

        {/* DETAILED ENTRIES FEED */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2 px-2">
            <TrendingUp size={20} className="text-slate-400" /> Full Interview Breakdowns
          </h3>

          {entries.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[2.5rem] border-2 border-dashed border-slate-200 text-slate-400">
              No interviews completed yet. Share your link to start collecting data!
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 space-y-8">
                
                {/* 1. Header: Stars and Date */}
                <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className={i < entry.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-100"} />
                    ))}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest block">Session Date</span>
                    <span className="font-mono text-sm">{new Date(entry.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* 2. Grid Sections (Bento Style) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* The Vibe Column */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Zap size={12} /> The Vibe
                    </h4>
                    <DataRow label="Communication" value={`${entry.comm_before}/5`} />
                    <DataRow label="Comfort Level" value={entry.comfort_level} />
                    <DataRow label="Chemistry" value={`${entry.energy_chemistry}/5`} />
                  </div>

                  {/* The Event Column */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Heart size={12} /> The Experience
                    </h4>
                    <DataRow label="Satisfaction" value={`${entry.satisfaction}/5`} />
                    <DataRow label="Priority" value={entry.prioritize_enjoyment} />
                    <DataRow label="Duration" value={entry.duration_rating} />
                    <DataRow label="Adventure" value={`${entry.adventurousness}/10`} />
                  </div>

                  {/* Aftercare Column */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Smile size={12} /> Aftercare
                    </h4>
                    <DataRow label="Post-Vibe" value={`${entry.aftercare_vibe}/5`} />
                    <DataRow label="Appreciated" value={entry.appreciated} />
                    <DataRow label="Exit Style" value={entry.exit_vibe} />
                    <DataRow label="Recommend" value={typeof entry.recommend === 'boolean' ? (entry.recommend ? 'Yes' : 'No') : entry.recommend} />
                  </div>
                </div>

                {/* 3. Open Ended / Comments */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                   <CommentBox label="What was the highlight?" text={entry.highlight} />
                   <CommentBox label="What could be improved?" text={entry.improvement} />
                </div>

                <div className="bg-slate-50 rounded-3xl p-6">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Final Comments</p>
                   <p className="text-slate-700 leading-relaxed italic">"{entry.comment || "No additional comments left."}"</p>
                   {entry.one_word && (
                     <div className="mt-4 inline-block bg-blue-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                       # {entry.one_word}
                     </div>
                   )}
                </div>

              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function StatCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
      <div className="bg-slate-50 p-4 rounded-2xl">{icon}</div>
    </div>
  );
}

function DataRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800">{value || 'N/A'}</span>
    </div>
  );
}

function CommentBox({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="p-4 bg-white border border-slate-100 rounded-2xl">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm text-slate-600 italic">"{text}"</p>
    </div>
  );
}