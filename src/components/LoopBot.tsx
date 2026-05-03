/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, Sparkles, MessageCircle } from 'lucide-react';
import { getGameRecommendation } from '../services/geminiService';

export default function LoopBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'أهلاً بك! أنا مساعد loopbgn، خبير ألعاب الطاولة. كيف أقدر أساعدك اليوم؟ 🎲' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const response = await getGameRecommendation(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: response || 'عذراً، لم أستطع إيجاد رد مناسِب.' }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]" dir="rtl">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 left-0 w-[350px] max-w-[90vw] bg-[#1A1A1A] rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-brand-bg p-6 text-white flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary rounded-xl">
                  <Bot className="w-5 h-5 text-brand-bg" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-brand-text">مساعد loopbgn</h3>
                  <p className="text-[10px] text-brand-primary font-bold uppercase tracking-widest">متصل الآن</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-[#0D0D0D]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-brand-bg rounded-tr-none shadow-lg' 
                      : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-[#1A1A1A] border-t border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="اسألني عن أي لعبة..."
                  className="w-full pr-4 pl-12 py-4 bg-white/5 border border-white/5 rounded-2xl text-sm outline-none focus:border-brand-primary transition-all text-brand-text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  disabled={isLoading}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-brand-primary text-brand-bg rounded-xl hover:scale-105 transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-4 bg-yellow-400 rounded-full shadow-2xl shadow-yellow-400/30 flex items-center gap-3 overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform skew-x-12" />
        <MessageCircle className="w-6 h-6 text-[#120D26]" />
        <span className="text-[#120D26] font-black text-sm hidden group-hover:block pr-1">مساعد loopbgn</span>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
          <Sparkles className="w-2 h-2 text-white" />
        </div>
      </motion.button>
    </div>
  );
}
