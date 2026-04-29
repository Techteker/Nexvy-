import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem, Poll, Category } from '../types';
import { Briefcase, Film, Heart, Coffee, Globe, Landmark, Clock, ChevronRight, Share2, Bookmark } from 'lucide-react';

const springTransition = { type: 'spring', stiffness: 300, damping: 30 };

// --- Hero Card ---
export const HeroCard: React.FC<{ item: NewsItem; onClick: () => void }> = ({ item, onClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
    onClick={onClick}
    className="group relative w-full aspect-[16/10] rounded-[48px] overflow-hidden cursor-pointer shadow-2xl shadow-black/10"
  >
    <motion.img 
      src={item.imageUrl} 
      alt={item.title} 
      className="absolute inset-0 w-full h-full object-cover"
      whileHover={{ scale: 1.08 }}
      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
    <div className="absolute bottom-0 left-0 p-10 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 mb-6"
      >
        <span className="px-5 py-2 text-[10px] font-bold bg-white text-black rounded-full tracking-[0.2em] uppercase font-display shadow-xl">
          {item.category}
        </span>
        <span className="text-white/70 text-[10px] font-display font-bold uppercase tracking-widest flex items-center glass px-4 py-2 rounded-full border border-white/10">
           <Clock size={12} className="mr-2" /> {item.publishedTime}
        </span>
      </motion.div>
      <h2 className="text-white font-display font-bold text-3xl md:text-5xl leading-[1.05] mb-2 tracking-tight transition-all group-hover:tracking-tighter duration-700">
        {item.title}
      </h2>
    </div>
  </motion.div>
);

// --- List Item ---
export const NewsListItem: React.FC<{ item: NewsItem; onClick: () => void }> = ({ item, onClick }) => (
  <motion.div 
    whileTap={{ scale: 0.98 }}
    transition={springTransition}
    onClick={onClick}
    className="flex items-center gap-6 group cursor-pointer py-8 border-b border-gray-100 dark:border-white/5 active:opacity-70 transition-opacity"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] font-display">
          {item.sourceName}
        </span>
        <span className="w-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full" />
        <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">{item.publishedTime}</span>
      </div>
      <h3 className="font-display font-bold text-xl md:text-2xl leading-tight text-gray-900 dark:text-white line-clamp-2 transition-all group-hover:text-blue-600 dark:group-hover:text-blue-400">
        {item.title}
      </h3>
    </div>
    <div className="w-28 h-28 flex-shrink-0 rounded-[36px] overflow-hidden bg-gray-100 dark:bg-white/5 relative shadow-lg group-hover:shadow-2xl transition-all duration-500">
      <img src={item.imageUrl} alt="thumb" className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
    </div>
  </motion.div>
);

