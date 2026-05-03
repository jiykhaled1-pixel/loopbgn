/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice5, Users, Clock, BrainCircuit, Search, Plus, Trash2, X } from 'lucide-react';
import { UserRole, type User } from '../types';

interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  players: string;
  playTime: string;
  difficulty: string;
  rules?: string;
}

export default function GamesPage({ user }: { user: User | null }) {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newGame, setNewGame] = useState({
    name: '',
    description: '',
    image: '',
    players: '',
    playTime: '',
    difficulty: '',
    rules: ''
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to add game:', newGame);
    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGame)
      });
      console.log('Server response status:', res.status);
      if (res.ok) {
        const added = await res.json();
        setGames(prev => [...prev, added]);
        setIsAddModalOpen(false);
        setNewGame({ name: '', description: '', image: '', players: '', playTime: '', difficulty: '', rules: '' });
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

  const handleDeleteGame = async (id: string) => {
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGames(prev => prev.filter(g => g.id !== id));
        if (selectedGame?.id === id) setSelectedGame(null);
        alert('تم حذف اللعبة بنجاح');
      } else {
        alert('فشل الحذف من الخادم');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  const filteredGames = Array.isArray(games) ? games.filter(g => 
    (g.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (g.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-black text-brand-text">مكتبة الألعاب</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">تعرف على أشهر ألعاب الطاولة، قواعدها، وما يميز كل منها.</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-6">
            <div className="relative group flex-1 max-w-xl">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
              <input 
                type="text" 
                placeholder="ابحث عن لعبة معينة..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-16 py-5 bg-white/5 shadow-xl shadow-black/20 border border-white/5 rounded-[2rem] outline-none text-lg text-brand-text focus:border-brand-primary transition-all"
              />
            </div>
            {isAdmin && (
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-8 py-5 bg-brand-primary text-brand-bg rounded-[2rem] font-black hover:scale-105 transition-all shadow-xl"
              >
                <Plus className="w-6 h-6" />
                إضافة لعبة
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredGames.length > 0 ? filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1A1A1A] rounded-[3rem] p-8 shadow-xl shadow-black/10 border border-white/5 flex flex-col items-center text-center space-y-6 group relative hover:border-brand-primary/30 transition-all"
            >
                {isAdmin && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGame(game.id);
                    }}
                    className="absolute top-6 left-6 z-20 p-3 bg-red-600 text-white rounded-2xl transition-all shadow-xl hover:scale-110 active:scale-95"
                    title="حذف اللعبة"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

              <div className="w-full aspect-square rounded-[2rem] overflow-hidden shadow-2xl skew-y-3 group-hover:skew-y-0 transition-transform duration-500 mb-4">
                <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-brand-text uppercase">{game.name}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{game.description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full py-6 border-y border-white/5">
                <div className="space-y-1">
                  <Users className="w-5 h-5 text-brand-primary mx-auto" />
                  <span className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">اللاعبين</span>
                  <p className="font-bold text-sm text-brand-text">{game.players}</p>
                </div>
                <div className="space-y-1">
                  <Clock className="w-5 h-5 text-brand-primary mx-auto" />
                  <span className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">الوقت</span>
                  <p className="font-bold text-sm text-brand-text">{game.playTime}</p>
                </div>
                <div className="space-y-1">
                  <BrainCircuit className="w-5 h-5 text-brand-primary mx-auto" />
                  <span className="text-[10px] font-black text-gray-500 uppercase block tracking-widest">الصعوبة</span>
                  <p className="font-bold text-sm text-brand-text">{game.difficulty}</p>
                </div>
              </div>

              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedGame(game);
                }}
                className="w-full py-4 bg-white/5 rounded-2xl text-brand-text font-black border border-white/5 hover:bg-brand-primary hover:text-brand-bg transition-all active:scale-95"
              >
                تعرف على القواعد والتفاصيل
              </button>
            </motion.div>
          )) : (
            <div className="col-span-full py-20 text-center text-gray-500 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/10">
              <Dice5 className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-lg">لا توجد ألعاب متوفرة حالياً</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedGame && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGame(null)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-10 overflow-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedGame(null)}
                className="absolute top-8 left-8 text-gray-400 hover:text-brand-primary"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col md:flex-row gap-8 mb-8">
                <img src={selectedGame.image} className="w-full md:w-48 h-48 object-cover rounded-3xl" alt={selectedGame.name} />
                <div className="space-y-4">
                  <h2 className="text-4xl font-black text-brand-text">{selectedGame.name}</h2>
                  <div className="flex flex-wrap gap-4">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400"><Users className="w-4 h-4 text-brand-primary" /> {selectedGame.players}</span>
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400"><Clock className="w-4 h-4 text-brand-primary" /> {selectedGame.playTime}</span>
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400"><BrainCircuit className="w-4 h-4 text-brand-primary" /> {selectedGame.difficulty}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-brand-text mb-2">الوصف</h3>
                  <p className="text-gray-400 leading-relaxed text-lg">{selectedGame.description}</p>
                </div>
                {selectedGame.rules && (
                  <div>
                    <h3 className="text-xl font-bold text-brand-text mb-2 tracking-tight">قواعد اللعبة</h3>
                    <div className="bg-white/5 p-6 rounded-2xl text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {selectedGame.rules}
                    </div>
                  </div>
                )}
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
              className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-[2.5rem] p-10 overflow-hidden"
            >
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-8 left-8 text-gray-400 hover:text-brand-primary"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-3xl font-black text-brand-text mb-8">إضافة لعبة جديدة</h2>
              <form onSubmit={handleAddGame} className="space-y-6">
                <input 
                  type="text" required placeholder="اسم اللعبة"
                  value={newGame.name} onChange={(e) => setNewGame({...newGame, name: e.target.value})}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                />
                <textarea 
                  required placeholder="وصف اللعبة" rows={3}
                  value={newGame.description} onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                />
                <textarea 
                  placeholder="قواعد اللعبة" rows={3}
                  value={newGame.rules} onChange={(e) => setNewGame({...newGame, rules: e.target.value})}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text resize-none"
                />
                <input 
                  type="text" required placeholder="رابط الصورة"
                  value={newGame.image} onChange={(e) => setNewGame({...newGame, image: e.target.value})}
                  className="w-full px-6 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                />
                <div className="grid grid-cols-3 gap-4">
                  <input 
                    type="text" required placeholder="اللاعبين (2-4)"
                    value={newGame.players} onChange={(e) => setNewGame({...newGame, players: e.target.value})}
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                  <input 
                    type="text" required placeholder="الوقت (30 دقيقة)"
                    value={newGame.playTime} onChange={(e) => setNewGame({...newGame, playTime: e.target.value})}
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                  <input 
                    type="text" required placeholder="الصعوبة"
                    value={newGame.difficulty} onChange={(e) => setNewGame({...newGame, difficulty: e.target.value})}
                    className="w-full px-4 py-4 bg-white/5 border border-white/5 focus:border-brand-primary rounded-2xl outline-none text-brand-text"
                  />
                </div>
                <button type="submit" className="w-full py-5 bg-brand-primary text-brand-bg font-black rounded-2xl hover:scale-105 transition-all">
                  حفظ اللعبة
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
