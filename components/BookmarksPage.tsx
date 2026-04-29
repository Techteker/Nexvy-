import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, BookMarked, ChevronRight, Clock } from 'lucide-react';
import { NewsItem } from '../types';

interface BookmarksPageProps {
  bookmarks: NewsItem[];
  onRemove: (id: string) => void;
  onArticleClick: (item: NewsItem) => void;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ bookmarks, onRemove, onArticleClick }) => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#000000] pb-32">
       {/* Sticky Header */}
       <div className="sticky top-0 z-20 glass border-b border-white/20 dark:border-white/5 px-8 py-6 mb-8">
         <motion.h1 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight"
         >
           Library
         </motion.h1>
         <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xs font-bold text-gray-500 dark:text-white/30 uppercase tracking-[0.2em] mt-2 font-display"
         >
           {bookmarks.length} Curated Stories
         </motion.p>
      </div>

      <div className="px-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {bookmarks.length === 0 ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center h-[60vh] text-center"
             >
                <div className="w-24 h-24 bg-gray-100 dark:bg-white/5 rounded-[32px] flex items-center justify-center mb-8 border border-white/10 shadow-xl shadow-black/5">
                   <BookMarked size={36} className="text-gray-400 dark:text-white/20" />
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">No Saved Wisdom</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-white/40 max-w-xs mx-auto leading-relaxed">
                  The insights you find will wait for you here. Tap the bookmark icon to start building your library.
                </p>
             </motion.div>
          ) : (
            bookmarks.map((item, index) => (
              <motion.div 
                key={item.id} 
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="group relative glass border border-white/20 dark:border-white/5 p-6 rounded-[32px] shadow-xl shadow-black/5 hover:shadow-2xl hover:shadow-black/10 transition-all cursor-pointer flex gap-6"
                onClick={() => onArticleClick(item)}
              >
                <div className="w-28 h-28 rounded-[24px] bg-gray-100 dark:bg-gray-800 flex-shrink-0 overflow-hidden shadow-lg">
                  <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest font-display">{item.category}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20" />
                        <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">{item.sourceName}</span>
                     </div>
                     <h3 className="font-display font-bold text-lg md:text-xl text-gray-900 dark:text-white line-clamp-2 leading-[1.3] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                       {item.title}
                     </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">
                    <Clock size={10} />
                    Saved recently
                  </div>
                </div>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                  className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-full text-rose-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={18} />
                </motion.button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookmarksPage;
