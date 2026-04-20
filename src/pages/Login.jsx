import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setEmail('demo@queueless.in');
    setPassword('password123');
    setIsLoading(true);
    setError('');
    try {
      await login('demo@queueless.in', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Demo account not found. Please sign up first.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-3 mb-8 animate-bounce">
          <div className="w-12 h-12 bg-[#2b7fff] rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center">
             <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full"></div>
          </div>
          <span className="font-black text-4xl tracking-tighter text-slate-800">Queueless</span>
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
          {isLogin ? 'Welcome Back' : 'Join the Future'}
        </h2>
        <p className="text-slate-400 font-medium text-lg">Experience the next-gen hospital queue SaaS.</p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-[0_20px_60px_rgb(0,0,0,0.05)] border border-slate-100 rounded-[2.5rem] sm:px-12 relative overflow-hidden">
          {/* Subtle Decorative Gradient */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-bold animate-pulse">
              {error}
            </div>
          )}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#2b7fff] text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                isLogin ? 'Enter Dashboard' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="px-4 bg-white text-slate-300">Quick Access</span></div>
            </div>

            <button
              onClick={handleQuickLogin}
              disabled={isLoading}
              className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span className="text-blue-400">⚡</span> One-Click Demo Login
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
          {isLogin ? "New to Queueless? " : "Already registered? "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[#2b7fff] hover:underline transition-all"
          >
            {isLogin ? 'Create Account' : 'Sign In Instead'}
          </button>
        </p>
      </div>
    </div>
  );
}


