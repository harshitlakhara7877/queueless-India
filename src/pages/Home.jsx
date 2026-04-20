import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const slides = [
  {
    title: <>Welcome to the Future of <br /> Healthcare</>,
    subtitle: "Experience seamless hospital management with zero queues and complete digital convenience",
    gradient: "from-[#4259ec] to-[#1bb5ce]"
  },
  {
    title: <>Smart Queue <br /> Management</>,
    subtitle: "Reduce wait times and improve patient satisfaction with our automated digital token system",
    gradient: "from-[#2b7fff] to-[#0bc3d6]"
  },
  {
    title: <>Digital Hospital <br /> Transformation</>,
    subtitle: "End-to-end cloud solutions for OPD, IPD, pharmacy, and laboratory management",
    gradient: "from-[#6366f1] to-[#a855f7]"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-200">
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        
        {/* Hero Section */}
        <section id="home" className="relative w-full h-[600px] flex items-center justify-center text-center overflow-hidden">
          {/* Animated Background Gradients */}
          {slides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
            ></div>
          ))}
          
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4">
            <div key={currentSlide} className="animate-[fadeInUp_0.8s_ease-out]">
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-6 leading-tight drop-shadow-md">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-medium mb-10 max-w-2xl mx-auto">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link to="/login" className="px-8 py-3.5 bg-white text-[#4259ec] font-bold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                  Get Free Demo
                </Link>
                <Link to="/comparison" className="px-8 py-3.5 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all text-center">
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Indicators */}
            <div className="mt-12 flex justify-center gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Our Solutions */}
        <section id="solutions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h4 className="text-[#4259ec] font-bold tracking-widest text-sm uppercase mb-2">Our Solutions</h4>
            <h2 className="text-4xl font-black text-[#1e293b] mb-4">Comprehensive Healthcare Solutions</h2>
            <p className="text-slate-500 font-medium">Everything you need to run a modern, efficient healthcare facility</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2b7fff] to-[#0bc3d6] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-3">Online Appointments</h3>
              <p className="text-slate-500">Book appointments 24/7</p>
            </div>

            <div className="group relative bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all relative overflow-hidden scale-105 z-10">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2b7fff] to-[#0bc3d6] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-3">OPD Management</h3>
              <p className="text-slate-500">Complete outpatient care</p>
            </div>

            <div className="group relative bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2b7fff] to-[#0bc3d6] flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-3">IPD Management</h3>
              <p className="text-slate-500">Streamlined inpatient care</p>
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className="bg-slate-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h4 className="text-[#4259ec] font-bold tracking-widest text-sm uppercase mb-2">Key Benefits</h4>
            <h2 className="text-5xl font-black text-slate-900 mb-16">What You Gain with Queueless</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Save Time", desc: "Reduce patient waiting time by up to 70% with our intelligent scheduling.", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Reduce Costs", desc: "Cut administrative costs by 50% through automation and paperless operations.", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                { title: "Increase Revenue", desc: "Optimize resource utilization and reduce no-shows to maximize hospital potential.", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
              ].map((benefit, i) => (
                <div key={i} className="group relative bg-white p-10 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-slate-100 transition-all overflow-hidden hover:-translate-y-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2b7fff] to-[#0bc3d6] flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20 mx-auto">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d={benefit.icon} /></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{benefit.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{benefit.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
               <Link to="/comparison" className="text-[#2b7fff] font-bold hover:underline">View Detailed Comparison →</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#242b3b] pt-16 pb-6 text-slate-300 border-t border-blue-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1">
              <h2 className="text-[#3b82f6] text-3xl font-black tracking-tight mb-6">Queueless</h2>
              <p className="text-sm leading-relaxed mb-6">
                Transforming healthcare management with innovative digital solutions. Making quality healthcare accessible and convenient for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/comparison" className="hover:text-white transition-colors">Comparison</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Solutions</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Online Appointments</a></li>
                <li><a href="#" className="hover:text-white transition-colors">OPD Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IPD Management</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#374151] pt-6 text-center">
            <p className="text-sm">© {new Date().getFullYear()} Logiciel Ganymede. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
