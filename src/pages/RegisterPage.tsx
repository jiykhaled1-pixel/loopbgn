/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Dice5, Mail, Lock, User, ShieldCheck, ArrowRight, Baby, UserCircle } from 'lucide-react';
import Logo from '../components/Logo';

export default function RegisterPage({ onLogin }: { onLogin: (u: any) => void }) {
  const navigate = useNavigate();
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    gender: 'male' as 'male' | 'female'
  });
  const [tempId, setTempId] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Choose avatar based on gender
    const avatar = formData.gender === 'male' 
      ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}&top[]=shortHair&top[]=shaggyMullet&top[]=shaggy&top[]=shortCurly`
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}&top[]=longHair&top[]=bob&top[]=curly&top[]=dreads`;

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, avatar })
      });
      const data = await res.json();
      if (res.ok) {
        setTempId(data.tempId);
        setStep('verify');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('حدث خطأ ما، حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempId, code })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data.user);
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('الرمز غير صحيح');
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

          <AnimatePresence mode="wait">
            {step === 'details' ? (
              <motion.div 
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-brand-text">إنشاء حساب جديد</h1>
                  <p className="text-gray-400">انضم لمجتمع نرد ولوح وابدأ مغامرتك</p>
                </div>

                {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold">{error}</div>}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'male'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${formData.gender === 'male' ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-white/5 text-gray-500'}`}
                    >
                      <UserCircle className="w-5 h-5" />
                      ولد
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, gender: 'female'})}
                      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl border-2 transition-all ${formData.gender === 'female' ? 'border-pink-500/50 bg-pink-500/10 text-pink-400' : 'border-white/5 text-gray-500'}`}
                    >
                      <Baby className="w-5 h-5" />
                      بنت
                    </button>
                  </div>

                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      required
                      type="text" 
                      placeholder="الاسم الكامل"
                      className="w-full pr-12 py-4 bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      required
                      type="email" 
                      placeholder="البريد الإلكتروني"
                      className="w-full pr-12 py-4 bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      required
                      type="password" 
                      placeholder="كلمة المرور"
                      className="w-full pr-12 py-4 bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-primary text-brand-bg rounded-2xl font-black text-lg hover:scale-105 transition-all"
                  >
                    {isLoading ? 'جاري الإرسال...' : 'إنشاء حساب'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="verify"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <ShieldCheck className="w-16 h-16 text-brand-primary mx-auto" />
                  <h1 className="text-2xl font-black text-brand-text">تحقق من بريدك</h1>
                  <p className="text-gray-400 text-sm">أرسلنا رمز التحقق إلى بريدك الإلكتروني. يرجى إدخاله للمتابعة.</p>
                </div>

                {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl text-sm font-bold">{error}</div>}

                <form onSubmit={handleVerify} className="space-y-6">
                  <input 
                    required
                    type="text" 
                    maxLength={6}
                    placeholder="000000"
                    className="w-full py-6 text-center text-4xl font-black tracking-[1em] bg-white/5 text-brand-text rounded-2xl border border-white/5 outline-none focus:ring-2 focus:ring-brand-primary"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                  />
                  <button 
                    disabled={isLoading}
                    className="w-full py-4 bg-brand-primary text-brand-bg rounded-2xl font-black text-lg hover:scale-105 transition-all"
                  >
                    {isLoading ? 'جاري التحقق...' : 'تأكيد الرمز'}
                  </button>
                </form>
                <button onClick={() => setStep('details')} className="text-gray-400 text-sm font-bold flex items-center gap-2 mx-auto">
                  <ArrowRight className="w-4 h-4 rotate-180" /> العودة للتسجيل
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-gray-400 text-sm">
            بالفعل لديك حساب؟ <Link to="/login" className="text-brand-primary font-black underline">دخول</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
