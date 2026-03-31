import { supabase } from '../../../lib/supabase';
import FeedbackForm from './FeedbackForm';
import { Metadata } from 'next';

// This creates the "Preview Card" for Social Media
export async function generateMetadata({ params }: { params: { username: string } }): Promise<Metadata> {
  return {
    title: `The Exit Interview | ${params.username}`,
    description: `Rate your experience with ${params.username}. Honest, anonymous feedback.`,
    openGraph: {
      title: `How was your date with ${params.username}?`,
      description: "Leave an 'Exit Interview' and help them grow.",
      type: 'website',
    },
  };
}

export default async function RatePage(props: { params: Promise<{ username: string }> }) {
  // 1. This "awaits" the URL variable so the code doesn't skip it
  const params = await props.params;
  const username = params.username;

  // 2. Now we search the database using that username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .ilike('username', username) 
    .single();

  // 3. If no profile is found, show the 404
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-4xl font-bold text-red-500">404</h1>
        <p className="text-gray-600 font-medium">This person hasn't signed up for an Exit Interview yet.</p>
        <p className="text-xs text-gray-400 mt-2 text-slate-300 italic">Attempted search for: "{username}"</p>
      </div>
    );
  }

  // 4. If a profile IS found, show the form!
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 font-sans">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">The Exit Interview</h1>
          <p className="text-slate-500">Subject: <span className="font-bold text-slate-800">{profile.full_name}</span></p>
        </div>

        <FeedbackForm profileId={profile.id} />
      </div>
    </main>
  );
}