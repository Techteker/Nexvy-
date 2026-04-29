import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Bell, 
  Globe, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  LogOut,
  Star,
  Zap,
  LayoutDashboard,
  Crown,
  ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { User } from '../types';

interface SettingsPageProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenCreator: () => void;
  onOpenAdmin: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ darkMode, toggleDarkMode, user, onLogin, onLogout, onOpenCreator, onOpenAdmin }) => {
  
  const handleSupportClick = (label: string) => {
    const links: Record<string, string> = {
        'Rate App': 'https://play.google.com/store/apps',
        'Privacy Policy': 'https://example.com/privacy',
        'Help & FAQ': 'https://example.com/help'
    };
    if (links[label]) {
        window.open(links[label], '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#000000] pb-32">
       {/* Sticky Header */}
       <div className="sticky top-0 z-20 glass border-b border-white/20 dark:border-white/5 px-8 py-6 mb-8">
         <motion.h1 
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight"
         >
           Profile
         </motion.h1>
      </div>

      <div className="px-8 space-y-12">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass border border-white/20 dark:border-white/5 p-8 rounded-[40px] shadow-2xl shadow-black/5 overflow-hidden group"
        >
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full -mr-20 -mt-20 blur-3xl" />
           
           <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="relative">
                 <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-blue-600 to-purple-600 p-[3px] shadow-2xl shadow-blue-600/20">
                    <img 
                      src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                      className="w-full h-full rounded-[29px] bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-900 object-cover"
                      alt="Profile" 
                    />
                 </div>
                 {user && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-4 border-white dark:border-gray-900 shadow-xl">
                       <Crown size={14} />
                    </div>
                 )}
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-1">
                <h2 className="font-display font-bold text-2xl text-gray-900 dark:text-white leading-none">
                   {user ? user.name : "Exclusive Guest"}
                </h2>
                <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-[0.2em] font-display">
                   <ShieldCheck size={12} className="text-blue-500" />
                   {user ? user.email : "Access Limited Edition"}
                </div>
              </div>

              {user ? (
                <motion.button 
                   whileTap={{ scale: 0.9 }}
                   onClick={onLogout}
                   className="w-14 h-14 flex items-center justify-center glass border border-white/20 rounded-[22px] text-rose-500 shadow-xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all font-display"
                >
                   <LogOut size={22} />
                </motion.button>
              ) : (
                <motion.button 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={onLogin}
                   className="px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-display font-bold uppercase tracking-[0.2em] rounded-[22px] shadow-2xl shadow-black/10 transition-all"
                >
                   Authenticate
                </motion.button>
              )}
           </div>
        </motion.div>

        {/* Admin Panel Section */}
        {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-6"
            >
               <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">System Core</h3>
               <div 
                 onClick={onOpenAdmin}
                 className="group relative bg-red-600 rounded-[40px] p-8 shadow-2xl shadow-red-600/20 cursor-pointer overflow-hidden border border-white/5 active:scale-[0.98] transition-transform"
               >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-[80px]" />
                   <div className="relative z-10 flex items-center justify-between transition-all group-hover:translate-x-1">
                       <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-red-600 shadow-xl">
                               <ShieldCheck size={28} />
                           </div>
                           <div>
                               <h3 className="font-display font-bold text-xl text-white tracking-tight">Mainframe Access</h3>
                               <p className="text-sm font-medium text-red-100/50 mt-1">Admin Panel & Platform Control</p>
                           </div>
                       </div>
                       <div className="w-12 h-12 flex items-center justify-center glass border border-white/10 rounded-full text-white">
                          <ChevronRight />
                       </div>
                   </div>
               </div>
            </motion.div>
        )}

        {/* Creator Studio Section */}
        {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
               <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">Creator Hub</h3>
               <div 
                 onClick={onOpenCreator}
                 className="group relative bg-[#0F172A] rounded-[40px] p-8 shadow-2xl shadow-black/20 cursor-pointer overflow-hidden border border-white/5 active:scale-[0.98] transition-transform"
               >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-[80px] group-hover:bg-blue-600/20 transition-all" />
                   
                   <div className="relative z-10 flex items-center justify-between">
                       <div className="flex items-center gap-6">
                           <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                               {user.role === 'creator' ? <LayoutDashboard size={28} /> : <Zap size={28} />}
                           </div>
                           <div>
                               <h3 className="font-display font-bold text-xl text-white tracking-tight">{user.role === 'creator' ? 'Studio Dashboard' : 'Become a Pro Creator'}</h3>
                               <p className="text-sm font-medium text-blue-100/50 mt-1">
                                   {user.role === 'creator' ? 'Manage your impact and insights' : 'Share your stories and unlock earnings'}
                               </p>
                           </div>
                       </div>
                       <div className="w-12 h-12 flex items-center justify-center glass border border-white/10 rounded-full text-white">
                          <ChevronRight />
                       </div>
                   </div>
               </div>
            </motion.div>
        )}

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
           <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">Global Config</h3>
           <div className="glass border border-white/20 dark:border-white/5 rounded-[40px] overflow-hidden shadow-2xl shadow-black/5">
              
              <div className="p-8 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] glass border border-white/20 flex items-center justify-center text-gray-900 dark:text-white">
                       <Moon size={22} />
                    </div>
                    <span className="font-display font-bold text-lg text-gray-900 dark:text-white">Immersive Dark</span>
                 </div>
                 <button 
                   onClick={toggleDarkMode}
                   className={`w-14 h-8 rounded-full transition-all duration-500 p-1 relative ${darkMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-white/10'}`}
                 >
                    <motion.div 
                      layout
                      className="w-6 h-6 bg-white rounded-full shadow-lg"
                      initial={false}
                      animate={{ x: darkMode ? 24 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                 </button>
              </div>

              <div className="p-8 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-t border-white/20 dark:border-white/5 cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] glass border border-white/20 flex items-center justify-center text-gray-900 dark:text-white">
                       <Bell size={22} />
                    </div>
                    <span className="font-display font-bold text-lg text-gray-900 dark:text-white">Smart Alerts</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">Active</span>
                    <ChevronRight size={18} className="text-gray-400" />
                 </div>
              </div>

              <div className="p-8 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors border-t border-white/20 dark:border-white/5 cursor-pointer">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] glass border border-white/20 flex items-center justify-center text-gray-900 dark:text-white">
                       <Globe size={22} />
                    </div>
                    <span className="font-display font-bold text-lg text-gray-900 dark:text-white">Vernacular</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-widest font-display">English (Global)</span>
                    <ChevronRight size={18} className="text-gray-400" />
                 </div>
              </div>

           </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="space-y-6"
        >
           <h3 className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-[0.2em] ml-2 font-display">Concierge</h3>
           <div className="glass border border-white/20 dark:border-white/5 rounded-[40px] overflow-hidden shadow-2xl shadow-black/5 divide-y divide-white/20 dark:divide-white/5">
              
              {[
                { icon: Star, color: 'text-amber-500', label: 'Rate Experience' },
                { icon: Shield, color: 'text-blue-500', label: 'Privacy Protocols' },
                { icon: HelpCircle, color: 'text-gray-400', label: 'Intelligence Support' },
              ].map((item) => (
                <div 
                  key={item.label} 
                  onClick={() => handleSupportClick(item.label)}
                  className="p-8 flex items-center justify-between group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-[18px] glass border border-white/20 flex items-center justify-center">
                         <item.icon size={22} className={item.color} />
                      </div>
                      <span className="font-display font-bold text-lg text-gray-900 dark:text-white">{item.label}</span>
                   </div>
                   <ChevronRight size={18} className="text-gray-400" />
                </div>
              ))}

           </div>
        </motion.div>

        <div className="pt-8 text-center">
           <p className="text-[10px] font-bold text-gray-400 dark:text-white/10 uppercase tracking-[0.3em] font-display">Proxima OS v4.2.0 • Premium Edition</p>
        </div>

      </div>
    </div>
  );
};

export default SettingsPage;
