import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  UserRound, 
  FileText, 
  Bell, 
  Zap, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Mail,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowLeft,
  LayoutGrid,
  Search,
  Megaphone,
  Monitor,
  Eye,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { User, NewsItem, AdminNotification, AdminCampaign, AdminPopup } from '../types';
import AutoPilot from './AutoPilot';
import { db } from '../services/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';

interface AdminPanelProps {
  user: User;
  onBack: () => void;
}

type AdminTab = 'dashboard' | 'users' | 'creators' | 'posts' | 'notifications' | 'stories' | 'campaigns' | 'popups' | 'autopilot';

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  
  // Data States
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allPosts, setAllPosts] = useState<NewsItem[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [popups, setPopups] = useState<AdminPopup[]>([]);
  const [stats, setStats] = useState({
      totalUsers: 0,
      totalCreators: 0,
      totalPosts: 0,
      totalViews: 0
  });

  useEffect(() => {
    // Sync Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
        const users = snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
        setAllUsers(users);
        setStats(prev => ({ 
            ...prev, 
            totalUsers: users.length,
            totalCreators: users.filter(u => u.role === 'creator').length
        }));
    }, (error) => console.error("Admin Users sync error:", error));

    // Sync Posts
    const unsubPosts = onSnapshot(collection(db, 'news'), (snap) => {
        const posts = snap.docs.map(d => ({ id: d.id, ...d.data() } as NewsItem));
        setAllPosts(posts);
        setStats(prev => ({
            ...prev,
            totalPosts: posts.length,
            totalViews: posts.reduce((acc, p) => acc + (p.views || 0), 0)
        }));
    }, (error) => console.error("Admin Posts sync error:", error));

    // Sync Notifications
    const unsubNotifs = onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')), (snap) => {
        setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification)));
    }, (error) => console.error("Admin Notifs sync error:", error));

    // Sync Campaigns
    const unsubCamps = onSnapshot(collection(db, 'campaigns'), (snap) => {
        setCampaigns(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminCampaign)));
    }, (error) => console.error("Admin Campaigns sync error:", error));

    // Sync Popups
    const unsubPopups = onSnapshot(collection(db, 'popups'), (snap) => {
        setPopups(snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminPopup)));
    }, (error) => console.error("Admin Popups sync error:", error));

    return () => {
        unsubUsers();
        unsubPosts();
        unsubNotifs();
        unsubCamps();
        unsubPopups();
    };
  }, []);

  const handleUpdateUserRole = async (targetUserId: string, newRole: 'user' | 'creator' | 'admin') => {
      try {
          await updateDoc(doc(db, 'users', targetUserId), { role: newRole });
      } catch (err) {
          console.error("Role update failed", err);
      }
  };

  const handleDeletePost = async (postId: string) => {
      if(confirm('Delete this post?')) {
          await deleteDoc(doc(db, 'news', postId));
      }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'creators', label: 'Creators', icon: ShieldCheck },
    { id: 'posts', label: 'Post Review', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'stories', label: 'Live Stories', icon: Zap },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
    { id: 'popups', label: 'Pop-ups', icon: Monitor },
    { id: 'autopilot', label: 'Auto Pilot', icon: RefreshCw },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#050505] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-gray-200 dark:border-white/5 bg-white dark:bg-[#0a0a0a] flex flex-shrink-0 flex-col">
        <div className="p-8 border-b border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl">P</div>
            <h1 className="font-display font-black text-2xl tracking-tighter dark:text-white">PROXIMA <span className="text-blue-600">ADMIN</span></h1>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 rounded-2xl">
            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Super Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`
                w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-display text-sm font-bold
                ${activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-gray-500 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/5'}
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-white/5">
           <button 
             onClick={onBack}
             className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white font-bold text-sm hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
           >
             <ArrowLeft size={18} />
             Return to App
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border-b border-gray-200 dark:border-white/5 px-10 h-24 flex items-center justify-between">
           <h2 className="font-display font-black text-2xl dark:text-white capitalize tracking-tight">
             {activeTab.replace('-', ' ')}
           </h2>
           
           <div className="flex items-center gap-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Universal Search..."
                  className="w-80 h-12 bg-gray-100 dark:bg-white/5 border border-transparent focus:border-blue-600/30 rounded-2xl pl-12 pr-6 text-sm font-medium dark:text-white transition-all outline-none" 
                />
              </div>
              <button className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center dark:text-white relative">
                 <Bell size={20} />
                 <span className="absolute top-3 right-3 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-black" />
              </button>
           </div>
        </header>

        <div className="p-10 pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <AdminOverview stats={stats} posts={allPosts} />}
              {activeTab === 'users' && <AdminUserManagement users={allUsers} onUpdateRole={handleUpdateUserRole} />}
              {activeTab === 'creators' && <AdminCreatorManagement users={allUsers} onUpdateRole={handleUpdateUserRole} />}
              {activeTab === 'posts' && <AdminPostManagement posts={allPosts} onDelete={handleDeletePost} />}
              {activeTab === 'notifications' && <AdminNotificationManager notifications={notifications} />}
              {activeTab === 'campaigns' && <AdminCampaignManager campaigns={campaigns} />}
              {activeTab === 'popups' && <AdminPopupManager popups={popups} />}
              {activeTab === 'stories' && <AdminStoryManager posts={allPosts} />}
              {activeTab === 'autopilot' && <AutoPilot />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const AdminOverview = ({ stats, posts }: { stats: any, posts: NewsItem[] }) => (
  <div className="space-y-10">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
            { label: 'Total Reach', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-600/10' },
            { label: 'Community', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-fuchsia-600', bg: 'bg-fuchsia-600/10' },
            { label: 'Intelligence', value: stats.totalPosts.toLocaleString(), icon: FileText, color: 'text-amber-600', bg: 'bg-amber-600/10' },
            { label: 'Creators', value: stats.totalCreators.toLocaleString(), icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
        ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[32px] border border-gray-200 dark:border-white/5">
                <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6`}>
                    <stat.icon size={24} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 mb-2">{stat.label}</p>
                <h3 className="text-4xl font-black tracking-tighter dark:text-white">{stat.value}</h3>
            </div>
        ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white dark:bg-[#0a0a0a] rounded-[40px] p-10 border border-gray-200 dark:border-white/5">
            <div className="flex items-center justify-between mb-10">
                <h3 className="font-display font-black text-xl dark:text-white">Platform Velocity</h3>
                <button className="text-xs font-black text-blue-600 uppercase tracking-widest">Real-time Data</button>
            </div>
            <div className="h-64 flex items-end justify-between gap-4">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((val, i) => (
                    <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${val}%` }}
                        className="flex-1 bg-blue-600 rounded-xl relative group"
                    >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val}k
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
        
        <div className="bg-white dark:bg-[#0a0a0a] rounded-[40px] p-10 border border-gray-200 dark:border-white/5">
            <h3 className="font-display font-black text-xl dark:text-white mb-10">Recent Activity</h3>
            <div className="space-y-8">
                {posts.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={p.imageUrl} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold dark:text-white truncate">{p.title}</p>
                            <p className="text-[10px] font-medium text-gray-500 dark:text-white/20 mt-1 uppercase tracking-widest">{p.category} • {p.publishedTime}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  </div>
);

const AdminUserManagement = ({ users, onUpdateRole }: { users: User[], onUpdateRole: any }) => (
  <div className="bg-white dark:bg-[#0a0a0a] rounded-[40px] border border-gray-200 dark:border-white/5 overflow-hidden">
    <table className="w-full text-left">
        <thead>
            <tr className="border-b border-gray-200 dark:border-white/5">
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Identity</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Security Role</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20">Velocity</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-white/20 text-right">Actions</th>
            </tr>
        </thead>
        <tbody>
            {users.map(u => (
                <tr key={u.id} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-8">
                        <div className="flex items-center gap-4">
                            <img src={u.avatar} className="w-12 h-12 rounded-2xl object-cover" />
                            <div>
                                <p className="font-black dark:text-white">{u.name}</p>
                                <p className="text-xs font-medium text-gray-500 dark:text-white/20">{u.email}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-8">
                        <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            u.role === 'admin' ? 'bg-red-600/10 text-red-600' :
                            u.role === 'creator' ? 'bg-blue-600/10 text-blue-600' :
                            'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/40'
                        }`}>
                            {u.role}
                        </span>
                    </td>
                    <td className="p-8 font-mono text-sm dark:text-white/40">
                        ${(u.earnings || 0).toFixed(2)}
                    </td>
                    <td className="p-8 text-right">
                        <select 
                            onChange={(e) => onUpdateRole(u.id, e.target.value as any)}
                            value={u.role}
                            className="bg-gray-100 dark:bg-white/10 dark:text-white text-xs font-bold rounded-xl px-4 py-2 outline-none border-none"
                        >
                            <option value="user">USER</option>
                            <option value="creator">CREATOR</option>
                            <option value="admin">ADMIN</option>
                        </select>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
  </div>
);

const AdminCreatorManagement = ({ users, onUpdateRole }: { users: User[], onUpdateRole: any }) => {
    const creators = users.filter(u => u.role === 'creator' || u.role === 'admin');
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {creators.map(c => (
                <div key={c.id} className="bg-white dark:bg-[#0a0a0a] rounded-[40px] p-10 border border-gray-200 dark:border-white/5 text-center">
                    <img src={c.avatar} className="w-24 h-24 rounded-[32px] mx-auto mb-8 shadow-2xl" />
                    <h4 className="font-display font-black text-xl dark:text-white">{c.name}</h4>
                    <p className="text-sm font-medium text-gray-400 dark:text-white/20 mt-2">{c.email}</p>
                    
                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-gray-400">Total News</p>
                           <p className="text-xl font-black dark:text-white mt-1">14</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                           <p className="text-[10px] font-black uppercase text-gray-400">Yield</p>
                           <p className="text-xl font-black text-emerald-600 mt-1">${(c.earnings || 0).toFixed(2)}</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => onUpdateRole(c.id, 'user')}
                        className="w-full mt-8 py-4 rounded-2xl bg-red-600/10 text-red-600 font-bold text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                    >
                        Revoke Creator Access
                    </button>
                </div>
            ))}
        </div>
    );
};

