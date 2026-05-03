/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ChevronRight, 
  Dice5, 
  Image as ImageIcon, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign 
} from 'lucide-react';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    city: 'الرياض',
    date: '',
    time: '',
    price: '',
    maxPlayers: '',
    description: '',
    gameType: 'استراتيجية'
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    alert('تم إنشاء الفعالية بنجاح! ستظهر في القائمة قريباً.');
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-10" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/events" className="inline-flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-brand-primary transition-colors">
          <ChevronRight className="w-5 h-5" />
          العودة للفعاليات
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-[3rem] p-10 lg:p-12 shadow-2xl border border-white/10"
        >
          <div className="space-y-4 mb-12 text-center">
            <div className="inline-flex p-4 bg-brand-primary/10 rounded-2xl text-brand-primary mb-2">
              <Dice5 className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black text-brand-text">إنشاء فعالية جديدة</h1>
            <p className="text-gray-400">املأ البيانات أدناه لنشر فعاليتك في المجتمع.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Image Placeholder */}
            <div className="w-full aspect-video bg-white/5 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-brand-primary transition-all">
              <div className="p-4 bg-white/10 rounded-full shadow-sm text-gray-400 group-hover:text-brand-primary group-hover:scale-110 transition-all">
                <ImageIcon className="w-8 h-8" />
              </div>
              <span className="text-gray-400 font-bold">اضغط لإضافة صورة للفعالية</span>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">عنوان الفعالية</label>
                <input 
                  required
                  type="text" 
                  placeholder="مثال: ليلة ألعاب استراتيجية" 
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-lg text-brand-text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">المدينة</label>
                  <div className="relative">
                    <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none text-brand-text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    >
                      <option className="bg-brand-bg">الرياض</option>
                      <option className="bg-brand-bg">جدة</option>
                      <option className="bg-brand-bg">الدمام</option>
                      <option className="bg-brand-bg">مكة</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">نوع اللعبة</label>
                  <select 
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all appearance-none text-brand-text"
                    value={formData.gameType}
                    onChange={(e) => setFormData({...formData, gameType: e.target.value})}
                  >
                    <option className="bg-brand-bg">استراتيجية</option>
                    <option className="bg-brand-bg">تقمص أدوار</option>
                    <option className="bg-brand-bg">عائلية</option>
                    <option className="bg-brand-bg">ورق</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">التاريخ</label>
                  <div className="relative">
                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="date" 
                      className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-sans text-brand-text"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">الوقت</label>
                  <div className="relative">
                    <Clock className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="time" 
                      className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all font-sans text-brand-text"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">السعر (ريال)</label>
                  <div className="relative">
                    <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="number" 
                      placeholder="0.00"
                      className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">أقصى عدد لاعبين</label>
                  <div className="relative">
                    <Users className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      required
                      type="number" 
                      placeholder="10"
                      className="w-full pr-14 pl-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all text-brand-text"
                      value={formData.maxPlayers}
                      onChange={(e) => setFormData({...formData, maxPlayers: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-3 mr-2">وصف الفعالية</label>
                <textarea 
                  required
                  placeholder="اكتب تفاصيل الفعالية، القواعد، وأي معلومات إضافية..." 
                  className="w-full min-h-[150px] px-6 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all resize-none text-brand-text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-brand-primary text-brand-bg rounded-[2rem] font-black text-xl hover:scale-[1.02] transition-all shadow-2xl shadow-brand-primary/10"
            >
              نشر الفعالية
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
