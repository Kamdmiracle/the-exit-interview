'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Star, Send, CheckCircle, Heart, MessageSquare, Zap, Smile } from 'lucide-react';

export default function FeedbackForm({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- STATE FOR ALL QUESTIONS ---
  const [formData, setFormData] = useState({
    rating: 0, recommend: null as boolean | string | null, return_likelihood: 5,
    comm_before: 0, comfort_level: '', energy_chemistry: 0,
    satisfaction: 0, prioritize_enjoyment: '', adventurousness: 5, duration_rating: '',
    aftercare_vibe: 0, appreciated: '', exit_vibe: '',
    highlight: '', improvement: '', one_word: '', comment: '',
    collab_again: '', surprises: ''
  });

  useEffect(() => {
    if (localStorage.getItem(`submitted_${profileId}`)) setSubmitted(true);
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.rating === 0) return alert("Please at least give an overall rating!");
    setLoading(true);

    const { error } = await supabase.from('feedback_entries').insert([{
      profile_id: profileId,
      ...formData
    }]);

    setLoading(false);
    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setSubmitted(true);
      localStorage.setItem(`submitted_${profileId}`, 'true');
    }
  };

  if (submitted) return (
    <div className="text-center py-20 bg-white rounded-3xl shadow-xl">
      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
      <h2 className="text-3xl font-black">Vibe Check Sent!</h2>
      <p className="text-slate-500 mt-2">Your honesty is appreciated. Stay safe.</p>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-12 pb-20">
      
      {/* SECTION 1: OVERALL */}
      <FormSection title="Overall Experience" icon={<Star className="text-yellow-500" />}>
        <RatingLabel label="Overall Rating (1-5)" value={formData.rating} onChange={(v: any) => setFormData({...formData, rating: v})} />
        
        <ChoiceLabel label="Would you recommend?" options={['Yes', 'No', 'Maybe']} 
          value={formData.recommend} onChange={(v: any) => setFormData({...formData, recommend: v})} />

        <RangeLabel label="Likelihood to return" min={1} max={10} value={formData.return_likelihood} 
          onChange={(v: any) => setFormData({...formData, return_likelihood: v})} />
      </FormSection>

      {/* SECTION 2: THE VIBE */}
      <FormSection title="The Vibe" icon={<Zap className="text-blue-500" />}>
        <RatingLabel label="Communication beforehand" value={formData.comm_before} onChange={(v: any) => setFormData({...formData, comm_before: v})} />
        
        <ChoiceLabel label="Did you feel at ease?" options={['Yes', 'Somewhat', 'No']} 
          value={formData.comfort_level} onChange={(v: any) => setFormData({...formData, comfort_level: v})} />

        <RatingLabel label="Energy / Chemistry" value={formData.energy_chemistry} onChange={(v: any) => setFormData({...formData, energy_chemistry: v})} />
      </FormSection>

      {/* SECTION 3: THE MAIN EVENT */}
      <FormSection title="The Main Event" icon={<Heart className="text-red-500" />}>
        <RatingLabel label="Satisfaction Level" value={formData.satisfaction} onChange={(v: any) => setFormData({...formData, satisfaction: v})} />
        
        <ChoiceLabel label="Did they prioritize your enjoyment?" options={['Always', 'Sometimes', 'Not really']} 
          value={formData.prioritize_enjoyment} onChange={(v: any) => setFormData({...formData, prioritize_enjoyment: v})} />

        <RangeLabel label="Adventurousness (Vanilla → Wild)" min={1} max={10} value={formData.adventurousness} 
          onChange={(v: any) => setFormData({...formData, adventurousness: v})} />

        <ChoiceLabel label="Duration" options={['Too short', 'Just right', 'Too long']} 
          value={formData.duration_rating} onChange={(v: any) => setFormData({...formData, duration_rating: v})} />
      </FormSection>

      {/* SECTION 4: AFTERCARE */}
      <FormSection title="Aftercare & Exit" icon={<Smile className="text-purple-500" />}>
        <RatingLabel label="Post-experience vibe" value={formData.aftercare_vibe} onChange={(v: any) => setFormData({...formData, aftercare_vibe: v})} />
        <ChoiceLabel label="Were you made to feel appreciated?" options={['Yes', 'No', 'Somewhat']} 
          value={formData.appreciated} onChange={(v: any) => setFormData({...formData, appreciated: v})} />
        <ChoiceLabel label="Exit Style" options={['Very Smooth', 'Neutral', 'Awkward']} 
          value={formData.exit_vibe} onChange={(v: any) => setFormData({...formData, exit_vibe: v})} />
      </FormSection>

      {/* SECTION 5: OPEN ENDED */}
      <FormSection title="Parting Thoughts" icon={<MessageSquare className="text-slate-500" />}>
        <textarea placeholder="Highlight of the experience?" className="w-full p-4 border-2 rounded-2xl h-24 mb-4" 
          value={formData.highlight} onChange={(e) => setFormData({...formData, highlight: e.target.value})} />
        
        <textarea placeholder="What could be improved?" className="w-full p-4 border-2 rounded-2xl h-24 mb-4" 
          value={formData.improvement} onChange={(e) => setFormData({...formData, improvement: e.target.value})} />

        <input placeholder="One word to describe it?" className="w-full p-4 border-2 rounded-2xl mb-4" 
          value={formData.one_word} onChange={(e) => setFormData({...formData, one_word: e.target.value})} />

        <textarea placeholder="Any other comments?" className="w-full p-4 border-2 rounded-2xl h-32" 
          value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} />
      </FormSection>

      <button disabled={loading} className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl text-xl shadow-2xl hover:scale-[1.02] transition active:scale-95 disabled:opacity-50">
        {loading ? "Sealing the Interview..." : "Submit Anonymous Review"}
      </button>
    </form>
  );
}

// --- REUSABLE MINI-COMPONENTS ---

function FormSection({ title, icon, children }: any) {
  return (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-slate-50 rounded-xl">{icon}</div>
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RatingLabel({ label, value, onChange }: any) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex gap-2">
        {[1,2,3,4,5].map(s => (
          <button key={s} type="button" onClick={() => onChange(s)} className={`transition ${value >= s ? 'text-yellow-500' : 'text-slate-200'}`}>
            <Star size={28} fill={value >= s ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );
}

function ChoiceLabel({ label, options, value, onChange }: any) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt: string) => (
          <button key={opt} type="button" onClick={() => onChange(opt)} 
            className={`px-6 py-3 rounded-2xl border-2 font-bold transition ${value === opt ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100'}`}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RangeLabel({ label, min, max, value, onChange }: any) {
  return (
    <div>
      <p className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-wider">{label}: <span className="text-blue-600">{value}</span></p>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
}