/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Users, 
  Calendar, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  Activity,
  UserCheck,
  UserPlus,
  ChevronDown,
  Mail,
  ClipboardList,
  CheckCircle2,
  UserX
} from 'lucide-react';
import { type User, UserRole } from '../types';

export default function AdminPage({ user }: { user: User | null }) {
  const [userList, setUserList] = useState<any[]>([]);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, events: 0, organizers: 0, requests: 0 });

  useEffect(() => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setUserList(Array.isArray(data) ? data : []);
        setStats(prev => ({
          ...prev,
          users: Array.isArray(data) ? data.length : 0,
          organizers: Array.isArray(data) ? data.filter((u: any) => u.role === 'organizer').length : 0,
        }));
      });

    fetch('/api/applications')
      .then(res => res.json())
      .then(data => {
        const pending = Array.isArray(data) ? data.filter((a: any) => a.status === 'pending') : [];
        setActiveRequests(pending);
        setStats(prev => ({ ...prev, requests: pending.length }));
      });
  }, []);

  const handleApplicationStatus = async (id: string, status: 'accepted' | 'rejected', userId: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, userId })
      });
      if (res.ok) {
        setActiveRequests(prev => prev.filter(r => r.id !== id));
        setStats(prev => ({ ...prev, requests: prev.requests - 1 }));
        if (status === 'accepted') {
          setUserList(prev => prev.map(u => u.id === userId ? { ...u, role: 'organizer' } : u));
          alert('تم قبول الطلب وترقية المستخدم لمستوى منظم');
        } else {
          alert('تم رفض الطلب');
        }
      } else {
        alert('حدث خطأ أثناء معالجة الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم');
    }
  };

  const handleRoleChange = async (id: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        setUserList(userList.map(u => u.id === id ? { ...u, role: newRole } : u));
        alert('تم تحديث رتبة المستخدم بنجاح');
      } else {
        alert('فشل تحديث الرتبة من الخادم');
      }
    } catch (err) {
      console.error(err);
      alert('خطأ في الاتصال بالبرمجية الخلفية');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUserList(userList.filter(u => u.id !== id));
      setStats({ ...stats, users: stats.users - 1 });
    }
  };

  // Security check
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg p-6" dir="rtl">
        <div className="bg-white/5 p-12 rounded-[3rem] shadow-2xl border border-white/10 text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-brand-text">منطقة محظورة</h1>
          <p className="text-gray-400">ليست لديك الصلاحيات الكافية للوصول لهذه الصفحة. يرجى التواصل مع المسؤول.</p>
          <Link to="/" className="inline-block px-8 py-3 bg-brand-primary text-brand-bg rounded-xl font-bold">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-20 pt-10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Admin Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-3xl font-black flex items-center gap-3">
              <ShieldAlert className="text-brand-primary" />
              لوحة تحكم المدير
            </h1>
            <p className="text-gray-400 text-sm">مرحباً بك في غرفة التحكم المركزية لـ loopbgn</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
              <span className="text-[10px] text-gray-500 block mb-1 uppercase tracking-widest font-bold">الحالة التشغيلية</span>
              <span className="flex items-center gap-2 text-green-400 font-bold text-sm">
                <Activity className="w-4 h-4 animate-pulse" /> متصل
              </span>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'إجمالي المستخدمين', val: stats.users, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
            { label: 'الفعاليات', val: stats.events, icon: Calendar, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
            { label: 'المنظمين المعتمدين', val: stats.organizers, icon: UserCheck, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
            { label: 'طلبات جديدة', val: stats.requests, icon: UserPlus, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 p-6 rounded-[2rem] border border-white/10 shadow-xl flex items-center gap-6"
            >
              <div className={`p-4 rounded-2xl ${item.bg} ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">{item.label}</span>
                <span className="text-2xl font-black">{item.val}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="mt-12 bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-brand-primary/5">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <ClipboardList className="text-brand-primary" />
              الطلبات الجديدة (تنظيم فعاليات)
            </h2>
            <span className="bg-brand-primary/20 text-brand-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
              {activeRequests.length} طلبات قيد المراجعة
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-sm uppercase tracking-widest font-bold">
                  <th className="px-8 py-6">المتقدم</th>
                  <th className="px-8 py-6">رقم الجوال</th>
                  <th className="px-8 py-6">اسم الفعالية</th>
                  <th className="px-8 py-6">تاريخ الطلب</th>
                  <th className="px-8 py-6 text-left">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activeRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6 text-lg font-bold text-brand-text">{req.name}</td>
                    <td className="px-8 py-6 text-gray-400 font-mono" dir="ltr">{req.phone}</td>
                    <td className="px-8 py-6">
                      <span className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-xl font-bold border border-brand-primary/20">
                        {req.eventName}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-medium">{req.date}</td>
                    <td className="px-8 py-6 text-left">
                       <div className="flex items-center justify-end gap-2 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => handleApplicationStatus(req.id, 'accepted', req.userId)}
                           className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-brand-bg rounded-xl transition-all"
                         >
                            <CheckCircle2 className="w-5 h-5" />
                         </button>
                         <button 
                           onClick={() => handleApplicationStatus(req.id, 'rejected', req.userId)}
                           className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-brand-bg rounded-xl transition-all"
                         >
                            <UserX className="w-5 h-5" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Table Design */}
        <div className="bg-white/5 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
          <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
            <h2 className="text-xl font-bold">قائمة المستخدمين</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-sm uppercase tracking-widest font-bold">
                  <th className="px-8 py-6">الاسم</th>
                  <th className="px-8 py-6">البريد الإلكتروني</th>
                  <th className="px-8 py-6">الرتبة</th>
                  <th className="px-8 py-6 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                        <span className="font-bold text-lg">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-400 font-medium">{u.email}</td>
                    <td className="px-8 py-6">
                      <div className="relative inline-block w-40">
                        <select 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="w-full bg-brand-bg border border-white/10 text-brand-text px-4 py-2.5 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-brand-primary font-bold text-sm"
                        >
                          <option value="user" className="bg-brand-bg">مستخدم</option>
                          <option value="organizer" className="bg-brand-bg">منظم</option>
                          <option value="admin" className="bg-brand-bg">مدير</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-8 py-6 text-left">
                       <button 
                         onClick={() => handleDeleteUser(u.id)}
                         className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {userList.length === 0 && (
            <div className="p-20 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              لا يوجد مستخدمين لعرضهم
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
