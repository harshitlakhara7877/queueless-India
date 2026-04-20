import { useState, useEffect, createContext, useContext, useCallback, useMemo } from "react";
import { auth } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged
} from "firebase/auth";



// ─── UTILS ────────────────────────────────────────────────────────────────────

function calculateWaitTime(tokens, tokenId, avgServiceTime = 5) {
  const token = tokens.find((t) => t.id === tokenId);
  if (!token) return { tokensAhead: 0, waitTime: 0 };
  const tokensAhead = tokens.filter(
    (t) =>
      t.hospital.id === token.hospital.id &&
      t.service === token.service &&
      t.status === "waiting" &&
      t.serialNumber < token.serialNumber
  ).length;
  return { tokensAhead, waitTime: tokensAhead * avgServiceTime };
}

function groupByHour(tokens) {
  const hours = {};
  tokens.forEach((t) => {
    const h = new Date(t.createdAt).getHours();
    hours[h] = (hours[h] || 0) + 1;
  });
  return hours;
}

// ─── UNIQUE UNSPLASH IMAGES ───────────────────────────────────────────────────
const IMG_IDS = [
  "1519494026892-80bbd2d6fd0d","1538108149393-fbbd81895907","1551601651-2a8555f1a136",
  "1586773860418-d37222d8fce3","1516549655169-df83a0774514","1576091160399-112ba8d25d1d",
  "1579684385127-1ef15d508118","1504439468489-c8920d796a29","1530026405186-ed1f139313f3",
  "1571019613454-1cb2f99b2d8b","1559757148-5c350d0d3c56","1576091160550-2173dba999ef",
  "1527613426441-4da17471b66d","1581594693702-fbdc51b2763b","1588776814546-1ffbb3e0bc88",
  "1607619056574-7b8d3ee536b2","1599045118108-bf9954418b76","1585421514738-01798e348b17",
  "1582719478250-c89cae4dc85b","1631217868264-e5b90bb7e133","1629909613654-28e377c37b09",
  "1618498082410-b4aa22193b38","1628348068343-c6a848d2b6dd","1578496479914-7ef3b0af6f65",
  "1619451427882-6aefd6d1a4c6","1622253692010-333f2da6031d","1585803106484-7e9f2f9f4cdc",
  "1629909615184-74f495363b67","1576765608535-5f04d1e3f289","1532938911079-1b06ac7ceec7",
  "1624727828489-a1e03b79bba8","1576086213369-97a306d36557","1612349317150-e413f6a5b16d",
  "1606206887014-4e28f24db0e8","1555992643-a02f70ec7b63","1603398938378-e54eab446dde",
  "1638202993928-7267aad84c31","1603398998456-4d1fd9e0b1f0","1571019614242-c5c5dee9f50b",
  "1516762689617-e1cffcef479d","1600679472229-56dde3853825","1622579790327-b0f81c41d94c",
  "1624733553-7e27c1c10ece","1574873767668-2b6f81e45a5a","1631217868226-4b082dde3e6e",
  "1618498082443-0e1083d0f23c","1578496481449-cf2e845cc00c","1578496481122-5d3a15e5c1bb",
  "1631563019676-dade0dbdb3de","1631563019714-694de75f5af2","1631563019796-46e6ef44d47a",
  "1571019612259-0bcba1f08c07","1629909615216-d01d1ca3aaff","1578496480240-32d3e0c04525",
  "1666214277657-e0c2b8e3d7b0","1666214277571-7b74e8afcfe8","1666214277720-b61dd3b37a30",
  "1666214277737-bcc0c50f8a34","1666214277719-c5d9e6e4fc9c",
];

