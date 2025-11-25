import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  getDoc,
  setDoc,
  where,
  serverTimestamp,
  getDocs,
  limit,
  writeBatch
} from 'firebase/firestore';
import { 
  Users, 
  MapPin, 
  Calendar, 
  MessageCircle, 
  Plus, 
  Trophy, 
  User, 
  Activity, 
  Search, 
  ArrowLeft, 
  Send,
  Star,
  Clock,
  DollarSign,
  UserPlus,
  Check,
  X,
  LogOut,
  Mail,
  Lock,
  Heart,
  Zap, 
  Share2,
  AlertCircle,
  ChevronRight,
  Info,
  ThumbsUp,
  Flag,
  Bell, 
  MessageSquare 
} from 'lucide-react';

// --- Firebase Config & Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyAIagqREwYsgG5IeAfNhL6GfmO3pOBtD50",
  authDomain: "huddle-sport.firebaseapp.com",
  projectId: "huddle-sport",
  storageBucket: "huddle-sport.firebasestorage.app",
  messagingSenderId: "919311181590",
  appId: "1:919311181590:web:9925bdf94b73327ca29237",
  measurementId: "G-1BQGNJJ92N"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);  // <--- 錯誤就是因為找不到這一行！
const db = getFirestore(app);

const appId = 'sport-match-v1';
// --- Custom Sport Icons ---
const BasketballIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M5.65 17.65l12.7-12.7M12 22V2M2 12h20M5.65 6.35l12.7 12.7" />
  </svg>
);

const BadmintonIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 21c-2-3.5-4-5-7-5-1.5 0-3 1-3 3s2 4 5 4c2 0 3.5-1 5-2z" />
    <path d="M11.5 16.5L6 22" />
    <path d="M12.5 15.5l-5-5a6 6 0 1 1 8.5 8.5l-5-5" />
    <line x1="9" y1="9" x2="16" y2="16" />
    <line x1="10" y1="7" x2="17" y2="14" />
  </svg>
);

const TennisIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10" />
  </svg>
);

const VolleyballIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 12L2.5 8" />
    <path d="M12 12l9.5-4" />
    <path d="M12 12v9.5" />
    <path d="M7 2.5l10 19" />
  </svg>
);

const SkateboardIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V12c0-1.1.9-2 2-2h16a2 2 0 0 1 2 2v2z" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
);

const SkiingIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 20h20" />
    <path d="M3 20l5-12 5 12" />
    <path d="M16 20l-3-8" />
    <circle cx="13" cy="7" r="2" />
    <path d="M15 9l2 2 3-3" />
  </svg>
);

const FishingIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 12c0-5.5 4.5-10 10-10 1.5 0 3 .3 4.5 1" />
    <path d="M12 2v4" />
    <path d="M19 19l-3-3" />
    <path d="M19 22v-3a3 3 0 0 0-3-3h-3" />
    <path d="M15.5 15.5l-3-3" />
    <path d="M6 15a6 6 0 1 0 12 0 6 6 0 1 0-12 0z" />
    <circle cx="16" cy="14" r="1" />
  </svg>
);