// --- Category Grid ---
export const CategoryGrid: React.FC = () => {
  const categories = [
    { label: Category.Business, icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: Category.Entertainment, icon: Film, color: 'text-fuchsia-600', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
    { label: Category.Health, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: Category.Lifestyle, icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: Category.Politics, icon: Landmark, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: Category.Science, icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  ];

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6 px-1">
        <h3 className="font-display font-bold text-2xl text-gray-900 dark:text-white">Discover</h3>
        <button className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">View All</button>
      </div>
      <div className="grid grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <motion.div 
            key={cat.label} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="flex flex-col items-center gap-3 cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-300 ${cat.bg} group-hover:scale-110 shadow-sm group-hover:shadow-indigo-500/20`}>
              <cat.icon size={22} className={cat.color} />
            </div>
            <span className="text-[11px] font-bold text-gray-500 dark:text-white/50 uppercase tracking-wider font-display">{cat.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Story Rail ---
export const StoryRail: React.FC<{ items: NewsItem[], onClick: (idx: number) => void }> = ({ items, onClick }) => (
  <div className="flex overflow-x-auto gap-6 pb-8 -mx-8 px-8 hide-scrollbar">
    {items.map((item, idx) => (
      <motion.div 
        key={item.id} 
        initial={{ opacity: 0, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ y: -8 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onClick(idx)}
        className="group w-40 flex-shrink-0 aspect-[9/16] relative rounded-[40px] overflow-hidden cursor-pointer shadow-2xl transition-all"
      >
        <img 
          src={item.imageUrl} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt="story" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        <div className="absolute top-4 left-4 w-12 h-12 rounded-[18px] border-2 border-white overflow-hidden shadow-2xl">
           <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${item.sourceName}`} className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-6 left-4 right-4 text-center">
           <p className="text-[9px] font-bold text-white line-clamp-2 leading-tight font-display tracking-[0.2em] uppercase">
             {item.sourceName}
           </p>
        </div>
      </motion.div>
    ))}
  </div>
);

// --- Poll Widget ---
export const PollWidget: React.FC<{ poll: Poll, userId?: string, onVote?: (idx: number) => void }> = ({ poll, userId, onVote }) => {
    const [voted, setVoted] = React.useState<number | null>(poll.userVoted ?? null);

    const handleVote = (idx: number) => {
        if (voted !== null) return;
        setVoted(idx);
        if (onVote) onVote(idx);
    };

    return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[48px] p-10 overflow-hidden group bg-gray-900 border border-white/5 shadow-2xl"
        >
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -mr-40 -mt-40 transition-colors group-hover:bg-blue-600/20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] -ml-40 -mb-40 transition-colors group-hover:bg-purple-600/20" />
            
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mb-6 font-display relative z-10">Global Pulse</p>
            
            <h4 className="font-display font-bold text-3xl mb-12 relative z-10 leading-[1.2] text-white tracking-tight">
                {poll.question}
            </h4>
            
            <div className="space-y-6 relative z-10">
                {poll.options.map((opt, idx) => {
                    const isSelected = voted === idx;
                    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.votes, 0);
                    const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;

                    return (
                        <motion.button 
                            key={idx}
                            whileTap={voted === null ? { scale: 0.98 } : {}}
                            onClick={() => handleVote(idx)}
                            disabled={voted !== null}
                            className={`
                                w-full h-[72px] px-8 rounded-[24px] text-sm font-bold transition-all relative overflow-hidden text-left flex justify-between items-center group/btn
                                ${isSelected 
                                    ? 'bg-white text-black' 
                                    : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/5'}
                            `}
                        >
                            <span className="relative z-20 font-display uppercase tracking-[0.2em] text-[11px]">{opt.label}</span>
                            <AnimatePresence>
                              {voted !== null && (
                                  <motion.span 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`relative z-20 font-display font-black text-lg ${isSelected ? 'text-black' : 'text-white'}`}
                                  >
                                    {percent}%
                                  </motion.span>
                              )}
                            </AnimatePresence>
                            {voted !== null && (
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                    className={`absolute inset-0 z-10 transition-colors ${isSelected ? 'bg-black/5' : 'bg-white/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)]'}`}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </div>
            <div className="mt-10 text-[10px] text-white/20 font-bold uppercase tracking-[0.3em] text-center relative z-10 font-display">
                {voted !== null ? 'Insights Synchronized' : 'Analyze Perception'}
            </div>
        </motion.div>
    )
}

// --- Skeleton Loader ---
export const SkeletonLoader = () => (
  <div className="px-8 space-y-12 max-w-lg mx-auto pb-32">
    <div className="w-full flex justify-between items-center pt-8">
      <div className="w-48 h-10 bg-gray-200 dark:bg-white/5 rounded-full animate-pulse" />
      <div className="w-12 h-12 bg-gray-200 dark:bg-white/5 rounded-[22px] animate-pulse" />
    </div>
    <div className="w-full aspect-[16/10] bg-gray-200 dark:bg-white/5 rounded-[48px] animate-pulse" />
    <div className="space-y-8">
      {[1, 2].map((i) => (
        <div key={i} className="flex gap-6 py-8 border-b border-gray-100 dark:border-white/5">
          <div className="flex-1 space-y-4">
             <div className="w-32 h-3 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
             <div className="w-full h-5 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
             <div className="w-2/3 h-5 bg-gray-200 dark:bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="w-28 h-28 bg-gray-200 dark:bg-white/5 rounded-[36px] animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);
