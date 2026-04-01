'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase'; // Using the '@' shortcut is cleaner
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function FeedbackForm({ profileId }: { profileId: string }) {
  const [rating, setRating] = useState(0);
  const [returnLikelihood, setReturnLikelihood] = useState(5);
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const hasSubmitted = localStorage.getItem(`submitted_${profileId}`);
    if (hasSubmitted) {
      setSubmitted(true); 
    }
  }, [profileId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || recommend === null) return alert("Please select a star rating and a recommendation!");

    setLoading(true);
    
    // IMPORTANT: Make sure your table column is exactly 'profile_id'
    const { error } = await supabase.from('feedback_entries').insert([
      {
        profile_id: profileId, 
        rating,
        return_likelihood: returnLikelihood,
        recommend,
        comment,
      },
    ]);

    setLoading(false);
    
    if (error) {
      // THIS IS THE FIX: This will tell us the exact database error
      console.error("Submission Error:", error);
      alert(`Database Error: ${error.message}. Check your RLS policies or column names!`);
    } else {
      setSubmitted(true);
      localStorage.setItem(`submitted_${profileId}`, 'true');
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-10 animate-in zoom-in duration-300">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Feedback Sent!</h2>
        <p className="text-slate-500">Thank you for your honesty. Your data has been anonymized.</p>
        <button 
           onClick={() => setSubmitted(false)} 
           className="mt-6 text-sm text-blue-600 font-medium hover:underline"
        >
          Submit another (Debug Mode)
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* RATING */}
      <div>
        <label className="block font-semibold mb-2">Overall Experience (1-5)</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-2 transition ${rating >= star ? 'text-yellow-500' : 'text-slate-300'}`}
            >
              <Star fill={rating >= star ? 'currentColor' : 'none'} size={32} />
            </button>
          ))}
        </div>
      </div>

      {/* LIKELIHOOD */}
      <div>
        <label className="block font-semibold mb-2">Likelihood to return? ({returnLikelihood}/10)</label>
        <input 
          type="range" min="1" max="10" 
          value={returnLikelihood} 
          onChange={(e) => setReturnLikelihood(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* RECOMMENDATION */}
      <div>
        <label className="block font-semibold mb-2">Would you recommend them to a friend?</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setRecommend(true)}
            className={`flex-1 py-3 rounded-xl border-2 transition font-bold ${recommend === true ? 'bg-green-50 border-green-500 text-green-700' : 'border-slate-100 text-slate-500'}`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setRecommend(false)}
            className={`flex-1 py-3 rounded-xl border-2 transition font-bold ${recommend === false ? 'bg-red-50 border-red-500 text-red-700' : 'border-slate-100 text-slate-500'}`}
          >
            No
          </button>
        </div>
      </div>

      {/* COMMENT */}
      <div>
        <label className="block font-semibold mb-2 text-slate-700">Any parting words?</label>
        <textarea
          placeholder="Be honest, but keep it constructive..."
          className="w-full p-4 border-2 border-slate-100 rounded-xl focus:border-blue-500 focus:outline-none h-32 transition"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      {/* SUBMIT */}
      <button
        disabled={loading}
        className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition transform active:scale-95 disabled:opacity-50"
      >
        {loading ? "Sending Feedback..." : <><Send size={18} /> Submit Interview</>}
      </button>
    </form>
  );
}