// --- Constants & Utils ---
const SPORTS_TYPES = [
  { id: 'basketball', name: '籃球', icon: <BasketballIcon className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600 border-orange-200' },
  { id: 'badminton', name: '羽球', icon: <BadmintonIcon className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  { id: 'tennis', name: '網球', icon: <TennisIcon className="w-5 h-5" />, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
  { id: 'volleyball', name: '排球', icon: <VolleyballIcon className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { id: 'skateboard', name: '滑板', icon: <SkateboardIcon className="w-5 h-5" />, color: 'bg-stone-50 text-stone-600 border-stone-200' },
  { id: 'skiing', name: '滑雪', icon: <SkiingIcon className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { id: 'fishing', name: '釣魚', icon: <FishingIcon className="w-5 h-5" />, color: 'bg-cyan-50 text-cyan-600 border-cyan-200' },
];

const SKILL_LEVELS = [
  { id: 'novice', name: '新手體驗', color: 'bg-green-100 text-green-700' },
  { id: 'beginner', name: '初階', color: 'bg-blue-100 text-blue-700' },
  { id: 'intermediate', name: '中階', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'advanced', name: '高階', color: 'bg-orange-100 text-orange-700' },
  { id: 'pro', name: '職業/校隊', color: 'bg-red-100 text-red-700' },
];

const REGIONS = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'];

const GENDERS = [
  { id: 'male', name: '男', color: 'border-blue-400 text-blue-600 bg-blue-50' },
  { id: 'female', name: '女', color: 'border-pink-400 text-pink-600 bg-pink-50' },
];

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getAvatarColor = (genderId) => {
    const g = GENDERS.find(x => x.id === genderId);
    return g ? g.color : 'border-gray-200 text-gray-500 bg-gray-50';
};

const YEARS = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentView, setCurrentView] = useState('home'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth error:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        setIsGuest(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
    
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      setLoading(false);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        setIsGuest(!data.displayName);
      } else {
        setIsGuest(true);
        setUserProfile(null);
      }
    }, (error) => console.error("Profile sync error", error));

    return () => unsubscribe();
  }, [user]);

  const checkAuth = () => {
    if (isGuest) {
      setCurrentView('auth_landing');
      return false;
    }
    return true;
  };

  const goHome = () => {
    setSelectedEvent(null);
    setSelectedFriend(null);
    setCurrentView('home');
  };

  const goToCreate = () => {
    if (checkAuth()) setCurrentView('create');
  };

  const goToDetail = (event) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  };

  const goToProfile = () => {
    if (checkAuth()) setCurrentView('profile');
  };
  
  const goToInbox = () => {
    if (checkAuth()) setCurrentView('inbox');
  };

  const goToDM = (friendUser) => {
    if (checkAuth()) {
      setSelectedFriend(friendUser);
      setCurrentView('dm');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50 text-slate-500">載入中...</div>;
  }

  const hasNotifications = (userProfile?.friendRequests?.length > 0) || (userProfile?.notifications?.some(n => !n.read));

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden font-sans relative text-slate-800">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md p-4 flex items-center justify-between sticky top-0 z-20 border-b border-slate-100">
        {['create', 'detail', 'profile', 'inbox', 'dm', 'auth_landing', 'login', 'register'].includes(currentView) ? (
          <button onClick={goHome} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Huddle Sport</h1>
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!isGuest ? (
            <>
              {currentView !== 'inbox' && (
                <button onClick={goToInbox} className="p-2 hover:bg-slate-100 rounded-full transition relative text-slate-600">
                  <Bell className="w-6 h-6" />
                  {hasNotifications && (
                    <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
              )}
              {currentView !== 'profile' && (
                <button onClick={goToProfile} className="ml-1 transition">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 shadow-md ${getAvatarColor(userProfile?.gender)}`}>
                    {userProfile?.displayName?.[0] || 'U'}
                  </div>
                </button>
              )}
            </>
          ) : (
             <button onClick={() => setCurrentView('auth_landing')} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-full font-bold hover:bg-indigo-700 shadow-md transition">
               登入/註冊
             </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative">
        {currentView === 'home' && <HomeView user={user} isGuest={isGuest} onEventClick={goToDetail} />}
        {currentView === 'create' && <CreateEventView user={user} userProfile={userProfile} onBack={goHome} />}
        {currentView === 'detail' && selectedEvent && <EventDetailView user={user} isGuest={isGuest} event={selectedEvent} checkAuth={checkAuth} onBack={goHome} userProfile={userProfile} />}
        {currentView === 'profile' && <ProfileView user={user} userProfile={userProfile} />}
        {currentView === 'friends' && <FriendsView user={user} userProfile={userProfile} onChat={goToDM} />}
        {currentView === 'inbox' && <InboxView user={user} userProfile={userProfile} onChat={goToDM} />}
        {currentView === 'dm' && selectedFriend && <DMChatView user={user} friend={selectedFriend} onBack={goToInbox} />}
        
        {/* Auth Views */}
        {currentView === 'auth_landing' && <AuthLandingView onLogin={() => setCurrentView('login')} onRegister={() => setCurrentView('register')} />}
        {currentView === 'register' && <RegisterView user={user} onComplete={goHome} />}
        {currentView === 'login' && <LoginView user={user} onComplete={goHome} onSwitchToRegister={() => setCurrentView('register')} />}
      </main>

      {/* Floating Action Button (Only on Home) */}
      {currentView === 'home' && !isGuest && (
        <button 
          onClick={goToCreate}
          className="absolute bottom-6 right-6 bg-slate-900 text-white p-4 rounded-2xl shadow-xl hover:bg-slate-800 transition hover:scale-105 active:scale-95 flex items-center justify-center z-10"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// --- Feature Views ---

function InboxView({ user, userProfile, onChat }) {
    const [activeTab, setActiveTab] = useState('chats'); // 'chats', 'notifications'
    const [friendsList, setFriendsList] = useState([]);

    useEffect(() => {
        if (activeTab === 'notifications' && userProfile?.notifications?.some(n => !n.read)) {
            const newNotifs = userProfile.notifications.map(n => ({...n, read: true}));
            updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { notifications: newNotifs });
        }
    }, [activeTab, userProfile, user]);

    useEffect(() => {
        if (!userProfile?.friends || userProfile.friends.length === 0) return;
        if (!user) return;
        const fetchFriends = async () => {
            const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('uid', 'in', userProfile.friends.slice(0, 10))); 
            const snap = await getDocs(q); 
            setFriendsList(snap.docs.map(d => d.data()));
        };
        fetchFriends();
    }, [userProfile, user]);

    const handleAccept = async (req) => {
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { friends: arrayUnion(req.uid), friendRequests: arrayRemove(req) });
            batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'users', req.uid), { friends: arrayUnion(user.uid) });
            batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'users', req.uid), {
                notifications: arrayUnion({
                    type: 'system',
                    text: `${userProfile.displayName} 接受了您的好友邀請`,
                    date: new Date().toISOString(),
                    read: false
                })
            });
            await batch.commit();
        } catch(e) { console.error(e); }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="flex">
                    <button onClick={() => setActiveTab('chats')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'chats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                        訊息
                    </button>
                    <button onClick={() => setActiveTab('notifications')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition flex items-center justify-center gap-2 ${activeTab === 'notifications' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
                        通知
                        {(userProfile?.friendRequests?.length > 0 || userProfile?.notifications?.some(n=>!n.read)) && <span className="w-2 h-2 bg-rose-500 rounded-full"></span>}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'chats' ? (
                    <div className="space-y-3">
                        {friendsList.length === 0 ? (
                            <div className="text-center text-slate-400 py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                                <p className="font-medium">還沒有好友，去交些新朋友吧！</p>
                            </div>
                        ) : (
                            friendsList.map(f => (
                                <div key={f.uid} onClick={() => onChat(f)} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:bg-slate-50 transition active:scale-[0.98]">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 ${getAvatarColor(f.gender)}`}>
                                        {f.displayName[0]}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-slate-800">{f.displayName}</div>
                                        <div className="text-xs text-slate-400">點擊開始聊天...</div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300"/>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {userProfile?.friendRequests?.length > 0 && (
                            <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">好友邀請</h3>
                                <div className="space-y-2">
                                    {userProfile.friendRequests.map((req, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-indigo-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">{req.name[0]}</div>
                                                <div>
                                                    <div className="font-bold text-sm text-slate-800">{req.name}</div>
                                                    <div className="text-xs text-slate-400">請求加為好友</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAccept(req)} className="p-2 bg-indigo-600 text-white rounded-xl shadow hover:bg-indigo-700"><Check className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 px-1">系統通知</h3>
                            {!userProfile?.notifications || userProfile.notifications.length === 0 ? (
                                <div className="text-center text-slate-400 py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30"/>
                                    <p className="text-sm">暫無新通知</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {userProfile.notifications.slice().reverse().map((notif, idx) => (
                                        <div key={idx} className={`flex gap-3 bg-white p-3 rounded-2xl shadow-sm border ${notif.read ? 'border-slate-100' : 'border-l-4 border-l-rose-400 border-slate-100'}`}>
                                            <div className="mt-1 min-w-[24px]">
                                                {notif.type === 'review' ? <Star className="w-5 h-5 text-yellow-400" /> : <Info className="w-5 h-5 text-indigo-400" />}
                                            </div>
                                            <div>
                                                <p className="text-sm text-slate-700 leading-snug">{notif.text}</p>
                                                <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.date).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function HomeView({ user, isGuest, onEventClick }) {
  const [events, setEvents] = useState([]);
  const [filterSport, setFilterSport] = useState('all');
  const [showMyHosted, setShowMyHosted] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = collection(db, 'artifacts', appId, 'public', 'data', 'events');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let loadedEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      loadedEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
      setEvents(loadedEvents);
    }, (error) => console.error("Events fetch error", error));
    return () => unsubscribe();
  }, [user]);

  const filteredEvents = events.filter(e => {
    if (filterSport !== 'all' && e.sport !== filterSport) return false;
    if (showMyHosted && e.hostId !== user?.uid) return false;
    return true;
  });

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
            <h2 className="text-xl font-bold text-slate-800">探索活動</h2>
            {!isGuest && (
              <button 
                onClick={() => setShowMyHosted(!showMyHosted)}
                className={`text-xs px-3 py-1.5 rounded-full border transition flex items-center gap-1.5 font-medium ${
                  showMyHosted ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                {showMyHosted ? '顯示全部' : '我發起的'}
              </button>
            )}
        </div>
        
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide px-1">
          <button 
            onClick={() => setFilterSport('all')}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition shadow-sm ${filterSport === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
          >
            全部
          </button>
          {SPORTS_TYPES.map(sport => (
            <button 
              key={sport.id}
              onClick={() => setFilterSport(sport.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center gap-2 transition shadow-sm ${filterSport === sport.id ? 'bg-indigo-600 text-white border-transparent' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
              {sport.icon}
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200 mx-1">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <p className="font-medium">{showMyHosted ? '您還沒有發起任何活動' : '目前沒有相關活動'}</p>
            {!isGuest && <p className="text-sm mt-1">點擊右下角 "+" 發起一個吧！</p>}
          </div>
        ) : (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} onClick={() => onEventClick(event)} />
          ))
        )}
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const sportInfo = SPORTS_TYPES.find(s => s.id === event.sport) || SPORTS_TYPES[0];
  const currentCount = event.participants?.length || 0;
  const isFull = currentCount >= event.maxPlayers;
  const isEnded = event.status === 'ended';

  return (
    <div onClick={onClick} className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-md border border-slate-100 transition-all duration-200 cursor-pointer active:scale-[0.98] mx-1">
      <div className="flex justify-between items-start mb-3">
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${sportInfo.color}`}>
          {sportInfo.icon}
          {sportInfo.name}
        </div>
        <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            isEnded ? 'bg-slate-100 text-slate-500' :
            isFull ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {isEnded ? '已結束' : isFull ? '已額滿' : `缺 ${event.maxPlayers - currentCount} 人`}
        </div>
      </div>
      
      <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{event.title}</h3>
      
      <div className="space-y-2 text-sm text-slate-500 mb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span>{new Date(event.date).toLocaleDateString()} <span className="mx-1 text-slate-300">|</span> {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className="truncate">{event.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="flex -space-x-2">
          {event.participants?.slice(0, 4).map((p, i) => (
             <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold ${getAvatarColor(p.gender)}`}>
               {p.displayName ? p.displayName[0] : '?'}
             </div>
          ))}
          {currentCount > 4 && (
            <div className="w-8 h-8 rounded-full bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] text-slate-400 font-medium">
              +{currentCount - 4}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>主辦: {event.hostName}</span>
        </div>
      </div>
    </div>
  );
}

function FriendsView({ user, userProfile, onChat }) {
    const [friendsList, setFriendsList] = useState([]);
    useEffect(() => {
        if (!userProfile?.friends || userProfile.friends.length === 0) return;
        if (!user) return;
        const fetchFriends = async () => {
            const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('uid', 'in', userProfile.friends.slice(0, 10))); 
            const snap = await getDocs(q); setFriendsList(snap.docs.map(d => d.data()));
        };
        fetchFriends();
    }, [userProfile, user]);
    const handleAccept = async (req) => {
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { friends: arrayUnion(req.uid), friendRequests: arrayRemove(req) });
            batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'users', req.uid), { friends: arrayUnion(user.uid) });
            await batch.commit();
        } catch(e) { console.error(e); }
    };

    return (
        <div className="p-4 space-y-6">
            {userProfile?.friendRequests?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl shadow-sm border border-orange-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Mail className="w-5 h-5 text-orange-500"/> 交友邀請</h3>
                    <div className="space-y-3">
                        {userProfile.friendRequests.map((req, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-orange-50/50 p-3 rounded-2xl">
                                <span className="font-bold text-sm text-slate-700">{req.name}</span>
                                <button onClick={() => handleAccept(req)} className="p-2 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition"><Check className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 text-lg px-1">我的好友 ({friendsList.length})</h3>
                {friendsList.length === 0 ? (
                    <div className="text-center text-slate-400 py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 mx-auto mb-3 opacity-30"/>
                        <p className="font-medium">還沒有好友，快去參加活動吧！</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {friendsList.map(f => (
                            <div key={f.uid} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-100 transition group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs border-2 shadow-sm ${getAvatarColor(f.gender)}`}>
                                        {f.displayName[0]}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800">{f.displayName}</div>
                                        <div className="text-xs text-slate-400 font-medium">{f.region}</div>
                                    </div>
                                </div>
                                <button onClick={() => onChat(f)} className="p-3 bg-slate-50 text-indigo-600 rounded-xl hover:bg-indigo-50 transition group-hover:scale-105">
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DMChatView({ user, friend, onBack }) {
    const chatId = [user.uid, friend.uid].sort().join('_'); 
    const [messages, setMessages] = useState([]);
    const [msgText, setMsgText] = useState('');
    const scrollRef = useRef();

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'direct_messages'),
            where('chatId', '==', chatId)
        );
        const unsub = onSnapshot(q, (snap) => {
            let msgs = snap.docs.map(d => d.data());
            msgs.sort((a,b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setMessages(msgs);
            setTimeout(() => scrollRef.current?.scrollIntoView({behavior:'smooth'}), 100);
        });
        return () => unsub();
    }, [chatId, user]);

    const send = async (e) => {
        e.preventDefault();
        if (!msgText.trim()) return;
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'direct_messages'), {
            chatId, senderId: user.uid, text: msgText, createdAt: serverTimestamp(), type: 'text'
        });
        setMsgText('');
    };

    const handleJoinEvent = async (msg) => {
        if (!msg.eventId) return;
        try {
            const eventRef = doc(db, 'artifacts', appId, 'public', 'data', 'events', msg.eventId);
            const eventSnap = await getDoc(eventRef);
            if (!eventSnap.exists()) { alert('活動已不存在'); return; }
            const eventData = eventSnap.data();
            if (eventData.participants.some(p => p.uid === user.uid)) { alert('您已經加入此活動了！'); return; }
            if (eventData.participants.length >= eventData.maxPlayers) { alert('活動已額滿！'); return; }
            
            const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid));
            const userGender = userDoc.exists() ? userDoc.data().gender : 'male';

            const participantData = { uid: user.uid, displayName: user.displayName || 'User', joinedAt: new Date().toISOString(), gender: userGender };
            await updateDoc(eventRef, { participants: arrayUnion(participantData) });
            alert(`成功加入「${eventData.title}」！`);
        } catch (error) { console.error("Join from DM error:", error); }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="bg-white p-4 shadow-sm border-b border-slate-100 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                   <button onClick={onBack} className="p-1 -ml-1 text-slate-500 hover:bg-slate-100 rounded-full"><ArrowLeft className="w-5 h-5"/></button>
                   <div className="flex items-center gap-2">
                     <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${getAvatarColor(friend.gender)}`}>
                        {friend.displayName[0]}
                     </div>
                     <div>
                        <div className="font-bold text-slate-800">{friend.displayName}</div>
                        <div className="text-xs text-slate-400">{friend.region}</div>
                     </div>
                   </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, i) => {
                    const isMe = m.senderId === user.uid;
                    return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                {m.type === 'invite' ? (
                                    <div className={`p-3 rounded-2xl shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-100 rounded-bl-none'}`}>
                                        <div className="font-bold text-sm mb-1 flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-300" /> 活動邀請</div>
                                        <div className="text-sm mb-3 opacity-90">{m.text}</div>
                                        {!isMe && <button onClick={() => handleJoinEvent(m)} className="w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm">立即加入</button>}
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                                        {m.text}
                                    </div>
                                )}
                                <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(m.createdAt)}</span>
                            </div>
                        </div>
                    )
                })}
                <div ref={scrollRef} />
            </div>
            <form onSubmit={send} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
                <input className="flex-1 bg-slate-100 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition" value={msgText} onChange={e=>setMsgText(e.target.value)} placeholder="輸入訊息..." />
                <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 transition shadow-md hover:shadow-lg"><Send className="w-5 h-5"/></button>
            </form>
        </div>
    );
}

function ChatRoom({ user, eventId, isJoined }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    useEffect(() => {
      if (!isJoined || !user) return;
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), where('eventId', '==', eventId));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let loadedMessages = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        loadedMessages.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setMessages(loadedMessages);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });
      return () => unsubscribe();
    }, [eventId, isJoined, user]);
    const handleSend = async (e) => {
      e.preventDefault();
      if (!newMessage.trim()) return;
      const userDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid));
      const senderName = userDoc.exists() ? userDoc.data().displayName : 'User';
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), { eventId, text: newMessage, senderId: user.uid, senderName, createdAt: serverTimestamp() });
      setNewMessage('');
    };
    if (!isJoined) return <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-6 text-center"><Lock className="w-12 h-12 mb-2 opacity-50" /><p>加入活動後才能查看聊天室內容</p></div>;
    return (
      <div className="flex flex-col h-full bg-slate-100/50">
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
                const isMe = msg.senderId === user.uid;
                return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[85%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            {!isMe && <span className="text-xs text-slate-500 mb-1 ml-2">{msg.senderName}</span>}
                            <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>{msg.text}</div>
                            <span className="text-[10px] text-slate-400 mt-1 px-1">{formatTime(msg.createdAt)}</span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
         </div>
         <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
            <input type="text" className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none transition" placeholder="輸入訊息..." value={newMessage} onChange={e => setNewMessage(e.target.value)} />
            <button type="submit" className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-md hover:shadow-lg"><Send className="w-5 h-5" /></button>
         </form>
      </div>
    );
}

