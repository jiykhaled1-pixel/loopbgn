/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, Filter, Users, Plus, Trash2, X } from 'lucide-react';
import { UserRole, type User, type Event } from '../types';

const CITIES = ['الكل', 'الرياض', 'جدة', 'الدمام', 'مكة'];
const GAME_TYPES = ['الكل', 'استراتيجية', 'تقمص أدوار', 'عائلية', 'ورق', 'سرعة'];

export default function EventsPage({ user }: { user: User | null }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [selectedType, setSelectedType] = useState('الكل');

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
    type: 'استراتيجية',
    city: 'الرياض',
    lat: 24.7,
    lng: 46.7,
    radius: 200,
    details: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to add event:', newEvent);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      console.log('Server response status:', res.status);
      if (res.ok) {
        const added = await res.json();
        setEvents(prev => [...prev, added]);
        setIsAddModalOpen(false);
        setNewEvent({ title: '', description: '', date: '', time: '', location: '', image: '', type: 'استراتيجية', city: 'الرياض', lat: 24.7, lng: 46.7, radius: 200, details: '' });
      } else {
        const errData = await res.json();
        console.error('Error content:', errData);
        alert(`فشل الحفظ: ${errData.error || res.statusText}`);
      }
    } catch (err) {
      console.error('Fetch catch:', err);
      alert('حدث خطأ أثناء الاتصال بالخادم. تأكد من أنك متصل بالإنترنت.');
    }
  };

  const handleDeleteEvent = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(prev => prev.filter(ev => ev.id !== id));
        alert('تم حذف الفعالية بنجاح');
      } else {
        alert('حدث خطأ في الحذف من الخادم');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال بالخادم');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredEvents = Array.isArray(events) ? events.filter(event => {
    const title = event.title?.toLowerCase() || '';
    const desc = event.description?.toLowerCase() || '';
    const city = event.city || '';
    const type = event.type || '';
    
    const matchesSearch = title.includes(searchTerm.toLowerCase()) || desc.includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === 'الكل' || city === selectedCity;
    const matchesType = selectedType === 'الكل' || type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  }) : [];

  return (
    <div className="min-h-screen bg-brand-bg pb-20" dir="rtl">
      {/* Header Space */}
      <div className="bg-brand-bg pt-20 pb-40 px-4">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-brand-text uppercase tracking-tighter">استكشف الفعاليات</h1>
          <p className="text-gray-400">ابحث عن أفضل التجمعات والبطولات في مدينتك</p>
          {isAdmin && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 px-10 py-4 bg-brand-primary text-brand-bg rounded-full font-black hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              إضافة فعالية
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-24">
        {/* Filters Card */}
        <div className="bg-brand-bg rounded-[2.5rem] p-8 shadow-2xl border border-white/10 mb-12">
          {/* ... existing filter inputs but updated with handlers ... */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="relative group">
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">البحث</label>
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="اسم الفعالية..." 
                  className="w-full pr-11 py-3.5 bg-white/5 border-transparent border-white/5 rounded-2xl text-sm focus:bg-white/10 focus:border-brand-primary outline-none transition-all text-brand-text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">المدينة</label>
              <select 
                className="w-full px-4 py-3.5 bg-white/5 border-transparent border-white/5 rounded-2xl text-sm focus:bg-white/10 focus:border-brand-primary outline-none transition-all text-brand-text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {CITIES.map(city => <option key={city} value={city} className="bg-brand-bg">{city}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-2 mr-2 uppercase tracking-widest">نوع اللعبة</label>
              <select 
                className="w-full px-4 py-3.5 bg-white/5 border-transparent border-white/5 rounded-2xl text-sm focus:bg-white/10 focus:border-brand-primary outline-none transition-all text-brand-text"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {GAME_TYPES.map(type => <option key={type} value={type} className="bg-brand-bg">{type}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ... existing grid but with admin delete button and map from events ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-[#1A1A1A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-brand-primary/30 hover:shadow-2xl transition-all flex flex-col h-full relative"
              >
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteEvent(event.id, e);
                    }}
                    className="absolute top-4 left-4 z-20 p-3 bg-red-600 text-white rounded-full transition-all shadow-xl hover:scale-110 active:scale-95"
                    title="حذف الفعالية"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="px-4 py-2 bg-brand-bg/80 backdrop-blur-md rounded-full text-[10px] font-black text-brand-primary uppercase tracking-widest">
                      {event.type}
                    </div>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-grow">
                  <div className="flex-grow space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-brand-text mb-3 uppercase truncate">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <MapPin className="w-3.5 h-3.5 text-brand-primary" />
                          {event.city}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                          <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                          {event.date}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link 
                      to={`/events/${event.id}`} 
                      className="w-full inline-flex items-center justify-center py-4 bg-brand-primary text-brand-bg rounded-2xl font-bold text-sm hover:scale-105 transition-all gap-2"
                    >
                      عرض التفاصيل
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10 shadow-inner">
               <Calendar className="w-16 h-16 mx-auto text-gray-600 mb-6" />
               <p className="text-gray-500 font-bold text-lg">لا توجد فعاليات حالياً</p>
               <p className="text-gray-600 text-sm mt-2">كن أول من ينظم فعالية في هذه الفئة!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-[#120D26]/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1A1A1A] rounded-[2.5rem] p-10 overflow-auto max-h-[90vh] border border-white/10"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-black text-white mb-8">إضافة فعالية جديدة</h2>
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div className="space-y-1">
                  <input 
                    type="text" required placeholder="عنوان الفعالية"
                    value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <div className="space-y-1">
                  <textarea 
                    required placeholder="وصف الفعالية" rows={3}
                    value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <textarea 
                    placeholder="تفاصيل إضافية" rows={3}
                    value={newEvent.details} onChange={(e) => setNewEvent({...newEvent, details: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    type="text" required placeholder="رابط الصورة"
                    value={newEvent.image} onChange={(e) => setNewEvent({...newEvent, image: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <input 
                      type="date" required
                      value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    />
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="time" required
                      value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <select 
                      value={newEvent.city} onChange={(e) => setNewEvent({...newEvent, city: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    >
                      {CITIES.filter(c => c !== 'الكل').map(city => <option key={city} value={city} className="bg-brand-bg">{city}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <select 
                      value={newEvent.type} onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    >
                      {GAME_TYPES.filter(t => t !== 'الكل').map(type => <option key={type} value={type} className="bg-brand-bg">{type}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center mr-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">إحداثيات الموقع (GPS)</label>
                    <button 
                      type="button"
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition((position) => {
                            setNewEvent({
                              ...newEvent,
                              lat: position.coords.latitude,
                              lng: position.coords.longitude
                            });
                          }, (err) => {
                            alert('تعذر جلب الموقع. يرجى تفعيل الـ GPS');
                          });
                        }
                      }}
                      className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline"
                    >
                      استخدام موقعي الحالي
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 mr-2">خط العرض (Lat)</label>
                       <input 
                        type="number" required step="0.000001" placeholder="24.7xxxx"
                        value={newEvent.lat} onChange={(e) => setNewEvent({...newEvent, lat: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 mr-2">خط الطول (Lng)</label>
                       <input 
                        type="number" required step="0.000001" placeholder="46.7xxxx"
                        value={newEvent.lng} onChange={(e) => setNewEvent({...newEvent, lng: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 mr-2">نطاق السماح (بالمتر)</label>
                    <input 
                      type="number" required min="1" placeholder="200"
                      value={newEvent.radius} onChange={(e) => setNewEvent({...newEvent, radius: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <input 
                    type="text" required placeholder="الموقع بالتحديد"
                    value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-brand-primary text-brand-bg font-black rounded-2xl hover:scale-105 transition-all">
                  حفظ الفعالية
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
