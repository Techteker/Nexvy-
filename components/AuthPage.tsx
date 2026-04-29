import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Loader2, Github, Sparkles } from 'lucide-react';
import { User } from '../types';
import { loginWithGoogle } from '../services/firebase';

interface AuthPageProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginWithGoogle();
      onLoginSuccess(user);
      onClose();
    } catch (error) {
      console.error("Google login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now we prefer social login, fallback to simple success for demo if needed
    handleGoogleLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-xl" 
        onClick={onClose}
      />

      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-[48px] shadow-2xl overflow-hidden border border-white/20 dark:border-white/5"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-white/10 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-all z-20"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="p-10 pt-12 text-center space-y-3">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20 mb-6">
                <Sparkles size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-500 dark:text-white/40 text-sm font-medium">
                {isLogin ? 'Unlock your premium news experience' : 'Join the elite gathering of thinkers'}
            </p>
        </div>

        {/* Action Body */}
        <div className="px-10 pb-12">
            {/* Nav Tabs */}
            <div className="flex bg-gray-100 dark:bg-white/5 p-1.5 rounded-[22px] mb-8">
                <button 
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-[18px] transition-all font-display ${isLogin ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-md' : 'text-gray-500 dark:text-white/30'}`}
                >
                    Login
                </button>
                <button 
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest rounded-[18px] transition-all font-display ${!isLogin ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-md' : 'text-gray-500 dark:text-white/30'}`}
                >
                    Join
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                    {!isLogin && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-1.5 overflow-hidden"
                        >
                            <label className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2 font-display">Full Name</label>
                            <div className="relative">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text" 
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="your name"
                                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[22px] h-[58px] pl-14 pr-6 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2 font-display">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@proxima.com"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[22px] h-[58px] pl-14 pr-6 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] ml-2 font-display">Security Key</label>
                    <div className="relative">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-[22px] h-[58px] pl-14 pr-6 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-display font-bold uppercase tracking-[0.2em] text-xs h-[58px] rounded-[22px] shadow-xl shadow-black/10 dark:shadow-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                        <>
                           {isLogin ? 'Authorize Access' : 'Create Identity'}
                           <ArrowRight size={18} />
                        </>
                    )}
                </motion.button>
            </form>

            <div className="mt-10 flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
                <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] font-display">Social Gateways</span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-white/5" />
            </div>

            <div className="mt-8 flex gap-4">
                <motion.button 
                    whileHover={{ y: -2 }} 
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="flex-1 h-[52px] flex items-center justify-center gap-3 border border-gray-100 dark:border-white/5 rounded-[20px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-white/60 font-display">Google</span>
                </motion.button>
                <motion.button whileHover={{ y: -2 }} className="flex-1 h-[52px] flex items-center justify-center gap-3 border border-gray-100 dark:border-white/5 rounded-[20px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                     <Github size={20} className="text-gray-900 dark:text-white" />
                     <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600 dark:text-white/60 font-display">GitHub</span>
                </motion.button>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