let _imgIdx = 0;
function nextImg() {
  const id = IMG_IDS[_imgIdx % IMG_IDS.length];
  _imgIdx++;
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=400&h=200&q=70`;
}

const GRAD_BG = [
  "from-blue-500 to-indigo-600","from-violet-500 to-purple-600","from-emerald-500 to-teal-600",
  "from-orange-500 to-amber-600","from-rose-500 to-pink-600","from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-pink-600","from-lime-500 to-green-600","from-yellow-500 to-orange-600",
  "from-sky-500 to-cyan-600",
];

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const CITIES = [
  { value: "",           label: "— Select a city —" },
  { value: "Delhi",      label: "🏛  Delhi" },
  { value: "Mumbai",     label: "🌊  Mumbai" },
  { value: "Bangalore",  label: "🌿  Bangalore" },
  { value: "Chennai",    label: "🌞  Chennai" },
  { value: "Hyderabad",  label: "💎  Hyderabad" },
  { value: "Kolkata",    label: "🎨  Kolkata" },
];

const HOSPITALS_BY_CITY = {
  Delhi: [
    { id:"d1",  name:"AIIMS Delhi",                    rating:4.9, image:nextImg(), services:["OPD","Emergency","Cardiology","Orthopedic","Neurology"] },
    { id:"d2",  name:"Safdarjung Hospital",             rating:4.5, image:nextImg(), services:["OPD","Emergency","Dermatology","Pediatrics"] },
    { id:"d3",  name:"Ram Manohar Lohia Hospital",      rating:4.3, image:nextImg(), services:["OPD","Orthopedic","Cardiology"] },
    { id:"d4",  name:"GB Pant Hospital",                rating:4.4, image:nextImg(), services:["OPD","Cardiology","Emergency"] },
    { id:"d5",  name:"Lady Hardinge Medical College",   rating:4.2, image:nextImg(), services:["OPD","Gynecology","Pediatrics"] },
    { id:"d6",  name:"Lok Nayak Hospital",              rating:4.1, image:nextImg(), services:["OPD","Emergency","Dermatology"] },
    { id:"d7",  name:"Deen Dayal Upadhyay Hospital",   rating:4.0, image:nextImg(), services:["OPD","Orthopedic","Neurology"] },
    { id:"d8",  name:"Sanjay Gandhi Memorial Hospital", rating:4.2, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"d9",  name:"Bhagwan Mahavir Hospital",        rating:4.3, image:nextImg(), services:["OPD","Dermatology","Pediatrics"] },
    { id:"d10", name:"Guru Teg Bahadur Hospital",       rating:4.5, image:nextImg(), services:["OPD","Emergency","Neurology","Orthopedic"] },
  ],
  Mumbai: [
    { id:"m1",  name:"KEM Hospital",                        rating:4.8, image:nextImg(), services:["OPD","Emergency","Cardiology","Neurology"] },
    { id:"m2",  name:"Tata Memorial Hospital",              rating:4.9, image:nextImg(), services:["OPD","Oncology","Emergency"] },
    { id:"m3",  name:"Nair Hospital",                       rating:4.4, image:nextImg(), services:["OPD","Dermatology","Orthopedic"] },
    { id:"m4",  name:"Hinduja Hospital",                    rating:4.7, image:nextImg(), services:["OPD","Cardiology","Neurology","Pediatrics"] },
    { id:"m5",  name:"Jaslok Hospital",                     rating:4.6, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"m6",  name:"Lilavati Hospital",                   rating:4.7, image:nextImg(), services:["OPD","Orthopedic","Gynecology"] },
    { id:"m7",  name:"Breach Candy Hospital",               rating:4.5, image:nextImg(), services:["OPD","Emergency","Dermatology"] },
    { id:"m8",  name:"Kokilaben Dhirubhai Ambani Hospital", rating:4.8, image:nextImg(), services:["OPD","Cardiology","Neurology","Orthopedic"] },
    { id:"m9",  name:"Bombay Hospital",                     rating:4.4, image:nextImg(), services:["OPD","Pediatrics","Emergency"] },
    { id:"m10", name:"Jupiter Hospital",                    rating:4.3, image:nextImg(), services:["OPD","Orthopedic","Cardiology"] },
  ],
  Bangalore: [
    { id:"b1",  name:"NIMHANS",                             rating:4.8, image:nextImg(), services:["OPD","Neurology","Psychiatry"] },
    { id:"b2",  name:"Victoria Hospital",                   rating:4.4, image:nextImg(), services:["OPD","Emergency","Orthopedic"] },
    { id:"b3",  name:"Manipal Hospital",                    rating:4.7, image:nextImg(), services:["OPD","Cardiology","Oncology","Neurology"] },
    { id:"b4",  name:"Narayana Health",                     rating:4.8, image:nextImg(), services:["OPD","Cardiology","Emergency"] },
    { id:"b5",  name:"Fortis Hospital Bangalore",           rating:4.6, image:nextImg(), services:["OPD","Orthopedic","Dermatology"] },
    { id:"b6",  name:"Apollo Hospital Bangalore",           rating:4.7, image:nextImg(), services:["OPD","Cardiology","Pediatrics"] },
    { id:"b7",  name:"Columbia Asia Hospital",              rating:4.5, image:nextImg(), services:["OPD","Emergency","Gynecology"] },
    { id:"b8",  name:"Sakra World Hospital",                rating:4.6, image:nextImg(), services:["OPD","Neurology","Orthopedic"] },
    { id:"b9",  name:"BGS Gleneagles Hospital",             rating:4.4, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"b10", name:"St. John's Medical College Hospital", rating:4.5, image:nextImg(), services:["OPD","Pediatrics","Dermatology"] },
  ],
  Chennai: [
    { id:"c1",  name:"Apollo Hospitals Chennai",          rating:4.8, image:nextImg(), services:["OPD","Cardiology","Neurology"] },
    { id:"c2",  name:"MIOT International",                rating:4.7, image:nextImg(), services:["OPD","Orthopedic","Emergency"] },
    { id:"c3",  name:"Fortis Malar Hospital",             rating:4.5, image:nextImg(), services:["OPD","Cardiology","Pediatrics"] },
    { id:"c4",  name:"Government General Hospital",       rating:4.3, image:nextImg(), services:["OPD","Emergency","Dermatology"] },
    { id:"c5",  name:"Vijaya Hospital",                   rating:4.4, image:nextImg(), services:["OPD","Gynecology","Neurology"] },
    { id:"c6",  name:"Kauvery Hospital",                  rating:4.6, image:nextImg(), services:["OPD","Cardiology","Emergency"] },
    { id:"c7",  name:"Gleneagles Global Health City",     rating:4.7, image:nextImg(), services:["OPD","Orthopedic","Oncology"] },
    { id:"c8",  name:"SRM Institutes of Medical Science", rating:4.5, image:nextImg(), services:["OPD","Dermatology","Pediatrics"] },
    { id:"c9",  name:"Meenakshi Mission Hospital",        rating:4.4, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"c10", name:"Sri Ramachandra Medical Centre",    rating:4.6, image:nextImg(), services:["OPD","Neurology","Orthopedic"] },
  ],
  Hyderabad: [
    { id:"h1",  name:"Yashoda Hospitals",                    rating:4.7, image:nextImg(), services:["OPD","Cardiology","Emergency"] },
    { id:"h2",  name:"Care Hospitals",                       rating:4.6, image:nextImg(), services:["OPD","Orthopedic","Neurology"] },
    { id:"h3",  name:"KIMS Hospital",                        rating:4.5, image:nextImg(), services:["OPD","Cardiology","Pediatrics"] },
    { id:"h4",  name:"Nizam's Institute of Medical Sciences",rating:4.8, image:nextImg(), services:["OPD","Emergency","Oncology"] },
    { id:"h5",  name:"Star Hospital",                        rating:4.4, image:nextImg(), services:["OPD","Dermatology","Gynecology"] },
    { id:"h6",  name:"Gleneagles Global Hospitals Hyd",      rating:4.6, image:nextImg(), services:["OPD","Cardiology","Neurology"] },
    { id:"h7",  name:"Basavatarakam Cancer Hospital",        rating:4.7, image:nextImg(), services:["OPD","Oncology","Emergency"] },
    { id:"h8",  name:"Medicover Hospitals",                  rating:4.4, image:nextImg(), services:["OPD","Orthopedic","Pediatrics"] },
    { id:"h9",  name:"Sunshine Hospital",                    rating:4.5, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"h10", name:"Apollo DRDO Hospital",                 rating:4.5, image:nextImg(), services:["OPD","Dermatology","Neurology"] },
  ],
  Kolkata: [
    { id:"k1",  name:"SSKM Hospital",                 rating:4.5, image:nextImg(), services:["OPD","Emergency","Cardiology"] },
    { id:"k2",  name:"Fortis Hospital Kolkata",       rating:4.6, image:nextImg(), services:["OPD","Orthopedic","Neurology"] },
    { id:"k3",  name:"Apollo Gleneagles Hospital",    rating:4.7, image:nextImg(), services:["OPD","Cardiology","Pediatrics"] },
    { id:"k4",  name:"Medica Superspecialty Hospital",rating:4.5, image:nextImg(), services:["OPD","Emergency","Oncology"] },
    { id:"k5",  name:"RG Kar Medical College",        rating:4.3, image:nextImg(), services:["OPD","Dermatology","Gynecology"] },
    { id:"k6",  name:"Woodland Hospital",             rating:4.4, image:nextImg(), services:["OPD","Cardiology","Neurology"] },
    { id:"k7",  name:"Belle Vue Clinic",              rating:4.6, image:nextImg(), services:["OPD","Orthopedic","Emergency"] },
    { id:"k8",  name:"CMRI Hospital",                 rating:4.5, image:nextImg(), services:["OPD","Pediatrics","Cardiology"] },
    { id:"k9",  name:"Peerless Hospital",             rating:4.4, image:nextImg(), services:["OPD","Emergency","Dermatology"] },
    { id:"k10", name:"AMRI Hospitals",                rating:4.5, image:nextImg(), services:["OPD","Neurology","Orthopedic"] },
  ],
};

const SERIAL_COUNTERS = {};
function nextSerial(hospitalId, service) {
  const key = `${hospitalId}_${service}`;
  SERIAL_COUNTERS[key] = (SERIAL_COUNTERS[key] || 0) + 1;
  return SERIAL_COUNTERS[key];
}

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          uid: firebaseUser.uid
        });
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return !!result.user;
  };

  const signup = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return !!result.user;
  };



  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, authLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


function useAuth() { return useContext(AuthContext); }

// ─── QUEUE CONTEXT ────────────────────────────────────────────────────────────

const QueueContext = createContext(null);

function QueueProvider({ children }) {
  const [tokens, setTokens] = useState([]);
  const [lastCreatedId, setLastCreatedId] = useState(null);

  const createToken = useCallback(({ hospital, service, location }) => {
    const serialNumber = nextSerial(hospital.id, service);
    const token = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      serialNumber,
      hospital,
      service,
      location,
      status: "waiting",
      createdAt: new Date().toISOString(),
    };
    setTokens((prev) => [...prev, token]);
    setLastCreatedId(token.id);
    return token;
  }, []);

  const updateTokenStatus = useCallback((id, status) => {
    setTokens((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  }, []);

  const deleteToken = useCallback((id) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const activeTokens    = tokens.filter((t) => t.status === "waiting");
  const completedTokens = tokens.filter((t) => t.status !== "waiting");

  return (
    <QueueContext.Provider value={{ tokens, activeTokens, completedTokens, lastCreatedId, createToken, updateTokenStatus, deleteToken }}>
      {children}
    </QueueContext.Provider>
  );
}
function useQueue() { return useContext(QueueContext); }

// ─── SHARED UI ────────────────────────────────────────────────────────────────

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

function Spinner({ cls = "w-4 h-4" }) {
  return (
    <svg className={`animate-spin ${cls}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

function BackBtn({ onClick, label }) {
  return (
    <button onClick={onClick} className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors font-medium">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
      </svg>
      {label}
    </button>
  );
}

function Navbar({ page, setPage }) {
  const { user, logout } = useAuth();
  const { activeTokens } = useQueue();
  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      <button onClick={() => setPage(user ? "dashboard" : "login")} className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
          </svg>
        </div>
        <span className="font-bold text-gray-900">QueueLess</span>
        <span className="text-xs text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">India</span>
      </button>
      {user && (
        <div className="flex items-center gap-1">
          {[
            { id:"dashboard", label:"Dashboard", badge: activeTokens.length || null },
            { id:"book",      label:"Book Token" },
            { id:"analytics", label:"Analytics" },
          ].map(({ id, label, badge }) => (
            <button key={id} onClick={() => setPage(id)}
              className={`relative text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${page === id ? "bg-blue-50 text-blue-600" : "text-gray-500 hover:text-gray-900"}`}>
              {label}
              {badge ? <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span> : null}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-1"/>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-red-500 transition-colors font-medium">Logout</button>
        </div>
      )}
    </nav>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────

function AuthPage({ setPage }) {
  const { login, signup, authLoading } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [firebaseError, setFirebaseError] = useState("");

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Minimum 6 characters";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setFirebaseError("");
    
    try {
      const ok = mode === "login" ? await login(email, password) : await signup(email, password);
      if (ok) {
        setPage("dashboard");
      } else {
        setFirebaseError("Authentication failed. Please check your credentials or sign up.");
      }
    } catch (err) {
      setFirebaseError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">QueueLess India</h1>
          <p className="text-gray-500 mt-1 text-sm">Skip the queue, save your time</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 p-8 border border-gray-100">
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {["login","signup"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setErrors({}); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-200 ${mode === m ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>
          {firebaseError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-bold animate-pulse text-center">
              {firebaseError}
            </div>
          )}
          <div className="space-y-4">
            {[
              { label:"Email address", type:"email",    val:email,    set:setEmail,    err:errors.email,    ph:"you@example.com" },
              { label:"Password",      type:"password", val:password, set:setPassword, err:errors.password, ph:"••••••••" },
            ].map(({ label, type, val, set, err, ph }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${err ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}/>
                {err && <p className="text-red-500 text-xs mt-1">{err}</p>}
              </div>
            ))}
            <button onClick={handleSubmit} disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 mt-2">
              {authLoading ? <><Spinner/> Processing…</> : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




// ─── SMART ALERT (Global) ──────────────────────────────────────────────────────

function SmartAlert({ token, tokens }) {
  if (!token) return null;
  const { waitTime } = calculateWaitTime(tokens, token.id);
  
  let cfg;
  if (waitTime > 30)       cfg = { msg:"You can wait — no need to rush. Head over when ready.",      color:"bg-blue-50 border-blue-200 text-blue-700",   icon:"🕐" };
  else if (waitTime >= 10) cfg = { msg:"Get ready! Your turn is approaching. Start heading over.",   color:"bg-amber-50 border-amber-200 text-amber-700", icon:"⚡" };
  else                     cfg = { msg:"Leave now! Your turn is very soon.",                          color:"bg-red-50 border-red-200 text-red-700",       icon:"🚨" };
  
  return (
    <div className={`mb-6 p-5 rounded-2xl border-2 animate-fade-in ${cfg.color}`}>
      <div className="flex items-start gap-4">
        <span className="text-2xl">{cfg.icon}</span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Priority Update: {token.hospital.name}</p>
          <p className="font-bold text-base leading-tight">{cfg.msg}</p>
          <div className="mt-2 flex gap-3">
             <span className="bg-white/40 px-2 py-0.5 rounded-lg text-[10px] font-bold">Station: {token.service}</span>
             <span className="bg-white/40 px-2 py-0.5 rounded-lg text-[10px] font-bold">Wait: {waitTime}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TOKEN CARD ───────────────────────────────────────────────────────────────

function TokenCard({ token, tokens, onMarkDone, onDelete, isNew }) {
  const [marking, setMarking] = useState(false);
  const [exiting, setExiting] = useState(false);
  const isDone = token.status === "completed";
  const waitInfo = !isDone ? calculateWaitTime(tokens, token.id) : null;

  const handleMarkDone = async () => {
    setMarking(true);
    await new Promise((r) => setTimeout(r, 700));
    setExiting(true);
    await new Promise((r) => setTimeout(r, 380));
    onMarkDone(token.id);
  };

  const handleDelete = async () => {
    setExiting(true);
    await new Promise((r) => setTimeout(r, 350));
    onDelete(token.id);
  };

  const badge = isDone
    ? { label:"Completed", cls:"bg-emerald-100 text-emerald-700" }
    : { label:"Waiting",   cls:"bg-blue-100 text-blue-700" };

  return (
    <div style={{ transition:"all 0.38s ease" }}
      className={`bg-white rounded-2xl border-2 shadow-sm overflow-hidden
        ${exiting ? "opacity-0 scale-95 -translate-y-1" : "opacity-100 scale-100"}
        ${isNew && !isDone ? "border-blue-400 shadow-blue-100" : isDone ? "border-gray-100" : "border-gray-100 hover:border-blue-200 hover:shadow-md"}`}>

      <div className={`px-5 pt-5 pb-4 ${isDone ? "bg-gray-50/60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-14 h-14 shrink-0 rounded-xl flex flex-col items-center justify-center leading-none
              ${isDone ? "bg-emerald-100 text-emerald-600" : "bg-blue-600 text-white shadow-lg shadow-blue-200"}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">No.</span>
              <span className="text-2xl font-black">{token.serialNumber}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{token.hospital.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{token.location} · {token.service}</p>
              <div className="mt-1.5"><StarRating rating={token.hospital.rating}/></div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
            <button onClick={handleDelete}
              className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {!isDone && waitInfo && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Ahead</p>
              <p className="text-2xl font-black text-gray-800">{waitInfo.tokensAhead}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Wait</p>
              <p className="text-2xl font-black text-emerald-600">{waitInfo.waitTime}<span className="text-xs font-medium text-gray-400 ml-0.5">m</span></p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-0.5">Booked</p>
              <p className="text-xs font-bold text-gray-700 mt-1">{new Date(token.createdAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
            </div>
          </div>
        </div>
      )}

      {isDone && (
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
            <span className="text-sm font-semibold">Appointment completed</span>
          </div>
        </div>
      )}

      {!isDone && (
        <div className="px-5 pb-5">
          <button onClick={handleMarkDone} disabled={marking}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-emerald-400 text-emerald-600 font-semibold text-sm hover:bg-emerald-50 active:scale-95 transition-all disabled:opacity-60">
            {marking
              ? <><Spinner/> Marking done…</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Mark as Done</>}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function Dashboard({ setPage }) {
  const { user } = useAuth();
  const { tokens, activeTokens, completedTokens, lastCreatedId, updateTokenStatus, deleteToken } = useQueue();
  const [showCompleted, setShowCompleted] = useState(false);

  // Find "Up Next" token
  const upNextToken = useMemo(() => {
    if (activeTokens.length === 0) return null;
    return [...activeTokens].sort((a, b) => {
      const waitA = calculateWaitTime(tokens, a.id).waitTime;
      const waitB = calculateWaitTime(tokens, b.id).waitTime;
      return waitA - waitB;
    })[0];
  }, [activeTokens, tokens]);

  const avgWait = activeTokens.length > 0
    ? Math.round(activeTokens.reduce((s, t) => s + calculateWaitTime(tokens, t.id).waitTime, 0) / activeTokens.length)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome, {user?.name} 👋</h1>
            <p className="text-gray-500 mt-1 text-sm">Real-time clinical queue management</p>
          </div>
          <button onClick={() => setPage("book")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
            Book Token
          </button>
        </div>

        {tokens.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-8">
             <div className="bg-blue-50/50 rounded-2xl border-2 border-blue-50 p-6 text-center">
                <p className="text-4xl font-black text-blue-600">{activeTokens.length}</p>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mt-1">Active</p>
             </div>
             <div className="bg-gray-50 rounded-2xl border-2 border-gray-100 p-6 text-center">
                <p className="text-4xl font-black text-gray-900">{avgWait}m</p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Avg Wait</p>
             </div>
          </div>
        )}

        <SmartAlert token={upNextToken} tokens={tokens}/>

        {activeTokens.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-gray-700 text-xs uppercase tracking-widest mb-4 ml-2">Active Tickets</h2>
            <div className="space-y-4">
              {activeTokens.map((t) => (
                <TokenCard key={t.id} token={t} tokens={tokens} isNew={t.id === lastCreatedId}
                  onMarkDone={(id) => updateTokenStatus(id,"completed")} onDelete={deleteToken}/>
              ))}
            </div>
          </div>
        )}

        {tokens.length === 0 && (
          <div className="bg-blue-50/20 rounded-3xl border-2 border-blue-50 border-dashed p-16 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No active sessions</h3>
            <p className="text-gray-500 text-sm mb-8">Schedule an appointment to join the queue</p>
            <button onClick={() => setPage("book")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-100">
              Get Started
            </button>
          </div>
        )}

        {completedTokens.length > 0 && (
          <div>
            <button onClick={() => setShowCompleted((v) => !v)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors mb-3">
              <svg className={`w-4 h-4 transition-transform duration-200 ${showCompleted ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
              Archive ({completedTokens.length})
            </button>
            {showCompleted && (
              <div className="space-y-3">
                {completedTokens.map((t) => (
                  <TokenCard key={t.id} token={t} tokens={tokens} isNew={false}
                    onMarkDone={(id) => updateTokenStatus(id,"completed")} onDelete={deleteToken}/>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BOOK TOKEN — SLIDE WIZARD ────────────────────────────────────────────────

const STEP_LABELS = ["Zone","Facility","Service","Issue"];

function BookToken({ setPage }) {
  const { createToken } = useQueue();
  const [step, setStep]                 = useState(1);
  const [selectedLocation, setLocation] = useState("");
  const [hospitals, setHospitals]       = useState([]);
  const [loadingHospitals, setLoading]  = useState(false);
  const [selectedHospital, setHospital] = useState(null);
  const [selectedService, setService]   = useState("");
  const [generating, setGenerating]     = useState(false);
  const [imgErrors, setImgErrors]       = useState({});
  const [slideDir, setSlideDir]         = useState("right");
  const [animKey, setAnimKey]           = useState(0);

  const goTo = (s, dir = "right") => {
    setSlideDir(dir);
    setAnimKey((k) => k + 1);
    setStep(s);
  };

  const fetchHospitals = async (city) => {
    setLoading(true);
    setHospitals([]);
    setHospital(null);
    setService("");
    await new Promise((r) => setTimeout(r, 550));
    setHospitals(HOSPITALS_BY_CITY[city] || []);
    setLoading(false);
  };

  const handleCitySelect = (city) => {
    if (!city) return;
    setLocation(city);
    fetchHospitals(city);
    goTo(2, "right");
  };

  const handleHospitalSelect = (h) => {
    setHospital(h);
    setService("");
    goTo(3, "right");
  };

  const handleServiceSelect = (s) => {
    setService(s);
    goTo(4, "right");
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    createToken({ hospital: selectedHospital, service: selectedService, location: selectedLocation });
    setGenerating(false);
    setPage("dashboard");
  };

  const handleImgError = (id) => setImgErrors((p) => ({ ...p, [id]: true }));

  const animClass = `animate-slide-${slideDir}`;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes slideInRight { from { opacity:0; transform:translateX(30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInLeft  { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        .animate-slide-right { animation: slideInRight 0.4s ease-out both; }
        .animate-slide-left  { animation: slideInLeft  0.4s ease-out both; }
      `}</style>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Generate Token</h1>
          <p className="text-gray-500 mt-1 text-sm">Follow the clinical sequence to join the queue</p>
        </div>

        <div className="flex items-center mb-12 max-w-xl mx-auto">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-500
                  ${step > i+1 ? "bg-emerald-500 text-white"
                    : step === i+1 ? "bg-blue-600 text-white shadow-xl shadow-blue-100 scale-110"
                    : "bg-blue-50 text-blue-200"}`}>
                  {step > i+1 ? "✓" : i+1}
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase tracking-widest transition-colors
                  ${step === i+1 ? "text-blue-600" : "text-gray-300"}`}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 px-2">
                   <div className={`h-0.5 rounded-full transition-all duration-700 ${step > i+1 ? "bg-emerald-400" : "bg-blue-50"}`}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div key={`step1-${animKey}`} className={`bg-white rounded-[2rem] border-2 border-blue-50 p-10 text-center ${animClass}`}>
            <h2 className="font-bold text-gray-800 mb-6">Select a region</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               {CITIES.filter(c => c.value).map(c => (
                 <button key={c.value} onClick={() => handleCitySelect(c.value)}
                   className="bg-blue-50/40 hover:bg-white hover:border-blue-600 hover:shadow-lg border-2 border-transparent p-6 rounded-2xl transition-all group">
                   <span className="text-3xl block mb-2">{c.label.split('  ')[0]}</span>
                   <span className="font-bold text-gray-900 group-hover:text-blue-600">{c.label.split('  ')[1]}</span>
                 </button>
               ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div key={`step2-${animKey}`} className={animClass}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-800">Facilities in {selectedLocation}</h2>
              <BackBtn onClick={() => goTo(1,"left")} label="Change zone"/>
            </div>
            {loadingHospitals ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
                {[...Array(8)].map((_,i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl"/>)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {hospitals.map((h, idx) => (
                  <button key={h.id} onClick={() => handleHospitalSelect(h)}
                    className="group bg-white border-2 border-blue-50 hover:border-blue-600 rounded-2xl overflow-hidden transition-all text-left">
                    <div className="h-28 bg-gray-100 relative">
                      {!imgErrors[h.id] ? <img src={h.image} alt={h.name} onError={() => handleImgError(h.id)} className="w-full h-full object-cover"/> : <div className={`w-full h-full bg-gradient-to-br ${GRAD_BG[idx%10]} opacity-30`}/>}
                      <div className="absolute top-2 right-2 bg-white/90 px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-gray-800 shadow-sm">⭐ {h.rating}</div>
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-800 text-xs leading-tight line-clamp-2">{h.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && selectedHospital && (
          <div key={`step3-${animKey}`} className={`max-w-xl mx-auto ${animClass}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-gray-800">Select clinical service</h2>
              <BackBtn onClick={() => goTo(2,"left")} label="Change facility"/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedHospital.services.map((s) => (
                <button key={s} onClick={() => handleServiceSelect(s)}
                  className={`p-5 rounded-2xl border-2 transition-all font-bold text-sm text-left
                    ${selectedService === s ? "border-blue-600 bg-blue-600 text-white shadow-xl shadow-blue-100" : "border-blue-50 bg-blue-50/50 hover:border-blue-200"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && selectedHospital && selectedService && (
          <div key={`step4-${animKey}`} className={`max-w-md mx-auto ${animClass}`}>
            <div className="bg-white rounded-[2.5rem] border-2 border-blue-50 p-10 shadow-2xl shadow-blue-50">
               <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
               </div>
               <h2 className="text-2xl font-bold text-center text-gray-900 mb-8 tracking-tight">Ready to issue token?</h2>
               <div className="space-y-4 mb-10">
                  {[
                    { l:"Facility", v:selectedHospital.name },
                    { l:"Service",  v:selectedService },
                    { l:"Zone",     v:selectedLocation },
                  ].map(x => (
                    <div key={x.l} className="flex justify-between items-center border-b border-blue-50 pb-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{x.l}</span>
                      <span className="font-bold text-gray-900 text-sm">{x.v}</span>
                    </div>
                  ))}
               </div>
               <button onClick={handleGenerate} disabled={generating}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95">
                {generating ? "Issuing..." : "Confirm & Issue Token"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────

function Analytics() {
  const { tokens, activeTokens, completedTokens } = useQueue();
  const grouped   = groupByHour(tokens);
  const maxCount  = Math.max(1, ...Object.values(grouped));
  const hours     = Array.from({ length: 24 }, (_, i) => i);
  const peakHour  = Object.entries(grouped).sort((a,b) => b[1]-a[1])[0];
  const fmtH      = (h) => { const n=parseInt(h); return n===0?"12AM":n<12?`${n}AM`:n===12?"12PM":`${n-12}PM`; };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">System Intelligence</h1>
        <div className="grid grid-cols-3 gap-4 mb-10">
           <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-50 text-center">
              <p className="text-4xl font-black text-blue-600">{tokens.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Volume</p>
           </div>
           <div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-50 text-center">
              <p className="text-4xl font-black text-emerald-600">{completedTokens.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Processed</p>
           </div>
           <div className="bg-amber-50/50 rounded-2xl p-8 border border-amber-50 text-center">
              <p className="text-4xl font-black text-amber-600">{activeTokens.length}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">In Queue</p>
           </div>
        </div>
        {peakHour && (
          <div className="bg-blue-600 rounded-[2rem] p-10 text-white shadow-xl shadow-blue-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">Operational Insight</p>
              <h3 className="text-2xl font-bold tracking-tight">Peak flow detected at {fmtH(peakHour[0])}.</h3>
              <p className="text-blue-100 text-sm mt-2">{peakHour[1]} system initializations in this window.</p>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────

function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("login");

  useEffect(() => {
    if (user && page === "login") setPage("dashboard");
    if (!user) setPage("login");
  }, [user]);

  const renderPage = () => {
    if (!user) return <AuthPage setPage={setPage}/>;
    switch (page) {
      case "dashboard": return <Dashboard setPage={setPage}/>;
      case "book":      return <BookToken setPage={setPage}/>;
      case "analytics": return <Analytics/>;
      default:          return <Dashboard setPage={setPage}/>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar page={page} setPage={setPage}/>
      <main className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <QueueProvider>
        <AppContent/>
      </QueueProvider>
    </AuthProvider>
  );
}
