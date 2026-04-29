import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  BarChart2, 
  DollarSign, 
  Plus, 
  FileText, 
  Edit3, 
  Trash2, 
  Eye, 
  CheckCircle,
  Image as ImageIcon,
  Loader2,
  TrendingUp,
  Award,
  Sparkles,
  Zap,
  LayoutDashboard,
  Wallet,
  Settings as SettingsIcon,
  ChevronRight,
  Crown
} from 'lucide-react';
import { User, NewsItem, Category } from '../types';
import { db, saveNews } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface CreatorDashboardProps {
  user: User;
  onBack: () => void;
  onUpdateRole: (role: 'creator') => void;
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ user, onBack, onUpdateRole }) => {
  const [view, setView] = useState<'dashboard' | 'editor' | 'monetization'>('dashboard');
  const [posts, setPosts] = useState<NewsItem[]>([]);
  const [editingPost, setEditingPost] = useState<NewsItem | null>(null);

  useEffect(() => {
    if (user.role !== 'creator') return;

    const q = query(
      collection(db, 'news'),
      where('authorId', '==', user.id),
      orderBy('publishedTime', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
      setPosts(news);
    }, (error) => {
        console.error("News snapshot error:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // If user is not yet a creator, show onboarding
  if (user.role !== 'creator') {
      return <CreatorOnboarding onJoin={() => onUpdateRole('creator')} onBack={onBack} />;
  }

  const handleSavePost = async (post: NewsItem) => {
      try {
          await saveNews(post, user.id);
          setView('dashboard');
          setEditingPost(null);
      } catch (err) {
          console.error("Failed to save post", err);
      }
  };

  const handleDeletePost = async (id: string) => {
      if (confirm('Permanently delete this dispatch?')) {
          try {
              await deleteDoc(doc(db, 'news', id));
          } catch (err) {
              console.error("Failed to delete post", err);
          }
      }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#000000] pb-32">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-40 glass border-b border-white/20 dark:border-white/5 px-8 py-6 flex items-center justify-between">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={view === 'dashboard' ? onBack : () => setView('dashboard')} 
              className="w-12 h-12 flex items-center justify-center glass border border-white/20 rounded-[18px] text-gray-900 dark:text-white shadow-xl shadow-black/5"
            >
                <ArrowLeft size={22} />
            </motion.button>
            
            <h1 className="font-display font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                {view === 'dashboard' ? 'Creator Studio' : view === 'editor' ? 'Post Editor' : 'Monetization'}
            </h1>
            
            <div className="w-12 flex justify-end">
              {view === 'dashboard' && (
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 overflow-hidden shadow-lg">
                  <img src={user.avatar} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
        </div>

        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                  <DashboardView 
                      posts={posts} 
                      onNewPost={() => { setEditingPost(null); setView('editor'); }} 
                      onEditPost={(p) => { setEditingPost(p); setView('editor'); }}
                      onDeletePost={handleDeletePost}
                      onMonetization={() => setView('monetization')}
                      totalEarnings={posts.reduce((acc, p) => acc + (p.earnings || 0), 0)}
                      totalViews={posts.reduce((acc, p) => acc + (p.views || 0), 0)}
                  />
              </motion.div>
          )}

          {view === 'editor' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                  <EditorView 
                      initialData={editingPost} 
                      onSave={handleSavePost} 
                      onCancel={() => setView('dashboard')} 
                  />
              </motion.div>
          )}

          {view === 'monetization' && (
              <motion.div 
                key="monetization"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                  <MonetizationView 
                      onBack={() => setView('dashboard')}
                      earnings={posts.reduce((acc, p) => acc + (p.earnings || 0), 0)}
                  />
              </motion.div>
          )}
        </AnimatePresence>

    </div>
  );
};

// --- Sub Components ---

const CreatorOnboarding: React.FC<{ onJoin: () => void, onBack: () => void }> = ({ onJoin, onBack }) => (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#000000] flex flex-col items-center justify-center p-8 text-center">
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack} 
          className="absolute top-12 left-8 w-12 h-12 flex items-center justify-center glass border border-white/20 rounded-[18px] text-gray-900 dark:text-white"
        >
            <ArrowLeft size={22} />
        </motion.button>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-28 h-28 bg-blue-600 rounded-[36px] flex items-center justify-center mb-10 shadow-2xl shadow-blue-600/30"
        >
            <Sparkles size={48} className="text-white" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-display font-bold text-gray-900 dark:text-white mb-4 tracking-tight leading-[1.1]"
        >
          Amplify Your Voice
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 dark:text-white/40 mb-12 max-w-sm font-medium leading-relaxed"
        >
          Join the elite circle of Proxima Creators. Turn your insights into global narratives and unlock premium revenue streams.
        </motion.p>
        
        <div className="grid grid-cols-1 gap-6 w-full max-w-md mb-12">
            {[
                { icon: Award, text: 'Prestigious Reach', sub: 'Shared by millions globally' },
                { icon: TrendingUp, text: 'Real-time Analytics', sub: 'Deep audience insights' },
                { icon: Wallet, text: 'Direct Monetization', sub: 'Earn on every premium view' }
            ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + (i * 0.1) }}
                  className="flex items-center gap-6 p-6 glass border border-white/20 dark:border-white/5 rounded-[32px] shadow-xl shadow-black/5"
                >
                    <div className="w-12 h-12 rounded-[18px] bg-blue-600/10 flex items-center justify-center text-blue-600">
                        <item.icon size={22} />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-bold text-sm text-gray-900 dark:text-white block tracking-tight">{item.text}</span>
                      <span className="text-xs font-medium text-gray-400 dark:text-white/20">{item.sub}</span>
                    </div>
                </motion.div>
            ))}
        </div>

        <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onJoin}
            className="w-full max-w-md h-[72px] bg-gray-900 dark:bg-white text-white dark:text-black font-display font-bold uppercase tracking-[0.2em] text-xs rounded-[28px] shadow-2xl flex items-center justify-center gap-3"
        >
            Enter Studio <ChevronRight size={18} />
        </motion.button>
    </div>
);

