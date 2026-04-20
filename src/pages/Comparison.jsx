import React from 'react';
import Navbar from '../components/Navbar';

export default function Comparison() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200">
      <Navbar />
      
      <main className="pt-20">
        {/* Traditional vs Queueless */}
        <section id="comparison" className="bg-slate-900 py-24 text-white overflow-hidden relative min-h-[80vh] flex items-center">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h4 className="text-cyan-400 font-bold tracking-widest text-sm uppercase mb-2">Why Choose Queueless</h4>
              <h2 className="text-5xl font-black mb-4">Traditional vs Queueless</h2>
              <p className="text-slate-400 text-lg">See how we're changing the game in healthcare management</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Traditional */}
              <div className="group relative bg-slate-800/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/5 transition-all overflow-hidden hover:bg-slate-800/60">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                  <h3 className="text-3xl font-bold">Traditional System</h3>
                </div>
                <ul className="space-y-5">
                  {["Long waiting queues", "Manual paperwork", "Limited operating hours", "Difficult to access records", "No appointment reminders", "Prone to errors", "Poor patient experience"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-slate-400 font-medium pb-4 border-b border-white/5 last:border-0">
                      <span className="text-red-500/70 font-black">✕</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Queueless */}
              <div className="group relative bg-gradient-to-br from-blue-600/10 to-cyan-600/10 backdrop-blur-md rounded-[2.5rem] p-10 border border-cyan-500/20 transition-all overflow-hidden hover:from-blue-600/20 hover:to-cyan-600/20">
                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-3xl font-bold">With Queueless</h3>
                </div>
                <ul className="space-y-5">
                  {["Zero waiting queues", "100% digital records", "24/7 accessibility", "Instant report access", "Smart WhatsApp reminders", "Accurate & reliable", "Exceptional patient care"].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-slate-200 font-medium pb-4 border-b border-white/5 last:border-0">
                      <span className="text-cyan-400 font-black">✓</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simplified Footer for subpages */}
      <footer className="bg-slate-900 py-10 text-center text-slate-500 text-sm border-t border-white/5">
        <p>© {new Date().getFullYear()} Logiciel Ganymede. All rights reserved.</p>
      </footer>
    </div>
  );
}