function InviteModal({ user, userProfile, event, onClose }) {
    const [friendsList, setFriendsList] = useState([]);
    const [sentMsg, setSentMsg] = useState('');
    useEffect(() => {
        const fetchFriends = async () => {
            if (!userProfile?.friends || userProfile.friends.length === 0) return;
            try {
                const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('uid', 'in', userProfile.friends.slice(0, 10)));
                const snap = await getDocs(q);
                setFriendsList(snap.docs.map(d => d.data()));
            } catch(e) { console.error(e); }
        };
        if (user) fetchFriends();
    }, [userProfile, user]);
    const invite = async (friend) => {
        try {
            const chatId = [user.uid, friend.uid].sort().join('_');
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'direct_messages'), { chatId, senderId: user.uid, text: `邀請您參加「${event.title}」\n時間：${new Date(event.date).toLocaleString([], {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'})}`, type: 'invite', eventId: event.id, createdAt: serverTimestamp() });
            setSentMsg(`已邀請 ${friend.displayName}`);
            setTimeout(() => setSentMsg(''), 2000);
        } catch(e) { console.error(e); }
    };
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-5 right-5 p-1 hover:bg-slate-100 rounded-full transition"><X className="w-5 h-5 text-slate-400"/></button>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Share2 className="w-5 h-5 text-indigo-500"/> 邀請好友</h3>
                {sentMsg && <div className="mb-3 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-xl text-center text-sm font-medium flex items-center justify-center gap-2"><Check className="w-4 h-4"/> {sentMsg}</div>}
                {friendsList.length === 0 ? <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-2xl">沒有好友可邀請</div> : 
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {friendsList.map(f => (
                            <button key={f.uid} onClick={() => invite(f)} className="w-full flex items-center justify-between bg-slate-50 p-3 rounded-xl hover:bg-indigo-50 hover:border-indigo-100 border border-transparent transition group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${getAvatarColor(f.gender)}`}>{f.displayName[0]}</div>
                                    <span className="font-bold text-slate-700 text-sm">{f.displayName}</span>
                                </div>
                                <div className="bg-white p-1.5 rounded-full shadow-sm text-slate-400 group-hover:text-indigo-500 transition"><Send className="w-4 h-4" /></div>
                            </button>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
}

function AuthLandingView({ onLogin, onRegister }) {
  // Same as previous
  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="relative z-10 flex flex-col items-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-8 shadow-2xl border border-white/20"><Activity className="w-12 h-12 text-white" /></div>
          <h2 className="text-4xl font-bold mb-3 tracking-tight">Huddle Sport</h2>
          <p className="text-indigo-100 mb-12 text-center text-lg opacity-90">輕鬆找球友，運動不孤單</p>
          <div className="w-full space-y-4 max-w-xs">
            <button onClick={onRegister} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">註冊新帳號</button>
            <button onClick={onLogin} className="w-full py-4 bg-indigo-800/50 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-indigo-800/70 transition backdrop-blur-sm">登入</button>
          </div>
      </div>
    </div>
  );
}

function RegisterView({ user, onComplete }) {
    // ... (Keep logic from previous step, ensure gender strictly male/female)
    const [formData, setFormData] = useState({ name: '', email: '', birthYear: '2000', birthMonth: '1', birthDay: '1', region: REGIONS[0], gender: 'male', bio: '', interests: [] });
    const [submitting, setSubmitting] = useState(false);
    const [tempInterest, setTempInterest] = useState(null); 
    const addInterest = (level) => { if (!tempInterest) return; const newItem = { id: tempInterest, level: level }; const newInterests = formData.interests.filter(i => i.id !== tempInterest); setFormData({ ...formData, interests: [...newInterests, newItem] }); setTempInterest(null); };
    const removeInterest = (id) => { setFormData({ ...formData, interests: formData.interests.filter(i => i.id !== id) }); };
    const handleSubmit = async (e) => { 
        e.preventDefault(); 
        if (!formData.name || !formData.email) return; 
        setSubmitting(true); 
        try { 
            const profileData = { 
                uid: user.uid, displayName: formData.name, email: formData.email, 
                birthDate: `${formData.birthYear}-${formData.birthMonth.padStart(2,'0')}-${formData.birthDay.padStart(2,'0')}`, 
                region: formData.region, gender: formData.gender, bio: formData.bio, 
                interests: formData.interests, ratings: {}, joinedEvents: [], friendRequests: [], friends: [], reviews: [], 
                notifications: [
                    { type: 'system', text: '歡迎加入 Huddle Sport！', date: new Date().toISOString(), read: false }
                ],
                createdAt: serverTimestamp() 
            }; 
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), profileData); 
            onComplete(); 
        } catch (error) { console.error(error); } finally { setSubmitting(false); } 
    };
  
    return (
      <div className="p-6 bg-white min-h-full">
        <h2 className="text-2xl font-bold text-slate-800 mb-8">建立您的檔案</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">用戶名稱</label><input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition" placeholder="如何稱呼您？" /></div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Email</label><input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none transition" placeholder="example@mail.com" /></div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-bold text-slate-700 mb-2">性別</label><select value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none">{GENDERS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
             <div><label className="block text-sm font-bold text-slate-700 mb-2">所在地區</label><select value={formData.region} onChange={e=>setFormData({...formData, region: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none">{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-sm font-bold text-slate-700 mb-2">年</label><select value={formData.birthYear} onChange={e=>setFormData({...formData, birthYear: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none">{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-2">月</label><select value={formData.birthMonth} onChange={e=>setFormData({...formData, birthMonth: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none">{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
            <div><label className="block text-sm font-bold text-slate-700 mb-2">日</label><select value={formData.birthDay} onChange={e=>setFormData({...formData, birthDay: e.target.value})} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none">{DAYS.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-bold text-slate-700 mb-2">個人簡介</label><textarea className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none h-20 resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="簡單介紹一下自己..." /></div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">有興趣的運動與程度</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {SPORTS_TYPES.map(sport => {
                const isSelected = formData.interests.some(i => i.id === sport.id);
                return (
                    <button key={sport.id} type="button" onClick={() => setTempInterest(sport.id)} className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition ${isSelected ? 'bg-slate-100 border-slate-300 opacity-50' : tempInterest === sport.id ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                        {sport.icon}<span className="text-[10px] font-bold">{sport.name}</span>
                    </button>
                );
              })}
            </div>
            {tempInterest && (
                <div className="bg-indigo-50 p-4 rounded-2xl mb-4 animate-fade-in border border-indigo-100">
                    <p className="text-sm font-bold text-indigo-800 mb-2 text-center">選擇您在「{SPORTS_TYPES.find(s=>s.id===tempInterest)?.name}」的程度</p>
                    <div className="grid grid-cols-2 gap-2">{SKILL_LEVELS.map(lvl => (<button key={lvl.id} type="button" onClick={() => addInterest(lvl.id)} className={`text-xs py-2 rounded-lg font-bold border ${lvl.color} bg-white hover:opacity-80 border-transparent shadow-sm`}>{lvl.name}</button>))}</div>
                    <button onClick={() => setTempInterest(null)} className="w-full mt-2 text-xs text-slate-400 underline">取消</button>
                </div>
            )}
            <div className="flex flex-wrap gap-2">
                {formData.interests.map(item => {
                    const sport = SPORTS_TYPES.find(s => s.id === item.id);
                    const level = SKILL_LEVELS.find(l => l.id === item.level);
                    return (<div key={item.id} className="flex items-center gap-2 bg-slate-800 text-white px-3 py-1.5 rounded-full text-xs shadow-sm">{sport?.icon}<span className="font-bold">{sport?.name}</span><span className={`px-1.5 py-0.5 rounded text-[10px] bg-white/20`}>{level?.name}</span><button type="button" onClick={() => removeInterest(item.id)} className="hover:text-rose-300"><X className="w-3 h-3"/></button></div>);
                })}
            </div>
          </div>
          <button disabled={submitting} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition transform active:scale-95 mt-4">{submitting ? '處理中...' : '完成註冊'}</button>
        </form>
      </div>
    );
}

function CreateEventView({ user, userProfile, onBack }) {
    const [formData, setFormData] = useState({ sport: 'basketball', title: '', location: '', date: '', time: '', maxPlayers: 6, cost: '', description: '' });
    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!formData.title || !formData.location || !formData.date || !formData.time) return;
      setSubmitting(true);
      try {
        const dateTime = new Date(`${formData.date}T${formData.time}`);
        const newEvent = {
          hostId: user.uid, hostName: userProfile.displayName, sport: formData.sport, title: formData.title, location: formData.location,
          date: dateTime.toISOString(), maxPlayers: parseInt(formData.maxPlayers), cost: formData.cost, description: formData.description,
          participants: [{ uid: user.uid, displayName: userProfile.displayName, joinedAt: new Date().toISOString(), gender: userProfile.gender }],
          createdAt: serverTimestamp(), status: 'open'
        };
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'events'), newEvent);
        onBack();
      } catch (error) { console.error(error); } finally { setSubmitting(false); }
    };
    return (
      <div className="p-4 bg-white min-h-full">
        <h2 className="text-2xl font-bold mb-6 text-slate-800">發起活動</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3"><label className="block text-sm font-bold text-slate-700">選擇活動類型</label><div className="grid grid-cols-4 gap-2">{SPORTS_TYPES.map(sport => (<button type="button" key={sport.id} onClick={() => setFormData({...formData, sport: sport.id})} className={`p-2 rounded-xl border-2 flex flex-col items-center justify-center gap-2 text-xs font-bold transition h-20 ${formData.sport === sport.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{sport.icon}{sport.name}</button>))}</div></div>
          <div className="space-y-4">
            <div><label className="block text-sm font-bold text-slate-700 mb-1.5">標題</label><input required type="text" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="輸入吸引人的標題..." /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">日期</label><input required type="date" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">時間</label><input required type="time" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} /></div>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1.5">地點</label><input required type="text" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="搜尋地點..." /></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">所需人數</label><input type="number" min="2" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.maxPlayers} onChange={e => setFormData({...formData, maxPlayers: e.target.value})} /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-1.5">費用 ($)</label><input type="number" min="0" className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} /></div>
            </div>
            <div><label className="block text-sm font-bold text-slate-700 mb-1.5">備註</label><textarea className="w-full p-3.5 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-indigo-100 h-24 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="補充說明..." /></div>
          </div>
          <button type="submit" disabled={submitting} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition active:scale-95">{submitting ? '建立中...' : '確認發起'}</button>
        </form>
      </div>
    );
}

function LoginView({ user, onComplete, onSwitchToRegister }) {
    // Same as before
    const [email, setEmail] = useState(''); const [loading, setLoading] = useState(false); const [msg, setMsg] = useState('');
    const handleLogin = async (e) => { e.preventDefault(); setLoading(true); setMsg(''); try { const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('email', '==', email)); const querySnapshot = await getDocs(q); if (!querySnapshot.empty) { const existingUser = querySnapshot.docs[0].data(); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), existingUser, { merge: true }); onComplete(); } else { setMsg("找不到此 Email 的帳號，請先註冊"); } } catch (error) { console.error(error); setMsg("登入錯誤"); } finally { setLoading(false); } };
    return (
      <div className="p-6 bg-white min-h-full flex flex-col">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">歡迎回來</h2>
        <form onSubmit={handleLogin} className="space-y-5 flex-1">
          <div><label className="block text-sm font-bold text-slate-700 mb-2">Email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3.5 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-100 transition" placeholder="輸入您的 Email" /></div>
          {msg && <div className="text-rose-500 text-sm bg-rose-50 p-3 rounded-xl border border-rose-100">{msg}</div>}
          <button disabled={loading} type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-slate-800 transition">{loading ? '登入中...' : '登入'}</button>
          <div className="text-center mt-4"><span className="text-slate-500 text-sm">還沒有帳號？</span><button type="button" onClick={onSwitchToRegister} className="text-indigo-600 font-bold text-sm ml-1 hover:underline">立即註冊</button></div>
        </form>
      </div>
    );
}

