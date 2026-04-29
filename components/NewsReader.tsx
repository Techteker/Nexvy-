import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NewsItem } from '../types';
import { generateSpeech } from '../services/geminiService';
import { ArrowLeft, Share2, Volume2, StopCircle, Clock, ExternalLink, Loader2, Bookmark, ChevronUp, ChevronDown } from 'lucide-react';

interface NewsReaderProps {
  items: NewsItem[];
  initialIndex: number;
  onClose: () => void;
  onBookmark: (item: NewsItem) => void;
  isBookmarked: (item: NewsItem) => boolean;
}

// Helper: Decode Audio
async function decodeAudioData(base64: string, ctx: AudioContext): Promise<AudioBuffer> {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const numChannels = 1;
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
    }
    return buffer;
}

const NewsReader: React.FC<NewsReaderProps> = ({ items, initialIndex, onClose, onBookmark, isBookmarked }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [audioState, setAudioState] = useState<'idle' | 'loading' | 'playing'>('idle');
  const [direction, setDirection] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const currentItem = items[currentIndex];
  const bookmarked = isBookmarked(currentItem);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  useEffect(() => {
    stopAudio();
  }, [currentIndex]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try { sourceNodeRef.current.stop(); } catch(e){}
      sourceNodeRef.current = null;
    }
    setAudioState('idle');
  };

  const handleTTS = async () => {
    if (audioState === 'playing') {
      stopAudio();
      return;
    }
    
    setAudioState('loading');
    try {
        const base64 = await generateSpeech(currentItem.summary);
        if (!base64) throw new Error("No audio data");

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        const buffer = await decodeAudioData(base64, ctx);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setAudioState('idle');
        
        sourceNodeRef.current = source;
        source.start();
        setAudioState('playing');
    } catch (e) {
        console.error(e);
        setAudioState('idle');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: currentItem.title,
                text: currentItem.summary,
                url: currentItem.fullStoryUrl
            });
        } catch (e) {}
    }
  };

  const paginate = (newDirection: number) => {
    if (currentIndex + newDirection >= 0 && currentIndex + newDirection < items.length) {
      setDirection(newDirection);
      setCurrentIndex(currentIndex + newDirection);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] dark:bg-[#000000] flex flex-col overflow-hidden">
      
      {/* Immersive Background Image (Blurred) */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
           key={`bg-${currentIndex}`}
           custom={direction}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           transition={{ duration: 1 }}
           className="absolute inset-0 z-0"
        >
          <img src={currentItem.imageUrl} className="w-full h-full object-cover opacity-20 blur-[80px]" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/40 dark:via-black/40 to-white dark:to-black" />
        </motion.div>
      </AnimatePresence>

      {/* Top Navbar */}
      <div className="relative z-20 px-6 pt-12 pb-6 flex justify-between items-center">
         <motion.button 
           whileTap={{ scale: 0.9 }}
           onClick={onClose} 
           className="w-12 h-12 flex items-center justify-center glass border border-white/20 rounded-[18px] text-gray-900 dark:text-white shadow-xl shadow-black/5"
         >
             <ArrowLeft size={22} />
         </motion.button>
         
         <div className="flex gap-3">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => onBookmark(currentItem)}
              className={`w-12 h-12 flex items-center justify-center glass border border-white/20 rounded-[18px] transition-all shadow-xl shadow-black/5 ${bookmarked ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}
            >
                <Bookmark size={22} fill={bookmarked ? "currentColor" : "none"} />
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-12 h-12 flex items-center justify-center glass border border-white/20 rounded-[18px] text-gray-900 dark:text-white shadow-xl shadow-black/5"
            >
                <Share2 size={22} />
            </motion.button>
         </div>
      </div>

      {/* Slide Container */}
      <div className="flex-1 relative z-10 p-6 flex flex-col justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div 
            key={currentIndex}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ y: dir > 0 ? 500 : -500, opacity: 0, scale: 0.9 }),
              center: { y: 0, opacity: 1, scale: 1 },
              exit: (dir: number) => ({ y: dir > 0 ? -500 : 500, opacity: 0, scale: 0.9 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full max-w-xl mx-auto space-y-8"
          >
            {/* Visual Card */}
            <div className="relative w-full aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl group">
               <img src={currentItem.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="News" />
               <div className="absolute inset-x-4 top-4 flex gap-2">
                 <span className="px-5 py-2 glass border border-white/20 rounded-full font-display font-bold text-[11px] uppercase tracking-widest text-white shadow-xl shadow-black/20">
                   {currentItem.category}
                 </span>
               </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6">
               <motion.h1 
                 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
               >
                   {currentItem.title}
               </motion.h1>

               <motion.div 
                 className="flex items-center gap-4 py-1"
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
               >
                  <div className="w-8 h-8 rounded-full border border-gray-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <img src={`https://picsum.photos/seed/${currentItem.sourceName}/100`} className="w-full h-full object-cover" />
                  </div>
                  <span className="font-display font-bold text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400">
                    {currentItem.sourceName}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
                  <span className="text-xs font-bold text-gray-400 dark:text-white/40 uppercase tracking-widest font-display">
                    {currentItem.publishedTime}
                  </span>
               </motion.div>

               <motion.div 
                 className="prose dark:prose-invert max-w-none"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
               >
                 <p className="text-xl md:text-2xl text-gray-700 dark:text-white/70 leading-[1.4] font-medium tracking-tight">
                    {currentItem.summary}
                 </p>
               </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-20 px-6 pb-12 pt-6 flex justify-between items-center max-w-xl mx-auto w-full">
         <div className="flex flex-col gap-1 items-center">
           <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display">Story {currentIndex + 1} of {items.length}</span>
           <div className="flex gap-1">
             {items.map((_, idx) => (
                <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-4 bg-gray-900 dark:bg-white' : 'w-1 bg-gray-200 dark:bg-white/10'}`} />
             ))}
           </div>
         </div>

         <div className="flex gap-4">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={handleTTS}
              disabled={audioState === 'loading'}
              className={`w-14 h-14 flex items-center justify-center glass border border-white/20 rounded-[22px] shadow-2xl transition-all ${audioState === 'playing' ? 'text-rose-500 shadow-rose-500/20' : 'text-gray-900 dark:text-white shadow-black/5'}`}
            >
              <AnimatePresence mode="wait">
                {audioState === 'loading' ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Loader2 size={24} className="animate-spin" />
                  </motion.div>
                ) : audioState === 'playing' ? (
                  <motion.div key="stop" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <StopCircle size={24} />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}>
                    <Volume2 size={24} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.a 
              whileTap={{ scale: 0.9 }}
              href={currentItem.fullStoryUrl}
              target="_blank"
              rel="noreferrer"
              className="px-8 flex items-center justify-center glass border border-white/20 rounded-[22px] text-sm font-display font-bold uppercase tracking-widest text-gray-900 dark:text-white shadow-2xl shadow-black/5"
            >
              Read Full <ExternalLink size={14} className="ml-2" />
            </motion.a>
         </div>
      </div>

      {/* Swipe Nav (Floating Overlay) */}
      <div className="absolute inset-y-0 right-0 w-20 flex flex-col items-center justify-center gap-6 z-30 pointer-events-none opacity-0 hover:opacity-100 transition-opacity pr-4">
        <button 
          onClick={() => paginate(-1)} 
          className="pointer-events-auto p-4 glass border border-white/20 rounded-full text-gray-900 dark:text-white/40 disabled:opacity-0 transition-all hover:text-white"
          disabled={currentIndex === 0}
        >
          <ChevronUp size={24} />
        </button>
        <button 
          onClick={() => paginate(1)} 
          className="pointer-events-auto p-4 glass border border-white/20 rounded-full text-gray-900 dark:text-white/40 disabled:opacity-0 transition-all hover:text-white"
          disabled={currentIndex === items.length - 1}
        >
          <ChevronDown size={24} />
        </button>
      </div>

    </div>
  );
};

export default NewsReader;
