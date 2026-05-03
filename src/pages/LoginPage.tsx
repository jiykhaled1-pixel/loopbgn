/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Dice5, Mail, Lock, LogIn } from 'lucide-react';
import { type User } from '../types';
import Logo from '../components/Logo';

export default function LoginPage({ onLogin }: { onLogin: (u: User) => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('فشل التصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-brand-bg p-6 text-brand-text" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-brand-bg rounded-[3rem] p-10 lg:p-12 shadow-2xl border border-white/10 relative overflow-hidden"
      >
        <div className="relative z-10 text-center space-y-8">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-brand-text">مرحباً بك مجدداً</h1>
            <p className="text-gray-400 font-medium">سجل دخولك لمواصلة اللعب</p>
          </div>

          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required
                type="email" 
                placeholder="البريد الإلكتروني"
                className="w-full pr-12 py-4 bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                required
                type="password" 
                placeholder="كلمة المرور"
                className="w-full pr-12 py-4 bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button 
              disabled={isLoading}
              className="w-full py-4 bg-brand-primary text-brand-bg rounded-2xl font-black text-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'جاري الدخول...' : 'تسجيل الدخول'}
            </button>
          </form>

          <p className="text-gray-400 text-sm">
            ليس لديك حساب؟ <Link to="/register" className="text-brand-primary font-black underline">بادر بالتسجيل</Link>
          </p>


        </div>
      </motion.div>
    </div>
  );
}