const DashboardView: React.FC<any> = ({ posts, onNewPost, onEditPost, onDeletePost, onMonetization, totalEarnings, totalViews }) => (
    <div className="px-8 space-y-12 pb-12">
        
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative glass border border-white/20 dark:border-white/5 p-8 rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform"><BarChart2 size={80} /></div>
                <p className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display mb-4">Pulse Impact</p>
                <h3 className="text-5xl font-display font-bold text-gray-900 dark:text-white tracking-tight">{totalViews.toLocaleString()}</h3>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-emerald-500 font-display">
                  <TrendingUp size={14} /> +12% this week
                </div>
            </div>

            <div 
                onClick={onMonetization}
                className="group relative bg-[#0F172A] p-8 rounded-[40px] shadow-2xl shadow-black/20 cursor-pointer overflow-hidden border border-white/5 active:scale-[0.98] transition-all"
            >
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform text-emerald-400"><DollarSign size={80} /></div>
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] font-display mb-4">Total Revenue</p>
                <h3 className="text-5xl font-display font-bold text-white tracking-tight">${totalEarnings.toFixed(2)}</h3>
                <div className="mt-6 flex items-center gap-3">
                  <span className="px-5 py-2 glass border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest font-display">Open Wallet</span>
                </div>
            </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between pt-4">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white tracking-tight">Recent Dispatches</h2>
            <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onNewPost}
                className="w-14 h-14 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-[22px] flex items-center justify-center shadow-2xl shadow-black/10 transition-all"
            >
                <Plus size={24} />
            </motion.button>
        </div>

        {/* Dispatches List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.length === 0 ? (
                <div className="col-span-full text-center py-24 space-y-4 opacity-50">
                    <FileText size={48} className="mx-auto" />
                    <p className="font-display font-bold text-lg">Your canvas is blank. Start the dispatch.</p>
                </div>
            ) : (
                posts.map((post: NewsItem) => (
                    <motion.div 
                      key={post.id} 
                      layout
                      className="group relative glass border border-white/20 dark:border-white/5 p-8 rounded-[40px] shadow-xl shadow-black/5 flex flex-col gap-8"
                    >
                        <div className="flex gap-6">
                          <div className="w-24 h-24 rounded-[28px] overflow-hidden flex-shrink-0 shadow-lg group-hover:shadow-2xl transition-all duration-700">
                              <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="thumb" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                  <div className="flex items-center gap-2 mb-2">
                                     <span className={`px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest font-display ${post.status === 'published' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}`}>
                                          {post.status || 'Draft'}
                                     </span>
                                     <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">{post.category}</span>
                                  </div>
                                  <h3 className="font-display font-bold text-gray-900 dark:text-white text-lg leading-[1.3] line-clamp-2">{post.title}</h3>
                              </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-white/5">
                           <div className="flex items-center gap-6">
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest font-display">Readers</span>
                                <span className="font-display font-bold text-sm text-gray-900 dark:text-white">{post.views.toLocaleString()}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest font-display">Revenue</span>
                                <span className="font-display font-bold text-sm text-emerald-500">${post.earnings.toFixed(2)}</span>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => onEditPost(post)} className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600/10 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg shadow-blue-600/5">
                                <Edit3 size={16} />
                             </button>
                             <button onClick={() => onDeletePost(post.id)} className="w-10 h-10 flex items-center justify-center rounded-full bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all shadow-lg shadow-rose-600/5">
                                <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    </div>
);

const EditorView: React.FC<{ initialData?: NewsItem | null, onSave: (p: NewsItem) => void, onCancel: () => void }> = ({ initialData, onSave, onCancel }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [summary, setSummary] = useState(initialData?.summary || '');
    const [category, setCategory] = useState(initialData?.category || Category.General);
    const [loading, setLoading] = useState(false);

    const wordCount = summary.trim().split(/\s+/).filter(w => w.length > 0).length;
    const isOverLimit = wordCount > 60;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const newItem: NewsItem = {
            id: initialData?.id || `post-${Date.now()}`,
            title,
            summary,
            category,
            sourceName: 'Proxima Creator',
            fullStoryUrl: '#',
            publishedTime: new Date().toISOString(),
            imageUrl: `https://picsum.photos/seed/${title.slice(0, 10)}/800/600`,
            status: 'published',
            views: initialData?.views || 0,
            earnings: initialData?.earnings || 0
        };
        onSave(newItem);
    };

    return (
        <div className="px-8 pt-8 space-y-12 max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                
                {/* Immersive Cover Upload */}
                <div className="group relative w-full aspect-[21/9] glass dark:bg-white/5 rounded-[48px] border-2 border-dashed border-white/20 dark:border-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all hover:border-blue-600/40">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon size={32} className="text-gray-400 mb-4 group-hover:scale-110 group-hover:text-blue-600 transition-all" />
                    <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display">Define Cover Visual</span>
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">The Headline</label>
                    <input 
                        required
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Type a narrative punch..."
                        className="w-full bg-transparent border-none text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-white focus:outline-none placeholder:text-gray-100 dark:placeholder:text-white/5 leading-tight tracking-tight"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between px-2">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display">Narrative Dispatch (Max 60 Words)</label>
                        <span className={`text-[10px] font-bold font-display uppercase tracking-widest ${isOverLimit ? 'text-rose-500' : 'text-gray-400'}`}>
                            {wordCount} / 60
                        </span>
                    </div>
                    <textarea 
                        required
                        rows={6}
                        value={summary}
                        onChange={e => setSummary(e.target.value)}
                        placeholder="Synthesize the story with precision. Keep it sharp, keep it impact-focused..."
                        className={`w-full glass border p-8 rounded-[40px] text-xl md:text-2xl font-medium text-gray-800 dark:text-white/70 focus:outline-none transition-all resize-none leading-relaxed tracking-tight ${isOverLimit ? 'border-rose-500/50' : 'border-white/20 dark:border-white/5 focus:border-blue-500/40'}`}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">Context Sector</label>
                    <div className="flex flex-wrap gap-4">
                        {Object.values(Category).slice(0, 8).map(cat => (
                            <button
                                type="button"
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-8 py-3 rounded-full text-[10px] font-display font-bold uppercase tracking-widest transition-all shadow-xl shadow-black/5 ${category === cat ? 'bg-blue-600 text-white' : 'glass border border-white/20 dark:border-white/5 text-gray-500 dark:text-white/30 hover:text-white'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-6 pt-12">
                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        type="button" 
                        onClick={onCancel}
                        className="flex-1 h-[72px] rounded-[28px] font-display font-bold text-xs uppercase tracking-widest text-gray-500 dark:text-white/30 glass border border-white/20 dark:border-white/5"
                    >
                        Discard
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading || isOverLimit}
                        className="flex-[2] h-[72px] bg-gray-900 dark:bg-white text-white dark:text-black font-display font-bold uppercase tracking-widest text-xs rounded-[28px] shadow-2xl disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (initialData ? 'Update Dispatch' : 'Commit to Pulses')}
                    </motion.button>
                </div>

            </form>
        </div>
    );
};

const MonetizationView: React.FC<{ onBack: () => void, earnings: number }> = ({ onBack, earnings }) => (
    <div className="px-8 pt-8 space-y-12">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative bg-[#0F172A] rounded-[48px] p-12 text-white shadow-2xl overflow-hidden"
        >
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mt-20 -mr-20 blur-[100px]" />
             <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] font-display mb-4">Liquidity Balance</p>
             <h2 className="text-7xl font-display font-bold mb-10 tracking-tight">${earnings.toFixed(2)}</h2>
             
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full h-16 bg-white text-black font-display font-bold uppercase tracking-widest text-xs rounded-[22px] shadow-2xl"
             >
                 Transfer to Vault
             </motion.button>
        </motion.div>

        <div className="space-y-6">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">Revenue Segments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Pulse Ad Share', value: '$' + (earnings * 0.7).toFixed(2), icon: LayoutDashboard },
                    { label: 'Premium Royalties', value: '$' + (earnings * 0.3).toFixed(2), icon: Crown }
                ].map(item => (
                    <div key={item.label} className="p-8 glass border border-white/20 dark:border-white/5 rounded-[40px] flex items-center justify-between shadow-xl shadow-black/5">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-[20px] bg-blue-600/5 flex items-center justify-center text-blue-600">
                             <item.icon size={22} />
                           </div>
                           <span className="font-display font-bold text-gray-600 dark:text-white/60 tracking-tight">{item.label}</span>
                        </div>
                        <span className="font-display font-bold text-xl text-emerald-500">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>

        <div className="glass border border-white/20 dark:border-white/5 p-10 rounded-[40px] flex gap-8 items-center shadow-xl shadow-black/5">
             <div className="w-16 h-16 rounded-[24px] bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <CheckCircle size={32} />
             </div>
             <div>
                 <h4 className="font-display font-bold text-xl text-gray-900 dark:text-white tracking-tight">Active Synthesis</h4>
                 <p className="text-sm font-medium text-gray-500 dark:text-white/30 mt-2 leading-relaxed">
                     Your intellect is monetized. Ads and premium sharing are operational across all active dispatches.
                 </p>
             </div>
        </div>
    </div>
);

export default CreatorDashboard;