import React from 'react';
import Navbar from '../components/Navbar';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200">
      <Navbar />
      
      <main className="pt-20">
        {/* Contact Us Section */}
        <section id="contact" className="bg-slate-50 py-24 min-h-[90vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h4 className="text-[#4259ec] font-bold tracking-widest text-sm uppercase mb-2">Get In Touch</h4>
              <h2 className="text-5xl font-black text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-500 text-lg">Have questions? We'd love to hear from you.</p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Left Column: Info */}
              <div className="space-y-8">
                <h3 className="text-4xl font-black text-slate-900 leading-tight">Let's Talk About Your Healthcare Needs</h3>
                <p className="text-slate-500 text-lg">Whether you're a small clinic or a large hospital, we're here to help you transform your healthcare delivery.</p>
                
                <div className="space-y-6">
                  {[
                    { label: "Phone: Sales & Support", value: "+91 7698000747", icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
                    { label: "Corporate Office Address", value: "Logiciel Ganymede, Junagadh - 362001", icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" },
                    { label: "Business Hours (IST)", value: "Mon - Sat: 9:00 AM - 6:00 PM", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }
                  ].map((info, i) => (
                    <div key={i} className="group flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden transition-all">
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2b7fff] flex items-center justify-center shrink-0">
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={info.icon} /></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{info.label}</h4>
                        <p className="text-slate-500 font-medium">{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right Column: Form */}
              <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Request a Free Demo</h3>
                <form className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                      <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2b7fff] outline-none transition-all" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                      <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2b7fff] outline-none transition-all" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2b7fff] outline-none transition-all" placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Message *</label>
                    <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#2b7fff] outline-none transition-all h-32 resize-none" placeholder="Tell us about your requirements..."></textarea>
                  </div>
                  <button className="w-full bg-[#2b7fff] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Simplified Footer */}
      <footer className="bg-slate-900 py-10 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Logiciel Ganymede. All rights reserved.</p>
      </footer>
    </div>
  );
}
