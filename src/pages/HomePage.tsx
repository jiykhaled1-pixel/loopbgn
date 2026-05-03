/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users2, 
  ArrowLeft, 
  Star,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Dice5
} from 'lucide-react';
import { type User, UserRole, type Event, type Place, type Game } from '../types';

export default function HomePage({ user }: { user: User | null }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, plRes, gmRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/places'),
          fetch('/api/games')
        ]);
        
        const [evData, plData, gmData] = await Promise.all([
          evRes.json(),
          plRes.json(),
          gmRes.json()
        ]);

        setEvents(Array.isArray(evData) ? evData.slice(0, 3) : []);
        setPlaces(Array.isArray(plData) ? plData.slice(0, 6) : []);
        setGames(Array.isArray(gmData) ? gmData.slice(0, 7) : []);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-20 pb-20" dir="rtl">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-brand-bg">
        {/* Background Patterns */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e18119_0%,transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#efdfc3_0%,transparent_50%)]" />
        </div>
        
        {/* Abstract Shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -left-40 w-96 h-96 border border-white/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -right-40 w-96 h-96 border border-white/5 rounded-full"
        />

        <div className="container mx-auto px-4 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-sm font-bold">
              <TrendingUp className="w-4 h-4" />
              أكبر تجمع للاعبي البورد قيم في الوطن العربي
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-brand-text leading-[1.1] tracking-tight">
              اكتشف <span className="text-brand-primary font-black italic">فعاليات</span> البورد قيم حولك
            </h1>
            <p className="text-xl text-gray-400 max-w-xl leading-relaxed">
              انخرط في مجتمع مليء بالحماس والتحدي. جد أماكن للعب، شارك في فعاليات استثنائية، وكن جزءاً من الحكاية.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/events" 
                className="px-8 py-4 bg-brand-primary text-brand-bg rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-brand-primary/10"
              >
                استعرض الفعاليات
              </Link>
              {user?.role === UserRole.ADMIN && (
                <Link 
                  to="/events" 
                  className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  إدارة الفعاليات
                </Link>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-[3rem] overflow-hidden border-8 border-white/5 shadow-2xl skew-y-3">
              <img 
                src="https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=1200" 
                alt="Board Games"
                className="w-full h-[600px] object-cover hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120D26] to-transparent opacity-60" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-brand-text">فعاليات قادمة</h2>
            <p className="text-gray-400">لا تفوت فرصة التحدي القادم</p>
          </div>
          <Link to="/events" className="text-brand-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            مشاهدة الكل <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.length > 0 ? events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group bg-white/5 rounded-[2rem] overflow-hidden border border-white/10 hover:border-brand-primary transition-all"
            >
              <div className="relative h-60 overflow-hidden">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 px-4 py-2 bg-brand-bg/90 backdrop-blur-md rounded-full text-xs font-bold text-brand-text shadow-sm">
                  {event.type}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-brand-text mb-3 group-hover:text-brand-primary transition-colors uppercase tracking-tight line-clamp-1">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5 font-medium"><MapPin className="w-4 h-4 text-brand-primary" /> {event.city}</span>
                    <span className="flex items-center gap-1.5 font-medium"><Calendar className="w-4 h-4 text-brand-primary" /> {event.date}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5">
                  <span className="text-lg font-black text-brand-primary">جديد</span>
                  <Link to={`/events/${event.id}`} className="px-6 py-3 bg-brand-primary text-brand-bg rounded-xl text-sm font-bold hover:scale-105 transition-all">
                    التفاصيل
                  </Link>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-16 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 shadow-inner">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500 font-medium tracking-wide">لا توجد فعاليات قادمة حالياً.</p>
            </div>
          )}
        </div>
      </section>

      {/* Places Slider */}
      <section className="bg-brand-bg py-24">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-brand-text">أماكن اللعب</h2>
              <p className="text-gray-400">أفضل المقاهي والمراكز المتخصصة</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"><ChevronRight /></button>
              <button className="p-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all"><ChevronLeft /></button>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-8 pb-8 no-scrollbar scroll-smooth">
            {places.length > 0 ? places.map((place) => (
              <motion.div 
                key={place.id} 
                className="flex-shrink-0 w-80 bg-white/5 rounded-3xl overflow-hidden border border-white/10 hover:border-brand-primary transition-all"
                whileHover={{ y: -5 }}
              >
                <div className="h-48 relative">
                  <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-brand-primary rounded-full text-xs font-bold flex items-center gap-1 text-brand-bg">
                    <Star className="w-3 h-3 fill-current" /> {place.rating}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-brand-text mb-1">{place.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {place.city}
                  </p>
                  <button className="w-full py-3 bg-white/5 text-brand-text rounded-xl text-sm font-bold hover:bg-brand-primary hover:text-brand-bg transition-all">
                    عرض المكان
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="w-full py-16 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-500">سيتم إضافة أماكن اللعب قريباً</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Popular Games */}
      <section className="container mx-auto px-4">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl font-black text-brand-text">الألعاب المشهورة</h2>
          <p className="text-gray-400 max-w-lg mx-auto leading-relaxed">
            استكشف أكثر الألعاب طلباً في المجتمع وتعرف على تفاصيلها.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {games.length > 0 ? games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative aspect-square rounded-[2rem] overflow-hidden group cursor-pointer"
            >
              <img src={game.image} alt={game.name} className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent opacity-0 group-hover:opacity-90 transition-opacity duration-300 flex flex-col justify-end p-6">
                <h3 className="text-brand-text font-bold text-xl mb-1">{game.name}</h3>
                <p className="text-brand-primary text-sm font-medium">{game.difficulty}</p>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-16 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
              <Dice5 className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-500">لم يتم إضافة ألعاب بعد.</p>
            </div>
          )}
          {games.length > 0 && (
            <Link to="/games" className="flex items-center justify-center border-4 border-dashed border-white/10 rounded-[2rem] group hover:border-brand-primary transition-colors cursor-pointer text-center p-4">
              <span className="text-gray-500 font-bold group-hover:text-brand-primary">+ استكشف المزيد</span>
            </Link>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-br from-brand-primary/20 to-brand-bg rounded-[3rem] p-12 lg:p-20 relative overflow-hidden text-center text-brand-text border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <Users2 className="w-16 h-16 mx-auto text-brand-primary" />
            <h2 className="text-4xl font-bold leading-tight">كن جزءاً من مجتمعنا الحيوي الآن</h2>
            <p className="text-gray-400 text-lg">شارك منشوراتك، ابحث عن أصدقاء جدد للعب، وابق على اطلاع بآخر أخبار عالم البورد قيم.</p>
            <div className="pt-4">
              <Link to="/community" className="inline-block px-10 py-4 bg-brand-primary text-brand-bg rounded-2xl font-bold text-lg hover:scale-105 transition-all shadow-xl shadow-brand-primary/10">
                انضم للمجتمع
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
