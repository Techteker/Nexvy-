import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Search, 
  Bookmark, 
  User as UserIcon, 
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  Bell
} from 'lucide-react';
import { Category, NewsItem, Poll, User, AppView, AdminNotification, AdminPopup } from './types';
import { fetchNewsFeed as fetchGeminiNews } from './services/geminiService';
import { auth, db, fetchNewsFeed, fetchPolls, fetchBookmarks, logout } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, onSnapshot, query, collection, orderBy, limit } from 'firebase/firestore';
import NewsReader from './components/NewsReader';
import { HeroCard, NewsListItem, CategoryGrid, StoryRail, PollWidget, SkeletonLoader } from './components/DashboardWidgets';
import SearchPage from './components/SearchPage';
import BookmarksPage from './components/BookmarksPage';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import CreatorDashboard from './components/CreatorDashboard';
import AdminPanel from './components/AdminPanel';

import AdminAuth from './components/AdminAuth';

// Mock Poll Data
const MOCK_POLL: Poll = {
  id: 'poll-1',
  question: 'Is AI-generated news the future of digital journalism?',
  options: [
    { label: 'Absolutely', votes: 72 },
    { label: 'Not Quite', votes: 28 }
  ]
};

const App: React.FC = () => {
  // --- Global State ---
  const [activeTab, setActiveTab] = useState<AppView>(AppView.Feed);
  const [darkMode, setDarkMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<NewsItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [recentNotif, setRecentNotif] = useState<AdminNotification | null>(null);
  const [showNotifTray, setShowNotifTray] = useState(false);
  const [allNotifications, setAllNotifications] = useState<AdminNotification[]>([]);
  
  // --- Data State ---
  const [generalNews, setGeneralNews] = useState<NewsItem[]>([]);
  const [storyNews, setStoryNews] = useState<NewsItem[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPopup, setCurrentPopup] = useState<AdminPopup | null>(null);

  // --- Reader State ---
  const [readerOpen, setReaderOpen] = useState(false);
  const [currentReadingIndex, setCurrentReadingIndex] = useState(0);
  const [readingList, setReadingList] = useState<NewsItem[]>([]);

  // --- Initialization ---
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const initFallbackData = async () => {
      setLoading(true);
      const [general, stories] = await Promise.all([
        fetchGeminiNews(Category.General, 'English'),
        fetchGeminiNews(Category.Entertainment, 'English')
      ]);
      
      setGeneralNews(general);
      setStoryNews(stories);
      setLoading(false);
    };

    // Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
    });

    // Real-time News Listener
    const unsubscribeNews = fetchNewsFeed((news) => {
      if (news.length > 0) {
        setGeneralNews(news.filter(n => n.category !== Category.Entertainment));
        setStoryNews(news.filter(n => n.category === Category.Entertainment));
        setLoading(false);
      } else {
        // Fallback to Gemini news if DB is empty (first boot)
        initFallbackData();
      }
    });

    // Real-time Polls Listener
    const unsubscribePolls = fetchPolls((data) => {
      setPolls(data);
    });

    // Real-time Notifications Listener
    const unsubscribeNotifsTray = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20)), (snap) => {
        setAllNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification)));
    });

    // Real-time Notifications Listener (Recent for Toast)
    const unsubscribeNotifs = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(1)), (snap) => {
        if (!snap.empty) {
            const notif = { id: snap.docs[0].id, ...snap.docs[0].data() } as AdminNotification;
            // Only show if it's very recent (e.g. less than 10 seconds old) to avoid backlog showing on login
            const now = new Date().getTime();
            const createdAtModel = notif.createdAt;
            const created = (createdAtModel && typeof createdAtModel.toMillis === 'function') 
                ? createdAtModel.toMillis() 
                : now;
            
            if (now - created < 10000) {
                setRecentNotif(notif);
                setTimeout(() => setRecentNotif(null), 5000);
            }
        }
    }, (error) => console.error("Notifications snapshot error:", error));

    return () => {
      unsubscribeAuth();
      unsubscribeNews();
      unsubscribePolls();
      unsubscribeNotifs();
      unsubscribeNotifsTray();
    };
  }, []);

  // URL Hash Listener for Admin Access
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setActiveTab(AppView.Admin);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    // Check on mount too
    handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Pop-up Scheduler
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    const unsubscribePopups = onSnapshot(collection(db, 'popups'), (snap) => {
       const activePopups = snap.docs
         .map(d => ({ id: d.id, ...d.data() } as AdminPopup))
         .filter(p => p.active);
       
       if (activePopups.length > 0) {
          // Show first pop-up after a delay or immediately for first time
          interval = setInterval(() => {
             const randomPopup = activePopups[Math.floor(Math.random() * activePopups.length)];
             setCurrentPopup(randomPopup);
          }, 180000); // 3 minutes
       }
    }, (error) => console.error("Popups snapshot error:", error));

    return () => {
      unsubscribePopups();
      if (interval) clearInterval(interval);
    };
  }, []);

  // Bookmarks Listener
  useEffect(() => {
    if (!user) {
      setBookmarks([]);
      return;
    }

    const unsubscribeBookmarks = fetchBookmarks(user.id, (data) => {
      setBookmarks(data);
    });

    return () => unsubscribeBookmarks();
  }, [user]);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // --- Handlers ---
  const openReader = (items: NewsItem[], startIndex: number) => {
    setReadingList(items);
    setCurrentReadingIndex(startIndex);
    setReaderOpen(true);
  };

  const toggleBookmarkHandler = async (item: NewsItem) => {
    if (!user) {
        setShowAuth(true);
        return;
    }
    const isBookmarked = !!bookmarks.find(b => b.id === item.id);
    try {
        await import('./services/firebase').then(m => m.toggleBookmark(user.id, item, isBookmarked));
    } catch (err) {
        console.error("Failed to toggle bookmark", err);
    }
  };

  const handleVote = async (poll: Poll, idx: number) => {
      if (!user) {
          setShowAuth(true);
          return;
      }
      try {
          await import('./services/firebase').then(m => m.castVote(poll.id, user.id, idx, poll));
      } catch (err) {
          console.error("Failed to cast vote", err);
      }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setActiveTab(AppView.Feed);
  };

  const handleUpdateRole = async (role: 'creator') => {
      if (user) {
          const userRef = doc(db, 'users', user.id);
          try {
              await updateDoc(userRef, { role });
              setUser({ ...user, role });
          } catch (err) {
              console.error("Failed to update role", err);
          }
      }
  };

  // --- Renderers ---
  const renderHeader = (title: string, showProfile = false) => (
    <div className="sticky top-0 z-40 px-6 py-5 flex items-center justify-between glass border-b border-gray-100 dark:border-white/5 transition-all">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
          <Sparkles size={16} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {showProfile && (
          <button 
            onClick={() => setShowNotifTray(true)}
            className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors relative"
          >
            <Bell size={20} />
            {allNotifications.length > 0 && (
               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-black" />
            )}
          </button>
        )}
        {showProfile && (
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab(AppView.Settings)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center transition-all"
          >
            {user ? (
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" className="w-full h-full object-cover" />
            ) : (
               <UserIcon size={20} className="text-gray-400" />
            )}
          </motion.button>
        )}
      </div>
    </div>
  );

  const renderHome = () => {
    if (loading) return <SkeletonLoader />;

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderHeader('Proxima', true)}
        <main className="px-6 py-8 space-y-10 max-w-xl mx-auto pb-32">
          
          {/* Stories Section */}
          <div className="space-y-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Live Stories</h3>
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600/20" />
              </div>
            </div>
            <StoryRail 
              items={storyNews} 
              onClick={(index) => openReader(storyNews, index)} 
            />
          </div>

          {/* Hero Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Featured</h3>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-500 font-display">New Daily</span>
            </div>
            {generalNews.length > 0 && (
              <HeroCard 
                item={generalNews[0]} 
                onClick={() => openReader(generalNews, 0)} 
              />
            )}
          </div>

          {/* Poll */}
          <div className="pt-4">
             {polls.length > 0 && (
                <PollWidget 
                    poll={polls[0]} 
                    userId={user?.id} 
                    onVote={(idx) => handleVote(polls[0], idx)} 
                />
             )}
          </div>

          {/* Latest News */}
          <div className="space-y-6 pt-6">
            <div className="flex justify-between items-center px-1">
              <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Trending Now</h3>
              <button 
                onClick={() => setActiveTab(AppView.Search)}
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-display"
              >
                Explore More
              </button>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-white/5">
              {generalNews.slice(1, 10).map((item, idx) => (
                <NewsListItem 
                  key={item.id} 
                  item={item} 
                  onClick={() => openReader(generalNews, idx + 1)} 
                />
              ))}
            </div>
          </div>

          <CategoryGrid />

        </main>
      </motion.div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case AppView.Search:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4 }}>
            <SearchPage onArticleClick={(item) => openReader([item], 0)} allNews={[...generalNews, ...storyNews]} />
          </motion.div>
        );
      case AppView.Bookmarks:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}>
            <BookmarksPage bookmarks={bookmarks} onRemove={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))} onArticleClick={(item) => openReader([item], 0)} />
          </motion.div>
        );
      case AppView.Settings:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.4 }}>
            <SettingsPage 
              darkMode={darkMode} 
              toggleDarkMode={toggleDarkMode} 
              user={user} 
              onLogin={() => setShowAuth(true)} 
              onLogout={handleLogout} 
              onOpenCreator={() => setActiveTab(AppView.Creator)} 
              onOpenAdmin={() => setActiveTab(AppView.Admin)}
            />
          </motion.div>
        );
      case AppView.Creator:
         return user ? (
            <CreatorDashboard user={user} onBack={() => setActiveTab(AppView.Settings)} onUpdateRole={handleUpdateRole} />
         ) : (
             <div className="p-10 text-center text-gray-500 font-display uppercase tracking-widest text-xs">Please login to access Creator Studio</div>
         );
      case AppView.Admin:
         return user?.role === 'admin' ? (
             <AdminPanel user={user} onBack={() => setActiveTab(AppView.Settings)} />
         ) : (
             <AdminAuth 
               onBack={() => setActiveTab(AppView.Settings)} 
               onSuccess={(adminUser) => {
                 setUser(adminUser);
                 setActiveTab(AppView.Admin);
               }} 
             />
         );
      default:
        return renderHome();
    }
  };

  return (
    <div className="bg-[#F8F9FA] dark:bg-[#000000] min-h-screen text-gray-900 dark:text-gray-100 selection:bg-blue-100 dark:selection:bg-blue-900 overflow-x-hidden">
      
      {/* Main Content Area */}
      {!readerOpen && (
        <>
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
          
          {/* Bottom Navigation */}
          {activeTab !== AppView.Creator && (
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm glass border border-white/20 dark:border-white/10 rounded-[32px] px-2 py-2 flex justify-between items-center z-50 shadow-2xl shadow-black/10">
                <NavBtn icon={Home} active={activeTab === AppView.Feed} onClick={() => setActiveTab(AppView.Feed)} />
                <NavBtn icon={Search} active={activeTab === AppView.Search} onClick={() => setActiveTab(AppView.Search)} />
                <NavBtn icon={Bookmark} active={activeTab === AppView.Bookmarks} onClick={() => setActiveTab(AppView.Bookmarks)} />
                <NavBtn icon={SettingsIcon} active={activeTab === AppView.Settings} onClick={() => setActiveTab(AppView.Settings)} />
            </div>
          )}
        </>
      )}

      {/* Reader Overlay */}
      <AnimatePresence>
        {readerOpen && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60]"
          >
            <NewsReader 
              items={readingList} 
              initialIndex={currentReadingIndex} 
              onClose={() => setReaderOpen(false)} 
              onBookmark={toggleBookmarkHandler}
              isBookmarked={(item) => !!bookmarks.find(b => b.id === item.id)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Overlay */}
      <AnimatePresence>
        {showAuth && (
          <AuthPage onClose={() => setShowAuth(false)} onLoginSuccess={handleLogin} />
        )}
      </AnimatePresence>

      {/* Pop-up Overlay */}
      <AnimatePresence>
        {currentPopup && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="bg-white dark:bg-[#0a0a0a] w-full max-w-sm rounded-[48px] overflow-hidden shadow-2xl relative">
               <button 
                 onClick={() => setCurrentPopup(null)}
                 className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/10 flex items-center justify-center dark:text-white dark:bg-white/10 z-10"
               >
                 <ChevronRight size={20} className="rotate-90" />
               </button>
               
               <div className="aspect-square w-full">
                  <img src={currentPopup.imageUrl} className="w-full h-full object-cover" />
               </div>
               
               <div className="p-10 text-center">
                  <h4 className="font-display font-black text-2xl dark:text-white mb-4 leading-tight">
                    {currentPopup.content}
                  </h4>
                  <button 
                    onClick={() => {
                        if (currentPopup.link) window.open(currentPopup.link, '_blank');
                        setCurrentPopup(null);
                    }}
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-600/20"
                  >
                    Take Action
                  </button>
                  <button 
                    onClick={() => setCurrentPopup(null)}
                    className="mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    Skip for now
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {recentNotif && (
            <motion.div 
               initial={{ opacity: 0, y: -50 }}
               animate={{ opacity: 1, y: 20 }}
               exit={{ opacity: 0, y: -50 }}
               className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm z-[110]"
            >
                <div className={`p-4 rounded-3xl shadow-2xl flex items-center gap-4 ${
                    recentNotif.type === 'info' ? 'bg-blue-600 text-white' :
                    recentNotif.type === 'warning' ? 'bg-amber-600 text-white' :
                    'bg-emerald-600 text-white'
                }`}>
                    <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Bell size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">{recentNotif.title}</p>
                        <p className="text-sm font-bold truncate">{recentNotif.message}</p>
                    </div>
                    <button onClick={() => setRecentNotif(null)} className="p-2">
                        <ChevronRight size={18} className="rotate-90" />
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Tray */}
      <AnimatePresence>
        {showNotifTray && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifTray(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-[#0a0a0a] rounded-t-[48px] max-h-[80vh] flex flex-col"
            >
               <div className="p-10 border-b border-gray-100 dark:border-white/5 flex items-center justify-between flex-shrink-0">
                  <h3 className="font-display font-black text-2xl dark:text-white">Central Hub</h3>
                  <button 
                    onClick={() => setShowNotifTray(false)}
                    className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center dark:text-white"
                  >
                    <ChevronRight size={24} className="rotate-90" />
                  </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
                  {allNotifications.map(n => (
                      <div key={n.id} className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-blue-600/20 transition-all">
                           <div className="flex items-center justify-between mb-3">
                              <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                  n.type === 'info' ? 'bg-blue-600/10 text-blue-600' :
                                  n.type === 'warning' ? 'bg-amber-600/10 text-amber-600' :
                                  'bg-emerald-600/10 text-emerald-600'
                              }`}>
                                  {n.type}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">Just Now</span>
                           </div>
                           <p className="font-black dark:text-white">{n.title}</p>
                           <p className="text-sm font-medium text-gray-500 dark:text-white/40 mt-2">{n.message}</p>
                      </div>
                  ))}
                  {allNotifications.length === 0 && (
                      <div className="h-64 flex flex-col items-center justify-center text-center px-10">
                          <Bell className="text-gray-300 mb-4" size={48} />
                          <p className="text-sm font-bold text-gray-400">Silence in the network.<br/>Signals will appear here.</p>
                      </div>
                  )}
               </div>
               
               <div className="p-10 pt-0">
                  <button 
                    onClick={() => setShowNotifTray(false)}
                    className="w-full h-16 bg-gray-100 dark:bg-white/5 rounded-[24px] font-black uppercase tracking-widest dark:text-white"
                  >
                    Dismiss
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
};

const NavBtn: React.FC<{ icon: any, active: boolean, onClick: () => void }> = ({ icon: Icon, active, onClick }) => (
  <button 
    onClick={onClick} 
    className="relative flex-1 flex flex-col items-center justify-center h-14 transition-all duration-500"
  >
    <motion.div 
      animate={{ 
        scale: active ? 1.1 : 1,
        y: active ? -2 : 0
      }}
      className={`
        relative p-3 rounded-2xl transition-colors duration-300
        ${active ? 'text-black dark:text-white' : 'text-gray-400 dark:text-white/30'}
      `}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-black/5 dark:bg-white/10 rounded-2xl -z-10"
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.div>
  </button>
);

export default App;