function EventDetailView({ user, isGuest, event, checkAuth, onBack, userProfile }) {
    const [activeTab, setActiveTab] = useState('info');
    const [isJoined, setIsJoined] = useState(false);
    const [liveEvent, setLiveEvent] = useState(event);
    const [selectedParticipant, setSelectedParticipant] = useState(null); 
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [rateTarget, setRateTarget] = useState(null);
    const [joinMsg, setJoinMsg] = useState('');
  
    useEffect(() => {
      if (!user) return;
      const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'events', event.id), (doc) => {
        if (doc.exists()) { const data = doc.data(); setLiveEvent({id: doc.id, ...data}); setIsJoined(data.participants.some(p => p.uid === user?.uid)); }
      });
      return () => unsub();
    }, [event.id, user?.uid, user]);
  
    const handleJoin = async () => {
      if (!checkAuth()) return;
      setJoinMsg('');
      if (isJoined) {
        try { const newParticipants = liveEvent.participants.filter(p => p.uid !== user.uid); await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', event.id), { participants: newParticipants }); } catch(e) { console.error(e); }
      } else {
        if (liveEvent.participants.length >= liveEvent.maxPlayers) { setJoinMsg('已額滿！'); return; }
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid);
        const userSnap = await getDoc(userRef);
        const uData = userSnap.exists() ? userSnap.data() : {};
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', event.id), { participants: arrayUnion({ uid: user.uid, displayName: uData.displayName || 'User', joinedAt: new Date().toISOString(), gender: uData.gender || 'male' }) });
      }
    };

    const handleEndEvent = async () => {
        if(confirm('確定要結束此活動嗎？結束後即可開始互相評分。')) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'events', event.id), { status: 'ended' });
        }
    };

    const handleRateClick = (participant) => {
        setRateTarget(participant);
        setShowRateModal(true);
    };
  
    return (
      <div className="flex flex-col h-full bg-white relative">
        <div className="flex border-b border-slate-100">
          <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 font-bold text-sm border-b-2 transition ${activeTab === 'info' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>活動資訊</button>
          <button onClick={() => isGuest ? checkAuth() : setActiveTab('chat')} className={`flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 border-b-2 transition ${activeTab === 'chat' ? 'text-indigo-600 border-indigo-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            聊天室 {isJoined && !isGuest && <span className="w-2 h-2 bg-rose-500 rounded-full"></span>}
          </button>
        </div>
  
        <div className="flex-1 overflow-y-auto bg-slate-50">
          {activeTab === 'info' ? (
            <div className="p-4 space-y-6">
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="flex justify-between items-start">
                    <h2 className="text-2xl font-bold text-slate-800">{liveEvent.title}</h2>
                    {liveEvent.status === 'ended' && <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">已結束</span>}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                    <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium">{SPORTS_TYPES.find(s=>s.id===liveEvent.sport)?.icon} {SPORTS_TYPES.find(s=>s.id===liveEvent.sport)?.name}</span>
                    <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium"><Calendar className="w-4 h-4"/> {new Date(liveEvent.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium"><Clock className="w-4 h-4"/> {new Date(liveEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 pt-4 border-t border-slate-50"><MapPin className="w-5 h-5 text-indigo-500" /><span>{liveEvent.location}</span></div>
                <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 leading-relaxed">
                    {liveEvent.description || "沒有額外說明"}
                </div>
              </div>
  
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-5">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5 text-slate-400"/> 參加者 ({liveEvent.participants.length}/{liveEvent.maxPlayers})</h3>
                    {!isGuest && isJoined && liveEvent.status !== 'ended' && (
                      <button onClick={() => setShowInviteModal(true)} className="text-xs flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 font-bold transition">
                          <Share2 className="w-3.5 h-3.5" /> 邀請好友
                      </button>
                    )}
                </div>
                <div className="space-y-3">
                  {liveEvent.participants.map((p) => (
                    <div key={p.uid} className="flex items-center justify-between p-2 -mx-2 rounded-xl hover:bg-slate-50 transition">
                      <div onClick={() => { if(checkAuth()) setSelectedParticipant(p); }} className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold shadow-sm ${getAvatarColor(p.gender)}`}>{p.displayName[0]}</div>
                        <div>
                          <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              {p.displayName}
                              {p.uid === liveEvent.hostId && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">HOST</span>}
                          </p>
                        </div>
                      </div>
                      {/* Rating Button Logic: Event Ended AND Not Me */}
                      {liveEvent.status === 'ended' && p.uid !== user.uid && (
                          <button onClick={() => handleRateClick(p)} className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-200 px-3 py-1.5 rounded-full font-bold hover:bg-yellow-100 transition flex items-center gap-1">
                              <Star className="w-3 h-3" /> 評價
                          </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <ChatRoom user={user} eventId={event.id} isJoined={isJoined} />
          )}
        </div>
  
        {activeTab === 'info' && (
          <div className="p-4 bg-white border-t border-slate-100 shadow-lg z-10">
              {joinMsg && <div className="mb-2 text-center text-rose-500 text-sm font-bold">{joinMsg}</div>}
              {liveEvent.hostId === user?.uid && liveEvent.status !== 'ended' ? (
                  <button onClick={handleEndEvent} className="w-full py-4 rounded-2xl font-bold shadow-md transition active:scale-95 bg-slate-800 text-white hover:bg-slate-900">
                      結束活動 (開放評分)
                  </button>
              ) : liveEvent.status === 'ended' ? (
                  <div className="w-full py-4 rounded-2xl font-bold bg-slate-100 text-slate-500 text-center">
                      活動已結束
                  </div>
              ) : (
                 <button onClick={handleJoin} className={`w-full py-4 rounded-2xl font-bold shadow-md transition active:scale-95 ${isJoined ? 'bg-rose-50 text-rose-500 border-2 border-rose-100' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                   {isJoined ? '退出活動' : '加入活動'}
                 </button>
              )}
          </div>
        )}
        {selectedParticipant && <UserProfileModal currentUser={user} targetUser={selectedParticipant} onClose={() => setSelectedParticipant(null)} onAddFriend={async () => {
             try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', selectedParticipant.uid), { friendRequests: arrayUnion({ uid: user.uid, name: user.displayName || 'User', status: 'pending' }) }); setSelectedParticipant(null); } catch(e){console.error(e);}
        }} />}
        {showInviteModal && <InviteModal user={user} userProfile={userProfile} event={liveEvent} onClose={() => setShowInviteModal(false)} />}
        {showRateModal && <RateUserModal currentUser={user} targetUser={rateTarget} onClose={() => setShowRateModal(false)} />}
      </div>
    );
}

function RateUserModal({ currentUser, targetUser, onClose }) {
    const [skillScore, setSkillScore] = useState(5);
    const [friendlyScore, setFriendlyScore] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', targetUser.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) return;

            const currentRatings = userSnap.data().ratings || {};
            // Update Aggregates
            const newRatings = { ...currentRatings };
            
            const updateMetric = (key, score) => {
                const prev = newRatings[key] || { total: 0, count: 0 };
                newRatings[key] = { total: prev.total + score, count: prev.count + 1 };
            };

            updateMetric('skill', skillScore);
            updateMetric('friendly', friendlyScore);

            const newReview = {
                fromUid: currentUser.uid,
                fromName: currentUser.displayName || 'User',
                text: comment,
                skill: skillScore,
                friendly: friendlyScore,
                date: new Date().toISOString()
            };

            // Push notification to target user
            const newNotification = {
                type: 'review',
                text: `${currentUser.displayName} 給了你一則新評價`,
                date: new Date().toISOString(),
                read: false
            };

            await updateDoc(userRef, {
                ratings: newRatings,
                reviews: arrayUnion(newReview),
                notifications: arrayUnion(newNotification)
            });

            alert('評價送出成功！');
            onClose();
        } catch (e) {
            console.error(e);
            alert('評價失敗');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400"/></button>
                <h3 className="text-lg font-bold text-slate-800 mb-1">評價玩家</h3>
                <p className="text-sm text-slate-500 mb-6">對 {targetUser.displayName} 的印象如何？</p>

                <div className="space-y-6 mb-6">
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">運動程度</span>
                            <span className="text-sm font-bold text-indigo-600">{skillScore} 分</span>
                        </div>
                        <input type="range" min="1" max="5" value={skillScore} onChange={e=>setSkillScore(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>新手</span><span>職業</span></div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-bold text-slate-700">友善程度</span>
                            <span className="text-sm font-bold text-indigo-600">{friendlyScore} 分</span>
                        </div>
                        <input type="range" min="1" max="5" value={friendlyScore} onChange={e=>setFriendlyScore(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
                        <div className="flex justify-between text-[10px] text-slate-400 mt-1"><span>冷淡</span><span>熱情</span></div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">評語 (選填)</label>
                        <textarea value={comment} onChange={e=>setComment(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm h-24 resize-none outline-none focus:border-indigo-300" placeholder="寫下你的評論..." />
                    </div>
                </div>

                <button onClick={handleSubmit} disabled={submitting} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition">
                    {submitting ? '送出中...' : '送出評價'}
                </button>
            </div>
        </div>
    );
}

function UserProfileModal({ currentUser, targetUser, onClose, onAddFriend }) {
    const [fullProfile, setFullProfile] = useState(null); 
    const [isFriend, setIsFriend] = useState(false);
    
    useEffect(() => { 
        if (!currentUser) return;
        const f = async () => { 
            const s = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', targetUser.uid)); 
            if(s.exists()) { 
                setFullProfile(s.data()); 
                setIsFriend(s.data().friends?.includes(currentUser.uid)); 
            } 
        }; 
        f(); 
    }, [targetUser, currentUser]);

    if (!fullProfile) return null;

    const renderStats = () => {
        if (!fullProfile.ratings || Object.keys(fullProfile.ratings).length === 0) return <p className="text-xs text-slate-400 text-center py-2">尚無評分數據</p>;
        const displayKeys = [
            { key: 'skill', label: '運動程度' },
            { key: 'friendly', label: '友善程度' }
        ];
        
        return displayKeys.map(item => {
            const data = fullProfile.ratings[item.key];
            if (!data) return null;
            const score = (data.total / data.count).toFixed(1);
            return (
                <div key={item.key} className="flex items-center justify-between text-sm bg-slate-50 p-3 rounded-xl mb-2">
                    <span className="text-slate-600 font-medium">{item.label}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current"/>
                        <span className="font-bold text-slate-800">{score}</span>
                        <span className="text-xs text-slate-400">({data.count})</span>
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative max-h-[80vh] overflow-y-auto scrollbar-hide">
                <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400"/></button>
                
                <div className="flex flex-col items-center mb-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 shadow-inner mb-3 ${getAvatarColor(fullProfile.gender)}`}>
                        {fullProfile.displayName[0]}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{fullProfile.displayName}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="bg-slate-100 px-2 py-1 rounded">{fullProfile.region}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded">{GENDERS.find(g=>g.id===fullProfile.gender)?.name || '未知'}</span>
                        <span className="bg-slate-100 px-2 py-1 rounded">{new Date().getFullYear() - parseInt(fullProfile.birthDate?.split('-')[0] || 2000)} 歲</span>
                    </div>
                </div>

                {fullProfile.bio && (
                    <div className="mb-6 text-center">
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl italic">"{fullProfile.bio}"</p>
                    </div>
                )}

                <div className="space-y-6 mb-6">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3"/> 運動專長</h4>
                        <div className="flex flex-wrap gap-2">
                            {fullProfile.interests?.map((item, i) => {
                                const isObj = typeof item === 'object';
                                const id = isObj ? item.id : item;
                                const sport = SPORTS_TYPES.find(x=>x.id===id);
                                const level = isObj ? SKILL_LEVELS.find(l=>l.id===item.level) : null;
                                
                                return sport ? (
                                    <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
                                        {sport.icon}
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{sport.name}</span>
                                            {level && <span className={`text-[10px] ${level.color.replace('bg-','text-').split(' ')[1]} font-medium`}>{level.name}</span>}
                                        </div>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1"><ThumbsUp className="w-3 h-3"/> 社群評價</h4>
                        <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm mb-3">
                            {renderStats()}
                        </div>
                        
                        {/* Reviews List */}
                        {fullProfile.reviews && fullProfile.reviews.length > 0 && (
                            <div className="bg-slate-50 rounded-2xl p-3 space-y-3 max-h-40 overflow-y-auto">
                                {fullProfile.reviews.slice().reverse().map((review, idx) => (
                                    <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-700">{review.fromName}</span>
                                            <span className="text-[10px] text-slate-400">{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-xs text-slate-600">{review.text}</p>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">程度 {review.skill}</span>
                                            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">友善 {review.friendly}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                
                {currentUser.uid !== targetUser.uid && !isFriend && (
                    <button onClick={onAddFriend} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                        <UserPlus className="w-5 h-5" /> 加為好友
                    </button>
                )}
                {isFriend && <div className="w-full py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold flex items-center justify-center gap-2 border border-emerald-100"><Check className="w-5 h-5" /> 已經是好友</div>}
            </div>
        </div>
    );
}

function ProfileView({ user, userProfile }) {
    const [seeding, setSeeding] = useState(false); const [showConfirm, setShowConfirm] = useState(false); const [statusMsg, setStatusMsg] = useState('');
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const seedData = async () => { 
        setSeeding(true); 
        setStatusMsg('建立中...');
        try {
            const now = new Date();
            // Mock Users with Gender and Reviews
            const mockUsers = [
                { 
                    uid: 'mock_1', displayName: '滑板阿偉', region: '台北市', gender: 'male', 
                    interests: [{id:'skateboard', level:'pro'}, {id:'basketball', level:'intermediate'}], 
                    email: 'mock1@test.com', birthDate: '1995-01-01', 
                    ratings: { skill: {total: 25, count: 5}, friendly: {total: 20, count: 5} }, 
                    reviews: [{fromName: '路人甲', text: '超強的，教我很多技巧', skill: 5, friendly: 4, date: now.toISOString()}],
                    joinedEvents: [], friendRequests: [], friends: [], notifications: [] 
                },
                { 
                    uid: 'mock_2', displayName: '羽球小天后', region: '新北市', gender: 'female', 
                    interests: [{id:'badminton', level:'advanced'}], 
                    email: 'mock2@test.com', birthDate: '1998-05-05', 
                    ratings: { skill: {total: 22, count: 5}, friendly: {total: 25, count: 5} }, 
                    reviews: [{fromName: '球友B', text: '人很客氣，球品好', skill: 4, friendly: 5, date: now.toISOString()}],
                    joinedEvents: [], friendRequests: [], friends: [], notifications: [] 
                },
                { 
                    uid: 'mock_3', displayName: '釣魚大叔', region: '宜蘭縣', gender: 'male', 
                    interests: [{id:'fishing', level:'pro'}], 
                    email: 'mock3@test.com', birthDate: '1980-12-12', 
                    ratings: {}, reviews: [],
                    joinedEvents: [], friendRequests: [], friends: [], notifications: [] 
                }
            ];

            for(const u of mockUsers) {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', u.uid), u, {merge: true});
            }
            
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.uid), { friends: arrayUnion('mock_1', 'mock_2') }, {merge: true});
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', 'mock_1'), { friends: arrayUnion(user.uid) }, {merge: true});
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', 'mock_2'), { friends: arrayUnion(user.uid) }, {merge: true});

            // Create Events
            const events = [
                {
                    hostId: 'mock_1', hostName: '滑板阿偉', sport: 'skateboard', title: '週末滑板街頭刷街 (已結束測試評分)', 
                    location: '新生橋下', date: new Date(now.getTime() - 86400000).toISOString(), // Past date
                    maxPlayers: 10, cost: '0', description: '此活動設定為已結束，請點擊參加者評價', 
                    participants: [{uid: 'mock_1', displayName: '滑板阿偉', joinedAt: now.toISOString(), gender: 'male'}, {uid: 'mock_2', displayName: '羽球小天后', joinedAt: now.toISOString(), gender: 'female'}],
                    createdAt: serverTimestamp(), status: 'ended' // Status ended
                },
                {
                    hostId: 'mock_2', hostName: '羽球小天后', sport: 'badminton', title: '羽球雙打缺2', 
                    location: '大安運動中心', date: new Date(now.getTime() + 86400000 * 3).toISOString(), 
                    maxPlayers: 4, cost: '150', description: '中等程度，歡迎報名', 
                    participants: [{uid: 'mock_2', displayName: '羽球小天后', joinedAt: now.toISOString(), gender: 'female'}],
                    createdAt: serverTimestamp(), status: 'open'
                }
            ];

            for(const ev of events) {
                await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'events'), ev);
            }

            setStatusMsg('完成！'); setTimeout(() => { setStatusMsg(''); setShowConfirm(false); }, 2000); 
        } catch(e){ console.error(e); } finally { setSeeding(false); } 
    };

    const handleLogout = async () => {
        try { await signOut(auth); window.location.reload(); } catch (error) { console.error("Logout failed", error); }
    };
    
    const renderRatingStats = () => {
        if (!userProfile?.ratings || Object.keys(userProfile.ratings).length === 0) return <p className="text-slate-400 text-sm text-center py-4">尚無評價數據</p>;
        return (
            <div className="grid grid-cols-2 gap-3">
               {['skill', 'friendly'].map(k => {
                   const data = userProfile.ratings[k];
                   const label = k === 'skill' ? '程度' : '友善';
                   return data ? (
                       <div key={k} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                           <div className="text-xs font-bold text-slate-400 mb-1">{label}</div>
                           <div className="flex items-baseline gap-1">
                               <span className="text-2xl font-bold text-slate-800">{(data.total/data.count).toFixed(1)}</span>
                               <span className="text-xs text-slate-400">/ 5</span>
                           </div>
                       </div>
                   ) : null;
               })}
            </div>
        );
    };

    return (
      <div className="p-4 pb-24">
         <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-4 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10"></div>
            <div className={`w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold border-4 shadow-xl mb-4 z-10 bg-white ${getAvatarColor(userProfile?.gender)}`}>
                {userProfile?.displayName?.[0] || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-1">{userProfile?.displayName}</h2>
            <p className="text-sm text-slate-500 font-medium mb-4">{userProfile?.region} | {GENDERS.find(g=>g.id===userProfile?.gender)?.name} | {userProfile?.email}</p>
            {userProfile?.bio && <p className="text-sm text-slate-600 mb-4 text-center max-w-xs bg-slate-50 p-2 rounded-lg">{userProfile.bio}</p>}
            <div className="flex flex-wrap justify-center gap-2">{userProfile?.interests?.map((item, i) => {
                    const s = SPORTS_TYPES.find(x=>x.id===item.id);
                    const l = SKILL_LEVELS.find(x=>x.id===item.level);
                    const isObj = typeof item === 'object';
                    const sportName = isObj ? s?.name : SPORTS_TYPES.find(x=>x.id===item)?.name;
                    const levelName = isObj ? l?.name : '';
                    return (<span key={i} className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full border border-slate-200 flex items-center gap-1">{sportName}{levelName && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1 rounded ml-1">{levelName}</span>}</span>);
            })}</div>
         </div>
         
         {!showConfirm ? (
            <button onClick={() => setShowConfirm(true)} className="w-full mb-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 border border-indigo-100 rounded-2xl font-bold flex items-center justify-center gap-2 transition hover:shadow-md"><Zap className="w-4 h-4" /> 生成測試資料</button>
         ) : (
             <div className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-100 mb-6 text-center">
                 <p className="text-sm text-slate-600 mb-3 font-bold">{statusMsg || '確定生成測試資料？'}</p>
                 {!statusMsg && <div className="flex gap-2"><button onClick={()=>setShowConfirm(false)} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold text-slate-600">取消</button><button onClick={seedData} disabled={seeding} className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">確認</button></div>}
             </div>
         )}

         <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />運動評價</h3>
             {renderRatingStats()}
             {/* My Reviews */}
             {userProfile?.reviews && userProfile.reviews.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-slate-100">
                     <h4 className="text-xs font-bold text-slate-400 mb-3">最近收到的評價</h4>
                     <div className="space-y-3">
                         {userProfile.reviews.slice(-3).reverse().map((r, idx) => (
                             <div key={idx} className="bg-slate-50 p-3 rounded-xl text-sm">
                                 <div className="flex justify-between mb-1"><span className="font-bold text-slate-700">{r.fromName}</span><span className="text-xs text-slate-400">{new Date(r.date).toLocaleDateString()}</span></div>
                                 <p className="text-slate-600 mb-2">"{r.text}"</p>
                                 <div className="flex gap-2 text-[10px]"><span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">程度 {r.skill}</span><span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">友善 {r.friendly}</span></div>
                             </div>
                         ))}
                     </div>
                 </div>
             )}
         </div>

         {!showLogoutConfirm ? (
            <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-4 text-rose-400 font-bold text-sm hover:text-rose-600 flex items-center justify-center gap-2 bg-rose-50 rounded-2xl transition"><LogOut className="w-4 h-4"/> 登出帳號</button>
         ) : (
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 text-center"><p className="text-sm text-rose-700 font-bold mb-3">確定要登出嗎？</p><div className="flex gap-2"><button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-2 bg-white text-slate-600 rounded-xl font-bold">取消</button><button onClick={handleLogout} className="flex-1 py-2 bg-rose-500 text-white rounded-xl font-bold">確認登出</button></div></div>
         )}
      </div>
    );
}