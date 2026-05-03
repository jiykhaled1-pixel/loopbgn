/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Star, Filter, Search, Plus, Trash2, X } from 'lucide-react';
import { UserRole, type User, type Place } from '../types';

export default function PlacesPage({ user }: { user: User | null }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [newPlace, setNewPlace] = useState({
    name: '',
    description: '',
    city: 'الرياض',
    image: '',
    rating: 5,
    features: [] as string[],
    lat: 24.7,
    lng: 46.7,
    radius: 200,
    details: ''
  });

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const res = await fetch('/api/places');
      const data = await res.json();
      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to add place:', newPlace);
    try {
      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlace)
      });
      console.log('Server response status:', res.status);
      if (res.ok) {
        const added = await res.json();
        setPlaces(prev => [...prev, added]);
        setIsAddModalOpen(false);
        setNewPlace({ name: '', description: '', city: 'الرياض', image: '', rating: 5, features: [], lat: 24.7, lng: 46.7, radius: 200, details: '' });
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

  const handleDeletePlace = async (id: string) => {
    try {
      const res = await fetch(`/api/places/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPlaces(prev => prev.filter(p => p.id !== id));
        if (selectedPlace?.id === id) setSelectedPlace(null);
        alert('تم حذف المكان بنجاح');
      } else {
        alert('حدث خطأ أثناء الحذف');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredPlaces = Array.isArray(places) ? places.filter(p => 
    (p.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (p.city?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-brand-text">أماكن اللعب</h1>
            <p className="text-gray-400 max-w-md">اكتشف أفضل المقاهي والمراكز المتخصصة لألعاب الطاولة في منطقتك.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="ابحث عن مكان..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-11 pl-4 py-3 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-brand-primary transition-all w-64 text-brand-text"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-brand-bg rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
              >
                <Plus className="w-5 h-5" />
                إضافة مكان
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlaces.length > 0 ? filteredPlaces.map((place, index) => (
            <motion.div
              key={place.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-[#1A1A1A] rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-brand-primary/30 transition-all relative"
            >
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlace(place.id);
                    }}
                    className="absolute top-6 right-6 z-20 p-3 bg-red-600 text-white rounded-full transition-all shadow-xl hover:scale-110 active:scale-95"
                    title="حذف المكان"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              
              <div className="h-64 relative overflow-hidden">
                <img src={place.image} alt={place.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-6 left-6 px-4 py-2 bg-brand-primary rounded-full text-sm font-black flex items-center gap-1.5 shadow-xl text-brand-bg">
                  <Star className="w-4 h-4 fill-current" /> {place.rating}
                </div>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-brand-text mb-2">{place.name}</h3>
                  <p className="text-gray-400 flex items-center gap-2 font-medium">
                    <MapPin className="w-4 h-4 text-brand-primary" /> {place.city}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedPlace(place);
                  }}
                  className="w-full py-4 bg-brand-primary text-brand-bg rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  عرض التفاصيل
                </button>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-300">
               <MapPin className="w-16 h-16 mx-auto mb-4 opacity-10" />
               <p>سيتم إضافة أماكن قريباً</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlace && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlace(null)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-10 overflow-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedPlace(null)}
                className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <img src={selectedPlace.image} className="w-full md:w-48 h-48 object-cover rounded-3xl" alt={selectedPlace.name} />
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-brand-text">{selectedPlace.name}</h2>
                  <div className="flex items-center gap-2 font-bold text-gray-400">
                    <MapPin className="w-4 h-4 text-brand-primary" /> {selectedPlace.city}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-lg text-sm font-bold w-fit">
                    <Star className="w-4 h-4 fill-current" /> {selectedPlace.rating}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-brand-text mb-2">الوصف</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{selectedPlace.description}</p>
                </div>
                {selectedPlace.details && (
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-2">تفاصيل إضافية</h3>
                    <div className="bg-white/5 p-6 rounded-2xl text-gray-300 leading-relaxed">
                      {selectedPlace.details}
                    </div>
                  </div>
                )}
                {selectedPlace.features && selectedPlace.features.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-4">المميزات</h3>
                    <div className="flex flex-wrap gap-2 text-right" dir="rtl">
                      {selectedPlace.features.map(f => (
                        <span key={f} className="px-4 py-2 bg-white/5 rounded-xl text-sm text-gray-400 border border-white/5">{f}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-6">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-4 bg-brand-primary text-brand-bg rounded-2xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                  >
                    <MapPin className="w-5 h-5" />
                    عرض الموقع على الخريطة
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 left-8 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-black text-white mb-8">إضافة مكان جديد</h2>
              <form onSubmit={handleAddPlace} className="space-y-6">
                <div className="space-y-1">
                  <input 
                    type="text" required placeholder="اسم المكان"
                    value={newPlace.name} onChange={(e) => setNewPlace({...newPlace, name: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <div className="space-y-1">
                  <textarea 
                    required placeholder="وصف المكان" rows={3}
                    value={newPlace.description} onChange={(e) => setNewPlace({...newPlace, description: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <textarea 
                    placeholder="تفاصيل إضافية" rows={3}
                    value={newPlace.details} onChange={(e) => setNewPlace({...newPlace, details: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                  />
                </div>
                <div className="space-y-1">
                  <input 
                    type="text" required placeholder="رابط الصورة"
                    value={newPlace.image} onChange={(e) => setNewPlace({...newPlace, image: e.target.value})}
                    className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <select 
                      value={newPlace.city} onChange={(e) => setNewPlace({...newPlace, city: e.target.value})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    >
                      {['الرياض', 'جدة', 'الدمام', 'مكة'].map(city => <option key={city} value={city} className="bg-brand-bg">{city}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <input 
                      type="number" required min="0" max="5" step="0.1" placeholder="التقييم (5)"
                      value={newPlace.rating} onChange={(e) => setNewPlace({...newPlace, rating: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    />
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
                            setNewPlace({
                              ...newPlace,
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
                        value={newPlace.lat} onChange={(e) => setNewPlace({...newPlace, lat: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-500 mr-2">خط الطول (Lng)</label>
                       <input 
                        type="number" required step="0.000001" placeholder="46.7xxxx"
                        value={newPlace.lng} onChange={(e) => setNewPlace({...newPlace, lng: Number(e.target.value)})}
                        className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 mr-2">نطاق السماح (بالمتر)</label>
                    <input 
                      type="number" required min="1" placeholder="200"
                      value={newPlace.radius} onChange={(e) => setNewPlace({...newPlace, radius: Number(e.target.value)})}
                      className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full py-5 bg-brand-primary text-brand-bg font-black rounded-2xl hover:scale-105 transition-all">
                  حفظ المكان
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
