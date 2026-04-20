import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';
const INDIAN_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Ahmedabad', 'Pune', 'Hyderabad', 'Jaipur', 'Lucknow'];

const HospitalSkeleton = () => (
  <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 animate-pulse">
    <div className="h-44 bg-slate-50"></div>
    <div className="p-6 space-y-3">
      <div className="h-5 bg-slate-50 rounded w-3/4"></div>
      <div className="h-3 bg-slate-50 rounded w-1/2"></div>
    </div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const socketRef = useRef();

  // Dashboard State
  const [myTokens, setMyTokens] = useState(() => {
    const saved = localStorage.getItem('myTokens');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Wizard State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [hospitals, setHospitals] = useState([]);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence: Save tokens to localStorage
  useEffect(() => {
    localStorage.setItem('myTokens', JSON.stringify(myTokens));
  }, [myTokens]);

  // WebSocket Connection
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket Server');
      
      // Re-join rooms for all active tokens to get live updates
      myTokens.forEach(token => {
        socketRef.current.emit('joinQueue', {
          hospitalId: token.hospitalId,
          service: token.service
        });
      });
    });

    socketRef.current.on('queueUpdate', (data) => {
      // Find tokens that belong to this update and refresh them
      setMyTokens(prev => prev.map(token => {
        // We calculate position differently: if we know our token number and next serving token
        // But for this simple demo, we just update the "estimated wait" based on current queue length
        return {
          ...token,
          // In a real app, we'd calculate tokensAhead based on token.tokenNumber
          estimatedWaitTime: data.queueLength * 5,
          tokensAhead: Math.max(0, data.queueLength - 1)
        };
      }));
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  // Fetch Hospitals
  useEffect(() => {
    if (selectedLocation && currentStep === 1) {
      const fetchHospitals = async () => {
        setIsLoadingHospitals(true);
        setCurrentStep(2); 
        try {
          const response = await axios.get(`${API_BASE_URL}/hospitals?city=${selectedLocation}`);
          setHospitals(response.data.hospitals);
        } catch (error) {
          console.error("Fetch failed", error);
          setCurrentStep(1);
        } finally {
          setIsLoadingHospitals(false);
        }
      };
      fetchHospitals();
    }
  }, [selectedLocation]);

  // Join Room when hospital/service selected
  useEffect(() => {
    if (selectedHospital && selectedService) {
      socketRef.current.emit('joinQueue', {
        hospitalId: selectedHospital.id,
        service: selectedService
      });
    }
  }, [selectedHospital, selectedService]);

  const resetWizard = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setCurrentStep(1);
      setSelectedLocation('');
      setSelectedHospital(null);
      setSelectedService('');
      setHospitals([]);
    }, 300);
  };

  const handleBookToken = () => {
    if (!selectedLocation || !selectedHospital || !selectedService) return;
    setIsSubmitting(true);

    // Emit event to generate token
    socketRef.current.emit('generateToken', {
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      service: selectedService,
      location: selectedLocation
    });

    // Handle the response once
    socketRef.current.once('tokenGenerated', (token) => {
      setMyTokens(prev => [...prev, token]);
      setIsSubmitting(false);
      resetWizard();
    });
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] font-sans selection:bg-blue-100">
      
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 inset-x-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2b7fff] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 relative">
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></div>
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"></div>
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-800">Queueless</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.1em]">{currentUser?.displayName}</span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Live WebSocket
              </span>
            </div>
            <button onClick={logout} className="p-2.5 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 animate-[fadeInUp_0.6s_ease-out]">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Real-Time Tokens</h1>
            <p className="text-slate-400 font-medium text-lg mt-2">Queue progresses automatically every 30 seconds.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2b7fff] text-white px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center gap-4 active:scale-95"
          >
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
            Join Live Queue
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {myTokens.length > 0 ? (
            myTokens.map(token => (
              <div key={token.id} className="group bg-white rounded-[3rem] p-10 shadow-[0_30px_100px_rgb(0,0,0,0.02)] border border-slate-100/50 transition-all hover:shadow-2xl animate-[fadeInUp_0.5s_ease-out] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#2b7fff] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />
                
                <div className="flex flex-col sm:flex-row gap-12">
                  <div className="flex flex-col items-center">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-blue-50 text-[#2b7fff] flex flex-col items-center justify-center mb-8 border border-blue-100 shadow-inner">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40 mb-1">Token</span>
                      <span className="text-4xl font-black">{token.tokenNumber}</span>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-50 group-hover:scale-105 transition-transform duration-500">
                      <QRCodeSVG value={`${token.hospitalId}-${token.service}-${token.tokenNumber}`} size={120} level="H" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight mb-2">{token.hospitalName}</h3>
                        <p className="text-lg font-bold text-[#2b7fff] uppercase tracking-tighter">{token.service}</p>
                        <p className="text-xs text-slate-400 mt-2 font-black uppercase tracking-widest">{token.location}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ahead</p>
                        <p className="text-4xl font-black text-slate-900 transition-all">{token.tokensAhead}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Wait Time</p>
                        <p className="text-4xl font-black text-[#2b7fff] transition-all">{token.estimatedWaitTime}<span className="text-sm ml-1 font-bold">m</span></p>
                      </div>
                    </div>
                    
                    <p className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                      Booked at {new Date(token.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="lg:col-span-2 py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 group transition-all hover:border-[#2b7fff]/50">
              <div className="w-28 h-28 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-10 text-slate-200 group-hover:scale-110 transition-transform duration-500">
                <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-4xl font-black text-slate-900 tracking-tight">No Active Real-Time Tokens</h3>
              <p className="text-slate-400 mt-4 text-xl font-medium">Join a live queue and watch your position progress in real-time.</p>
              <button onClick={() => setIsModalOpen(true)} className="mt-12 bg-[#2b7fff] text-white px-12 py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-500/20">Get Started</button>
            </div>
          )}
        </div>
      </main>

      {/* Wizard Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg" onClick={() => !isSubmitting && resetWizard()}></div>
          
          <div className="relative bg-white rounded-[3.5rem] shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-[scale-in_0.4s_ease-out]">
            {/* Progress Header */}
            <div className="px-14 pt-12 pb-8 bg-white border-b border-slate-50">
              <div className="flex items-center justify-between max-w-md mx-auto relative mb-8">
                <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 rounded-full"></div>
                <div className="absolute top-1/2 left-0 h-1.5 bg-[#2b7fff] -translate-y-1/2 transition-all duration-700 rounded-full" style={{ width: `${(currentStep - 1) * 33.33}%` }}></div>
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-xs relative z-10 transition-all duration-500 ${currentStep >= s ? 'bg-[#2b7fff] text-white shadow-xl shadow-blue-500/30' : 'bg-white border-2 border-slate-100 text-slate-300'}`}>
                    {currentStep > s ? '✓' : s}
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-14 bg-slate-50/30 scrollbar-hide">
              {currentStep === 1 && (
                <div className="text-center max-w-2xl mx-auto py-16 animate-[fadeInUp_0.5s_ease-out]">
                  <h3 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">Select City</h3>
                  <p className="text-slate-500 mb-12 text-xl font-medium">Real-time hospital network in India.</p>
                  <div className="relative group">
                    <select 
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full px-12 py-7 bg-white rounded-[2.5rem] border-2 border-slate-100 focus:border-[#2b7fff] outline-none font-black text-2xl text-slate-800 shadow-2xl shadow-blue-500/5 appearance-none cursor-pointer transition-all"
                    >
                      <option value="" disabled>Browse Locations...</option>
                      {INDIAN_CITIES.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="animate-[fadeInUp_0.5s_ease-out]">
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <h3 className="text-4xl font-black text-slate-900 tracking-tight">Select Hospital</h3>
                      <p className="text-slate-400 font-bold text-lg mt-1 uppercase tracking-widest">{selectedLocation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {isLoadingHospitals ? (
                      [1, 2, 3, 4, 5, 6].map(i => <HospitalSkeleton key={i} />)
                    ) : (
                      hospitals.map(h => (
                        <div 
                          key={h.id}
                          onClick={() => { setSelectedHospital(h); setCurrentStep(3); }}
                          className="group cursor-pointer bg-white rounded-[3rem] overflow-hidden border-2 border-transparent hover:border-[#2b7fff] hover:shadow-2xl transition-all hover:-translate-y-3 flex flex-col"
                        >
                          <div className="h-56 relative overflow-hidden">
                            <img src={h.image} className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110" alt={h.name} />
                          </div>
                          <div className="p-10 bg-white flex-1">
                            <h4 className="text-2xl font-black text-slate-800 group-hover:text-[#2b7fff] transition-colors leading-tight mb-3 tracking-tight">{h.name}</h4>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="animate-[fadeInUp_0.5s_ease-out] text-center max-w-4xl mx-auto py-12">
                  <h3 className="text-3xl font-black text-slate-900 mb-10 px-6 flex items-center gap-6">Select Department <span className="h-px bg-slate-100 flex-1"></span></h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedHospital?.services.map(s => {
                      const status = selectedHospital.queueStatus?.[s] || { currentQueue: 0, estimatedWait: 0 };
                      return (
                        <button
                          key={s}
                          onClick={() => { setSelectedService(s); setCurrentStep(4); }}
                          className={`group relative p-10 rounded-[3rem] border-2 transition-all text-left overflow-hidden ${selectedService === s ? 'border-[#2b7fff] bg-blue-50/30 shadow-2xl shadow-blue-500/5 scale-[1.05]' : 'border-slate-50 bg-white hover:border-slate-200 hover:-translate-y-2'}`}
                        >
                           <p className={`font-black text-2xl mb-2 tracking-tight ${selectedService === s ? 'text-[#2b7fff]' : 'text-slate-800'}`}>{s}</p>
                           <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">Wait: {status.estimatedWait}m</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="animate-[fadeInUp_0.5s_ease-out] max-w-2xl mx-auto py-16 text-center">
                  <h3 className="text-5xl font-black text-slate-900 mb-10 tracking-tight">Join Live Queue</h3>
                  <div className="bg-white rounded-[4rem] p-12 shadow-sm border border-slate-100 text-left space-y-6 mb-16 relative">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-6">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Facility</span>
                      <span className="font-black text-slate-800 text-xl">{selectedHospital?.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Department</span>
                      <span className="font-black text-[#2b7fff] text-xl">{selectedService}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleBookToken}
                    disabled={isSubmitting}
                    className="w-full py-6 bg-[#2b7fff] text-white font-black text-xl rounded-[2.5rem] shadow-2xl shadow-blue-500/40 hover:shadow-blue-500/60 active:scale-95 transition-all disabled:opacity-40"
                  >
                    {isSubmitting ? 'Connecting...' : 'Generate Real-Time Token'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.9) translateY(50px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(60px); } 100% { opacity: 1; transform: translateY(0); } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}} />
    </div>
  );
}
