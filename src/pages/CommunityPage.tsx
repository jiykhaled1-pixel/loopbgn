/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  Send, 
  Image as ImageIcon, 
  MapPin, 
  Trash2,
  Plus
} from 'lucide-react';
import { UserRole, type User, type Post } from '../types';

export default function CommunityPage({ user }: { user: User | null }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      if (res.ok) {
        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch posts", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userAvatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
          content: newPostContent
        })
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts(prev => [newPost, ...(Array.isArray(prev) ? prev : [])]);
        setNewPostContent('');
        setIsCreating(false);
        alert('تم النشر بنجاح');
      } else {
        alert('حدث خطأ أثناء النشر');
      }
    } catch (err) {
      console.error("Failed to create post", err);
      alert("حدث خطأ أثناء النشر. يرجى المحاولة لاحقاً.");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
        alert('تم حذف المنشور');
      }
    } catch (err) {
      console.error("Failed to delete post", err);
      alert('خطأ في حذف المنشور');
    }
  };

  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-brand-bg pb-20 pt-10" dir="rtl">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Community Header */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl font-black text-brand-text">المجتمع</h1>
          <p className="text-gray-400">تواصل مع لاعبين آخرين، شارك تجاربك، وابحث عن فريقك الجديد.</p>
        </div>

        {/* Create Post Area */}
        {user ? (
          <div className="bg-white/5 rounded-[2rem] p-6 shadow-xl border border-white/10 mb-10">
            {!isCreating ? (
              <button 
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl text-gray-400 hover:bg-white/10 transition-all text-right"
              >
                <img src={user.avatar} className="w-10 h-10 rounded-full bg-white shadow-sm" alt="me" />
                <span>ماذا يدور في ذهنك يا {user.name.split(' ')[0]}؟</span>
                <Plus className="mr-auto w-5 h-5" />
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={user.avatar} className="w-10 h-10 rounded-full" alt="me" />
                  <span className="font-bold text-brand-text">{user.name}</span>
                </div>
                <textarea
                  autoFocus
                  placeholder="اكتب شيئاً للمجتمع..."
                  className="w-full min-h-[150px] p-4 bg-white/5 rounded-2xl border-none outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none text-lg text-brand-text"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                />
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex gap-2">
                    <button className="p-2.5 text-gray-400 hover:bg-white/10 rounded-xl transition-all"><ImageIcon className="w-5 h-5" /></button>
                    <button className="p-2.5 text-gray-400 hover:bg-white/10 rounded-xl transition-all"><MapPin className="w-5 h-5" /></button>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsCreating(false)}
                      className="px-6 py-2.5 text-gray-400 font-bold hover:bg-white/10 rounded-xl transition-all"
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim()}
                      className="px-8 py-2.5 bg-brand-primary text-brand-bg rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      نشر
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-brand-primary/20 to-brand-bg rounded-[2rem] p-8 text-brand-text mb-10 text-center border border-white/10 space-y-6">
            <h3 className="text-xl font-bold">انضم إلينا لتشارك في النقاش!</h3>
            <p className="text-gray-400">تحتاج لتسجيل الدخول لتتمكن من إنشاء منشورات والتفاعل مع المجتمع.</p>
            <div className="pt-2">
              <Link to="/login" className="px-8 py-3 bg-brand-primary text-brand-bg rounded-xl font-bold inline-block">تسجيل الدخول</Link>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-8">
          <AnimatePresence>
            {posts.length > 0 ? posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/5 rounded-[2.5rem] p-8 shadow-xl border border-white/10"
              >
                {/* Post Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <img src={post.userAvatar} alt={post.userName} className="w-12 h-12 rounded-full bg-white/10 shadow-sm" />
                    <div>
                      <h4 className="font-bold text-brand-text">{post.userName}</h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {post.timestamp || new Date(post.created_at || '').toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                  { (isAdmin || user?.id === post.userId) && (
                    <button 
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-8">
                  <p className="text-gray-300 text-lg leading-[1.7] whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                  <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-red-500/10 transition-colors">
                      <Heart className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors group">
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-brand-primary/10 transition-colors">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm">{post.comments}</span>
                  </button>
                  <button className="mr-auto flex items-center gap-2 text-gray-500 hover:text-brand-primary group">
                    <div className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                      <Share2 className="w-5 h-5" />
                    </div>
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="py-20 text-center bg-[#1A1A1A] rounded-[2.5rem] border border-dashed border-white/10 shadow-sm">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-100" />
                <p className="text-gray-400 font-bold text-lg">المجتمع هادئ حالياً...</p>
                <p className="text-gray-400">ابدأ أول محادثة وشجع الآخرين على الانضمام!</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
