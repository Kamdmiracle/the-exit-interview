import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <h1 className="text-7xl font-black mb-6 tracking-tighter bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
        The Exit Interview
      </h1>
      <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
        Get honest, anonymous feedback for your dating life. Stop wondering what went wrong and start seeing the data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Link href="/dashboard" className="bg-white text-black hover:bg-slate-200 px-10 py-5 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl">
          View My Dashboard
        </Link>
        <Link href="/rate/testuser" className="bg-slate-900 border border-slate-800 text-slate-300 px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all">
          See Public Form
        </Link>
      </div>
    </div>
  );
}