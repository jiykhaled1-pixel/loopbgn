import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Phone, User, Send, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RequestOrganizerPage() {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventName: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would save this to a database
    // For now, we'll simulate success
    setIsSubmitted(true);
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900/50 p-12 rounded-3xl border border-brand-primary/20 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">تم إرسال طلبك بنجاح!</h2>
          <p className="text-gray-400 mb-8">سيتواصل معك فريقنا قريباً لمراجعة بيانات فعاليتك.</p>
          <div className="text-sm text-brand-primary font-medium">جاري توجيهك إلى لوحة التحكم...</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">طلب تنظيم <span className="text-brand-primary">فعالية</span></h1>
          <p className="text-gray-400">عبئ بياناتك وسنتواصل معك لاعتماد فعاليتك في الموقع</p>
        </header>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 p-8 rounded-3xl border border-white/5 backdrop-blur-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 block mr-1">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-brand-primary outline-none transition-all"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 block mr-1">رقم الجوال</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-brand-primary outline-none transition-all text-left"
                  dir="ltr"
                  placeholder="05xxxxxxxx"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 block mr-1">اسم الفعالية المقترحة</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  required
                  type="text" 
                  value={formData.eventName}
                  onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white focus:border-brand-primary outline-none transition-all"
                  placeholder="ما هو اسم الفعالية؟"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 block mr-1">وصف الفعالية (اختياري)</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-brand-primary outline-none transition-all resize-none"
                placeholder="تحدث قليلاً عن الفعالية..."
              ></textarea>
            </div>

            <button 
              type="submit"
              className="w-full bg-brand-primary hover:bg-brand-primary/90 text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] shadow-lg shadow-brand-primary/20"
            >
              <Send className="w-5 h-5" />
              إرسال الطلب
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
