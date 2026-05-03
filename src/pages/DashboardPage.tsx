/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Calendar, 
  Users, 
  Settings, 
  TrendingUp, 
  MapPin, 
  ChevronLeft,
  LayoutDashboard,
  Trophy,
  CreditCard,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_EVENTS } from '../constants';
import { type User, UserRole } from '../types';

export default function DashboardPage({ user }: { user: User | null }) {
  if (!user) return <div className="p-20 text-center">يرجى تسجيل الدخول للوصول للوحة التحكم.</div>;

  const isOrganizer = user.role === UserRole.ORGANIZER;
  const userEvents = MOCK_EVENTS.filter(e => e.organizerId === user.id);

  const stats = user.stats || { events: 0, attendance: 0, trophies: 0, balance: 0 };

  return (
    <div className="min-h-screen bg-brand-bg pb-20" dir="rtl">
      {/* Header Banner */}
      <div className="bg-brand-bg pt-16 pb-32 px-4 border-b border-white/5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-24 h-24 rounded-full border-4 border-brand-primary/20" alt="me" />
                  <div className="absolute -bottom-2 -right-2 p-2 bg-brand-primary rounded-lg text-brand-bg shadow-lg">
                    <Settings className="w-4 h-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-black text-brand-text">{user.name}</h1>
                  <p className="text-gray-400 font-medium">مرحباً بك في لوحتك الخاصة</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/request-organizer" className="px-6 py-3 bg-brand-primary/10 border border-brand-primary/20 hover:bg-brand-primary/20 rounded-2xl flex items-center gap-2 transition-all group">
                   <Plus className="w-4 h-4 text-brand-primary" />
                   <span className="text-sm font-bold text-brand-primary">طلب تنظيم فعالية</span>
                </Link>
                <div className="flex gap-4">
                  <div className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-center">
                    <span className="block text-gray-500 text-[10px] font-bold uppercase tracking-widest">مستوى اللاعب</span>
                    <span className="text-xl font-black text-brand-primary">
                      {user.role === UserRole.ADMIN ? 'مدير' : (stats.attendance > 50 ? 'أسطورة' : stats.attendance > 10 ? 'محترف' : 'مبتدئ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12">
        {/* Content Tabs area */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-brand-text flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-brand-primary" />
                {isOrganizer ? 'فعالياتي المنظمة' : 'حجوزاتي القادمة'}
              </h2>
              <button className="text-sm font-bold text-brand-primary">مشاهدة الكل</button>
            </div>
            
              <div className="space-y-4">
                {userEvents.length > 0 ? userEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ x: -10 }}
                    className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 shadow-sm flex items-center gap-6 transition-all group"
                  >
                    <img src={event.image} className="w-24 h-24 rounded-3xl object-cover" alt="event" />
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-brand-text mb-1">{event.title}</h3>
                      <div className="flex gap-4 text-xs text-gray-400 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                         isOrganizer ? 'bg-green-500/10 text-green-500' : 'bg-brand-primary/10 text-brand-primary'
                       }`}>
                         {isOrganizer ? 'نشطة' : 'مؤكدة'}
                       </span>
                       <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                         <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-brand-primary" />
                       </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="bg-white/5 p-12 rounded-[2.5rem] border border-dashed border-white/10 text-center text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>لا توجد فعاليات قادمة حالياً</p>
                  </div>
                )}
              </div>
          </div>

          {/* Sidebar Notifications / Activities */}
          <div className="lg:col-span-1 space-y-8">
             <div className="h-full bg-white/5 rounded-[3rem] p-8 border border-white/10 shadow-sm space-y-8">
                <h3 className="text-xl font-bold text-brand-text">نشاطات حديثة</h3>
                <div className="space-y-6">
                  <div className="p-8 text-center text-gray-500 border border-dashed border-white/10 rounded-2xl">
                    <p className="text-sm">لا توجد نشاطات حديثة</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* Stats Section - Now at the bottom */}
        <div className="space-y-6 mt-16 mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/80 p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
               <Trophy className="w-48 h-48 text-brand-primary" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-gray-500 text-xs font-black uppercase tracking-widest block mb-1">إجمالي التحصيل والخبرة</span>
                  <div className="flex items-baseline gap-4 mt-2">
                    <h2 className="text-5xl md:text-6xl font-black text-white">+{stats.attendance * 50}</h2>
                    <span className="text-brand-primary text-lg font-bold">نقطة خبرة</span>
                  </div>
                </div>
                
                <div className="max-w-xl">
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-gray-400 font-bold">التقدم للمستوى التالي ({user.role === UserRole.ADMIN ? 'مدير' : (stats.attendance > 50 ? 'أسطورة' : stats.attendance > 10 ? 'محترف' : 'مبتدئ')})</span>
                    <span className="text-brand-primary font-black">{Math.min(100, (stats.attendance % 10) * 10)}%</span>
                  </div>
                  <div className="h-5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stats.attendance % 10) * 10)}%` }}
                      className="h-full bg-brand-primary rounded-full shadow-[0_0_30px_rgba(255,182,0,0.4)]"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    احضر {10 - (stats.attendance % 10)} فعاليات إضافية للحصول على ترقية ورصيد مجاني!
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 px-12 py-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-2xl">
                  <Users className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <span className="text-4xl font-black text-white block">{stats.attendance}</span>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">الحضور العام</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