const AdminPostManagement = ({ posts, onDelete }: { posts: NewsItem[], onDelete: any }) => (
    <div className="space-y-6">
        {posts.map(p => (
            <div key={p.id} className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[40px] border border-gray-200 dark:border-white/5 flex items-center gap-10">
                <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0">
                    <img src={p.imageUrl} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-4 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">{p.category}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.status}</span>
                    </div>
                    <h4 className="text-xl font-black dark:text-white tracking-tight mb-2 truncate">{p.title}</h4>
                    <p className="text-sm font-medium text-gray-500 dark:text-white/40 line-clamp-2">{p.summary}</p>
                </div>
                <div className="flex gap-4">
                    <button className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                        <CheckCircle2 size={24} />
                    </button>
                    <button onClick={() => onDelete(p.id)} className="w-14 h-14 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const AdminNotificationManager = ({ notifications }: { notifications: AdminNotification[] }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'info' | 'warning' | 'success'>('info');

    const handleSend = async () => {
        if(!title || !message) return;
        try {
            await addDoc(collection(db, 'notifications'), {
                title, message, type,
                createdAt: serverTimestamp()
            });
            setTitle('');
            setMessage('');
        } catch (err) {
            console.error("Failed to send notification", err);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                <h3 className="font-display font-black text-xl dark:text-white mb-8">Broadcast System</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-3">Topic</label>
                        <input 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full h-14 bg-gray-50 dark:bg-white/5 rounded-2xl px-6 outline-none dark:text-white font-medium" 
                            placeholder="Priority Update..." 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-3">Narrative</label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full h-40 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 outline-none dark:text-white font-medium resize-none"
                            placeholder="Message body..."
                        />
                    </div>
                    <div className="flex gap-4">
                        {(['info', 'warning', 'success'] as const).map(t => (
                            <button 
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                                    type === t ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 dark:border-white/5 text-gray-400'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={handleSend}
                        className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        Transmit Signal
                    </button>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                <h3 className="font-display font-black text-xl dark:text-white mb-8">Transmission Log</h3>
                <div className="space-y-6">
                    {notifications.map(n => (
                        <div key={n.id} className="p-6 bg-gray-50 dark:bg-white/5 rounded-3xl border border-transparent hover:border-blue-600/20 transition-all">
                             <div className="flex items-center justify-between mb-4">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${
                                    n.type === 'info' ? 'bg-blue-600/10 text-blue-600' :
                                    n.type === 'warning' ? 'bg-amber-600/10 text-amber-600' :
                                    'bg-emerald-600/10 text-emerald-600'
                                }`}>
                                    {n.type}
                                </span>
                                <button className="text-gray-400"><Trash2 size={14} /></button>
                             </div>
                             <p className="font-black dark:text-white">{n.title}</p>
                             <p className="text-sm font-medium text-gray-500 dark:text-white/40 mt-2">{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const AdminCampaignManager = ({ campaigns }: { campaigns: AdminCampaign[] }) => {
    return (
        <div className="space-y-10">
             <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-xl dark:text-white">Active Campaigns</h3>
                <button className="flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest">
                    <Plus size={18} />
                    New Campaign
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {campaigns.map(c => (
                     <div key={c.id} className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5">
                         <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-fuchsia-600/10 text-fuchsia-600 rounded-2xl flex items-center justify-center">
                                <Megaphone size={20} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-600/10 px-4 py-2 rounded-full">{c.status}</span>
                         </div>
                         <h4 className="font-display font-black text-xl dark:text-white">{c.name}</h4>
                         <p className="text-[10px] font-black text-gray-400 dark:text-white/20 mt-2 uppercase tracking-widest">Budget: ${c.budget}</p>
                         
                         <div className="mt-8 pt-8 border-t border-gray-200 dark:border-white/5 flex gap-4">
                             <button className="flex-1 py-3 bg-gray-100 dark:bg-white/5 rounded-xl font-bold text-xs dark:text-white">Pause</button>
                             <button className="flex-1 py-3 bg-red-600/10 text-red-600 rounded-xl font-bold text-xs uppercase">End</button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    );
};

const AdminPopupManager = ({ popups }: { popups: AdminPopup[] }) => {
    const [content, setContent] = useState('');
    const [active, setActive] = useState(true);

    const handleCreate = async () => {
        if(!content) return;
        await addDoc(collection(db, 'popups'), {
            content, active,
            displayIntervalSeconds: 180,
            imageUrl: `https://picsum.photos/seed/${content.slice(0, 5)}/400/300`,
            createdAt: serverTimestamp()
        });
        setContent('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-1 bg-white dark:bg-[#0a0a0a] p-10 rounded-[40px] border border-gray-200 dark:border-white/5 h-fit sticky top-32">
                <h3 className="font-display font-black text-xl dark:text-white mb-8">Deploy Pop-up</h3>
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-3">Call to Action</label>
                        <textarea 
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full h-40 bg-gray-50 dark:bg-white/5 rounded-2xl p-6 outline-none dark:text-white font-medium resize-none border-2 border-transparent focus:border-blue-600/20"
                            placeholder="Special offer for readers..."
                        />
                    </div>
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-white/5 p-4 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-gray-400">Initial State</span>
                        <button 
                            onClick={() => setActive(!active)}
                            className={`w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-blue-600' : 'bg-gray-400'}`}
                        >
                            <motion.div 
                                animate={{ x: active ? 24 : 4 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full" 
                            />
                        </button>
                    </div>
                    <button 
                        onClick={handleCreate}
                        className="w-full h-16 bg-blue-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all hover:translate-y-[-2px]"
                    >
                        Inject into Stream
                    </button>
                </div>
            </div>
            
            <div className="lg:col-span-2 space-y-8">
                 {popups.map(p => (
                     <div key={p.id} className="bg-white dark:bg-[#0a0a0a] p-8 rounded-[40px] border border-gray-200 dark:border-white/5 flex gap-8 align-center">
                         <div className="w-40 h-32 rounded-3xl overflow-hidden flex-shrink-0 bg-gray-100">
                             <img src={p.imageUrl} className="w-full h-full object-cover" />
                         </div>
                         <div className="flex-1">
                             <div className="flex items-center justify-between mb-2">
                                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full ${p.active ? 'bg-emerald-600/10 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                    {p.active ? 'Broadcasting' : 'Inactive'}
                                </span>
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-mono">Interval: {p.displayIntervalSeconds}s</span>
                             </div>
                             <p className="text-xl font-black dark:text-white line-clamp-2">{p.content}</p>
                             
                             <div className="flex gap-4 mt-6">
                                <button className="text-xs font-black text-blue-600 uppercase tracking-widest">Update Settings</button>
                                <button className="text-xs font-black text-red-600 uppercase tracking-widest">Destroy</button>
                             </div>
                         </div>
                     </div>
                 ))}
                 {popups.length === 0 && (
                     <div className="h-64 rounded-[40px] bg-white dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center">
                         <Monitor className="text-gray-300 mb-4" size={48} />
                         <p className="text-sm font-bold text-gray-400">No pop-ups currently active in network</p>
                     </div>
                 )}
            </div>
        </div>
    );
};

const AdminStoryManager = ({ posts }: { posts: NewsItem[] }) => {
    const stories = posts.filter(p => p.category === 'Entertainment');
    return (
        <div className="space-y-8">
             <div className="bg-blue-600 p-10 rounded-[40px] text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="font-display font-black text-3xl mb-2 tracking-tighter">Live Pulse Monitoring</h3>
                    <p className="text-white/60 font-medium max-w-lg">Manage real-time news stories appearing in the readers Top Rail. Ensure visual consistency and content quality.</p>
                </div>
                <Zap className="absolute right-[-20px] top-[-20px] text-white/5 w-64 h-64" />
             </div>

             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                 {stories.map(s => (
                    <div key={s.id} className="group relative aspect-[9/16] rounded-3xl overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all cursor-pointer shadow-xl">
                        <img src={s.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
                        <div className="absolute bottom-4 left-4 right-4">
                             <p className="text-[10px] font-black text-white leading-tight line-clamp-2 uppercase tracking-tighter">{s.title}</p>
                        </div>
                    </div>
                 ))}
                 <button className="aspect-[9/16] rounded-3xl bg-gray-100 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:bg-gray-200 transition-all">
                    <Plus size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Inject Pulse</span>
                 </button>
             </div>
        </div>
    );
};

export default AdminPanel;
