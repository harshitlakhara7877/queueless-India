import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="font-extrabold text-2xl tracking-tight text-[#2b7fff]">Queueless</Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">Home</Link>
          <Link to="/comparison" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">Comparison</Link>
          <Link to="/contact" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors">Contact</Link>
          <Link to="/login" className="px-5 py-2.5 bg-[#2b7fff] text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all">Login</Link>
        </nav>
      </div>
    </header>
  );
}
