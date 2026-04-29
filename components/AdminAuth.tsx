import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, LogIn, ArrowLeft, Lock } from 'lucide-react';
import { auth, loginWithGoogle } from '../services/firebase';
import { User } from '../types';

interface AdminAuthProps {
  onBack: () => void;
  onSuccess: (user: User) => void;
}

const AdminAuth: React.FC<AdminAuthProps> = ({ onBack, onSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (user.role === 'admin' || user.email === 'rajendarrana732@gmail.com') {
        onSuccess(user);
      } else {
        setError('ACCESS DENIED: Unauthorized account. This portal is restricted to system administrators.');
        await auth.signOut();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-red-600 rounded-[32px] mx-auto flex items-center justify-center text-white shadow-2xl shadow-red-600/20 mb-8"
          >
            <ShieldCheck size={48} />
          </motion.div>
          <h1 className="font-display font-black text-4xl dark:text-white tracking-tighter mb-4">SYSTEM ACCESS</h1>
          <p className="text-gray-500 dark:text-white/40 font-medium">Please authenticate to access the Proxima Mainframe. Admin login only.</p>
        </div>

        <div className="space-y-4">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-600/10 border border-red-600/20 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-widest text-center"
            >
              {error}
            </motion.div>
          )}

          <button 
            disabled={loading}
            onClick={handleAdminLogin}
            className="w-full h-16 bg-red-600 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                Admin Secure Login
              </>
            )}
          </button>

          <button 
            onClick={onBack}
            className="w-full h-16 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-[24px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all"
          >
            <ArrowLeft size={18} />
            Back to App
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 dark:text-white/20">
          <Lock size={14} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em]">End-to-End Encrypted Console</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
