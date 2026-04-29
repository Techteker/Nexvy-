import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, TrendingUp, ChevronRight, Hash } from 'lucide-react';
import { NewsItem } from '../types';
import { NewsListItem } from './DashboardWidgets';

interface SearchPageProps {
  onArticleClick: (item: NewsItem) => void;
  allNews: NewsItem[];
}

const SearchPage: React.FC<SearchPageProps> = ({ onArticleClick, allNews }) => {
  const [query, setQuery] = useState('');
  const tags = ['Quantum Intelligence', 'Web3 Markets', 'Sustainable Cities', 'Mars Bio-Tech', 'Deep Sea Ethics'];
  
  const filteredNews = query 
    ? allNews.filter(n => n.title.toLowerCase().includes(query.toLowerCase()) || n.category.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#000000] pb-32">
      
      {/* Immersive Search Header */}
      <div className="sticky top-0 z-20 glass border-b border-white/20 dark:border-white/5 px-8 pt-12 pb-8 mb-8">
         <motion.h1 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-8"
         >
           Discover
         </motion.h1>
         <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Topics, people, or places..."
              className="w-full bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white pl-14 pr-6 h-[64px] rounded-[24px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-display font-bold text-sm tracking-wide"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
         </div>
      </div>

      <div className="px-8 flex flex-col gap-12">
        <AnimatePresence mode="wait">
          {query ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display">
                  {filteredNews.length} Matches Found
                </h3>
                <button onClick={() => setQuery('')} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest font-display">Clear Search</button>
              </div>

              {filteredNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.map((item, idx) => (
                    <NewsListItem key={item.id} item={item} onClick={() => onArticleClick(item)} index={idx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-32 space-y-4">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-50">
                    <Search size={32} />
                  </div>
                  <p className="text-gray-500 font-medium">No matches found for "{query}"</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="trending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Trending Tags Section */}
              <section>
                 <div className="flex items-center gap-3 mb-8">
                   <TrendingUp size={18} className="text-blue-600" />
                   <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] font-display">Viral Pulses</h3>
                 </div>
                 <div className="flex flex-wrap gap-3">
                   {tags.map((tag, idx) => (
                     <motion.button 
                      key={tag}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setQuery(tag)}
                      className="px-6 py-3 glass border border-white/20 dark:border-white/5 rounded-[18px] text-[11px] font-display font-bold uppercase tracking-widest text-gray-700 dark:text-white/60 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                     >
                       #{tag}
                     </motion.button>
                   ))}
                 </div>
              </section>

              {/* Genre Grid */}
              <section>
                <h3 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] font-display mb-8">Exclusive Collections</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { name: 'Elite Tech', color: 'from-blue-600 to-indigo-700', icon: 'zap' },
                     { name: 'Global Finance', color: 'from-emerald-500 to-teal-700', icon: 'trending-up' },
                     { name: 'Deep Culture', color: 'from-rose-500 to-orange-600', icon: 'heart' },
                     { name: 'Pure Science', color: 'from-purple-600 to-violet-700', icon: 'activity' }
                   ].map((cat, i) => (
                     <motion.div 
                       key={cat.name} 
                       whileHover={{ y: -8 }}
                       onClick={() => setQuery(cat.name.split(' ')[1] || cat.name)}
                       className="relative aspect-[10/12] rounded-[32px] overflow-hidden cursor-pointer group shadow-xl shadow-black/5"
                     >
                        <img 
                          src={`https://picsum.photos/seed/${cat.name}/600/800`} 
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100" 
                          alt={cat.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 p-6 flex flex-col justify-end">
                           <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-display mb-1">Explore</span>
                           <h4 className="text-white font-display font-bold text-lg leading-tight">{cat.name}</h4>
                        </div>
                     </motion.div>
                   ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;
