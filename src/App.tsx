/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  MapPin, 
  Gamepad2, 
  Users2, 
  LogIn, 
  PlusCircle, 
  Menu, 
  X,
  Search,
  Dice5
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, type User } from './types';
import { MOCK_USERS } from './constants';

// Pages (will implement next)
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import EventDetailsPage from './pages/EventDetailsPage';
import PlacesPage from './pages/PlacesPage';
import GamesPage from './pages/GamesPage';
import CommunityPage from './pages/CommunityPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import RequestOrganizerPage from './pages/RequestOrganizerPage';

// Components
import LoopBot from './components/LoopBot';
import Logo from './components/Logo';

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'المجتمع', path: '/community', icon: Users2 },
    { name: 'الفعاليات', path: '/events', icon: Calendar },
    { name: 'الأماكن', path: '/places', icon: MapPin },
    { name: 'الألعاب', path: '/games', icon: Gamepad2 },
  ];

  return (
    <header className="sticky top-0 z-50 bg-brand-bg/95 backdrop-blur-sm border-b border-white/5" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="hover:scale-105 transition-transform">
            <Logo size="md" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-primary ${
                  location.pathname === link.path ? 'text-brand-primary underline underline-offset-8' : 'text-gray-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {user?.role === UserRole.ADMIN && (
              <Link
                to="/admin"
                className={`text-sm font-bold transition-colors hover:text-red-400 flex items-center gap-2 ${
                  location.pathname === '/admin' ? 'text-red-400 underline underline-offset-8 transition-all' : 'text-brand-primary/80'
                }`}
              >
                لوحة المسؤول
              </Link>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {user.role === UserRole.ORGANIZER && (
                  <Link 
                    to="/events/create" 
                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-brand-bg rounded-full text-sm font-bold hover:scale-105 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    أضف فعالية
                  </Link>
                )}
                <div className="flex items-center gap-3 pr-4 border-r border-white/5">
                  <Link to="/dashboard" className="flex items-center gap-3 group/user">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden group-hover/user:ring-2 ring-brand-primary transition-all flex items-center justify-center">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `<span class="text-[10px] font-bold text-brand-primary">${user.name.charAt(0)}</span>`;
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-brand-text group-hover/user:text-brand-primary transition-colors">{user.name}</span>
                  </Link>
                  <button onClick={onLogout} className="text-xs text-red-500 hover:text-red-400">خروج</button>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-brand-bg rounded-full text-sm font-bold hover:scale-105 transition-all"
              >
                <LogIn className="w-4 h-4" />
                تسجيل دخول
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-16 left-0 w-full bg-brand-bg border-b border-white/10 p-4 space-y-4"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 text-lg font-medium hover:text-brand-primary ${
                  location.pathname === link.path ? 'text-brand-primary' : 'text-gray-300'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.name}
              </Link>
            ))}
            {user?.role === UserRole.ADMIN && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 text-lg font-bold hover:text-red-400 ${
                  location.pathname === '/admin' ? 'text-red-400' : 'text-brand-primary/80'
                }`}
              >
                <Dice5 className="w-5 h-5" />
                لوحة المسؤول
              </Link>
            )}
            <hr className="border-white/10" />
            {!user && (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary text-brand-bg rounded-xl font-bold"
              >
                تسجيل دخول
              </Link>
            )}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center">
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `<span class="text-sm font-bold text-brand-primary">${user.name.charAt(0)}</span>`;
                      }}
                    />
                  </div>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <button 
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="w-full py-2 text-red-500 border border-red-500/20 rounded-xl"
                >
                  تسجيل خروج
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  // Persistence (simple)
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-brand-bg flex flex-col font-sans overflow-x-hidden selection:bg-brand-primary/30">
        <Header user={user} onLogout={handleLogout} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/events" element={<EventsPage user={user} />} />
            <Route path="/events/:id" element={<EventDetailsPage user={user} />} />
            <Route path="/events/create" element={<CreateEventPage />} />
            <Route path="/places" element={<PlacesPage user={user} />} />
            <Route path="/games" element={<GamesPage user={user} />} />
            <Route path="/community" element={<CommunityPage user={user} />} />
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<DashboardPage user={user} />} />
            <Route path="/admin" element={<AdminPage user={user} />} />
            <Route path="/request-organizer" element={<RequestOrganizerPage />} />
          </Routes>
        </main>
        
        <LoopBot />

        <footer className="bg-brand-bg text-brand-text py-12 px-4 border-t border-white/5" dir="rtl">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <Logo size="md" />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                مجتمعك المتكامل لألعاب الطاولة في العالم العربي. نجمع اللاعبين، المنظمين، وأصحاب الأماكن في مكان واحد.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-brand-primary">روابط سريعة</h3>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link to="/events" className="hover:text-brand-primary transition-colors">الفعاليات</Link></li>
                <li><Link to="/places" className="hover:text-brand-primary transition-colors">الأماكن</Link></li>
                <li><Link to="/games" className="hover:text-brand-primary transition-colors">الألعاب</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 text-brand-primary">تواصل معنا</h3>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/loop_gamenight?igsh=MTFsM2dwcjd3MHZrZA==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-sm text-gray-300 hover:text-white"
                >
                  <Search className="w-4 h-4 text-pink-500" />
                  انستقرام
                </a>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-xs text-gray-600">
            &copy; 2026 loopbgn. جميع الحقوق محفوظة.
          </div>
        </footer>
      </div>
    </Router>
  );
}
