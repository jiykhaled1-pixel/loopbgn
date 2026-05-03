/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ChevronRight, 
  Share2, 
  Heart,
  CheckCircle2,
  Info,
  Plus,
  X
} from 'lucide-react';
import { type User, type Event } from '../types';

export default function EventDetailsPage({ user }: { user: User | null }) {
  const { id } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooked, setIsBooked] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventRes, bookingsRes] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch(`/api/events/${id}/bookings`)
        ]);

        if (eventRes.ok) {
          const data = await eventRes.json();
          setEvent(data);
        }

        if (bookingsRes.ok) {
          const bookings = await bookingsRes.json();
          setParticipants(bookings);
          if (user) {
            setIsBooked(bookings.some((b: any) => b.userId === user.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleBooking = async () => {
    if (!user) {
      alert('الرجاء تسجيل الدخول أولاً للحجز');
      return;
    }
    if (isBooked) return;

    setIsBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
        })
      });

      if (res.ok) {
        const newBooking = await res.json();
        setParticipants(prev => [...prev, newBooking]);
        setIsBooked(true);
        alert('تم حجز مكانك بنجاح! نراكم هناك.');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الحجز');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCheckIn = async (bookingId: string, attended: boolean) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/checkin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attended })
      });
      if (res.ok) {
        setParticipants(prev => prev.map(p => p.id === bookingId ? { ...p, attended } : p));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-brand-text">عذراً، الفعالية غير موجودة</h1>
          <Link to="/events" className="text-brand-primary font-bold underline">العودة للفعاليات</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-bg min-h-screen pb-20" dir="rtl">
      {/* Dynamic Header / Hero Area */}
      <div className="relative h-[50vh] lg:h-[60vh] w-full overflow-hidden">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/20 to-transparent" />
        
        {/* Navigation Overlays */}
        <div className="absolute top-8 right-8 left-8 flex justify-between items-center px-4">
          <Link to="/events" className="p-3 bg-brand-bg/90 backdrop-blur-md rounded-full shadow-lg hover:bg-brand-bg transition-colors">
            <ChevronRight className="w-6 h-6 text-brand-text" />
          </Link>
          <div className="flex gap-3">
            <button className="p-3 bg-brand-bg/90 backdrop-blur-md rounded-full shadow-lg hover:text-red-500 transition-colors text-brand-text">
              <Heart className="w-5 h-5" />
            </button>
            <button className="p-3 bg-brand-bg/90 backdrop-blur-md rounded-full shadow-lg hover:text-brand-primary transition-colors text-brand-text">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm rounded-[3rem] p-8 lg:p-12 shadow-2xl border border-white/10"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-black uppercase tracking-widest leading-none">
                  {event.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-brand-text/60 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  فعالية موثقة
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-brand-text leading-tight mb-8">
                {event.title}
              </h1>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">المدينة</span>
                  <p className="flex items-center gap-1.5 font-bold text-brand-text"><MapPin className="w-4 h-4 text-brand-primary" /> {event.city}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">التاريخ</span>
                  <p className="flex items-center gap-1.5 font-bold text-brand-text"><Calendar className="w-4 h-4 text-brand-primary" /> {event.date}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">الوقت</span>
                  <p className="flex items-center gap-1.5 font-bold text-brand-text"><Clock className="w-4 h-4 text-brand-primary" /> {event.time}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">المكان</span>
                  <p className="flex items-center gap-1.5 font-bold text-brand-text uppercase truncate"><Info className="w-4 h-4 text-brand-primary" /> {event.location.split(' ').slice(0,2).join(' ')}</p>
                </div>
              </div>

                <div className="pt-10 space-y-8">
                  <h3 className="text-2xl font-bold text-brand-text flex items-center gap-2">
                    <Info className="w-6 h-6 text-brand-primary" />
                    عن الفعالية
                  </h3>
                  <p className="text-gray-400 leading-[1.8] text-lg">
                    {event.description}
                  </p>

                  {event.details && (
                    <div className="space-y-4">
                      <h4 className="text-xl font-bold text-brand-text">تفاصيل إضافية</h4>
                      <p className="text-gray-400 leading-relaxed bg-white/5 p-6 rounded-2xl">
                        {event.details}
                      </p>
                    </div>
                  )}

                  {/* Participants section */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-brand-text">المشاركون ({participants.length})</h4>
                      {(user?.role === 'admin' || user?.role === 'organizer') && (
                        <button 
                          onClick={() => setShowManageModal(true)}
                          className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-primary hover:text-brand-bg transition-all"
                        >
                          إدارة الحضور
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {participants.length > 0 ? participants.map((p, i) => (
                        <div key={p.id} className="group relative">
                          <img 
                             src={p.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                             className={`w-12 h-12 rounded-full border-2 ${p.attended ? 'border-green-500' : 'border-white/10'} shadow-sm ring-2 ring-transparent group-hover:ring-brand-primary transition-all cursor-pointer`}
                             alt={p.userName}
                          />
                          <div className="absolute -bottom-10 right-1/2 translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                            {p.userName} {p.attended && '(حضر)'}
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 text-sm">لا يوجد مشاركون بعد. كن الأول!</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 space-y-4">
                    <h4 className="font-bold text-brand-primary">📍 الموقع بالتفصيل:</h4>
                    <p className="text-gray-400">{event.location}</p>
                  </div>
                </div>
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white/5 rounded-[3rem] p-8 lg:p-10 text-brand-text shadow-2xl border border-white/10">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-1">الحضور</span>
                    <span className="text-4xl font-black text-brand-text">مجاني</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>تأكيد فوري للحجز</span>
                  </div>
                </div>

                <button 
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl mb-4 ${isBooked ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-brand-primary text-brand-bg hover:scale-[1.02] active:scale-[0.98]'}`}
                  disabled={isBooked || isBooking}
                  onClick={handleBooking}
                >
                  {isBooking ? 'جاري الحجز...' : isBooked ? 'أنت مسجل بالفعل' : 'احجز مكانك الآن'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Management Modal */}
      {showManageModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md" onClick={() => setShowManageModal(false)} />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[3rem] p-8 md:p-10 max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between mb-8 shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-brand-text">إدارة الحضور</h3>
                <p className="text-xs text-gray-500 mt-1">{event.title}</p>
              </div>
              <button onClick={() => setShowManageModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {participants.length > 0 ? participants.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-brand-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.userAvatar} className="w-12 h-12 rounded-full border border-white/10" alt="" />
                    <div>
                      <p className="font-bold text-brand-text">{p.userName}</p>
                      <p className="text-[10px] text-gray-500">{p.userEmail}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCheckIn(p.id, !p.attended)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${p.attended ? 'bg-green-500 text-brand-bg' : 'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-brand-bg'}`}
                  >
                    {p.attended ? 'تم الحضور' : 'تحضير المشارك'}
                  </button>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <p className="text-gray-500">لا يوجد حوزات حالية لهذه الفعالية</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
