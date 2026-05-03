import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import fs from "fs";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL: Supabase missing configuration. VITE_SUPABASE_URL or keys are not set.');
} else {
  console.log('Supabase configuration detected.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

let verificationCodes = new Map<string, { email: string, code: string, userData: any }>();

// In-memory fallback stores with file persistence
const DB_FILE = path.join(process.cwd(), 'local_db.json');
let localDb = {
  games: [],
  events: [],
  places: [],
  posts: [],
  applications: [],
  users: [],
  bookings: []
};

// Load local DB
try {
  if (fs.existsSync(DB_FILE)) {
    localDb = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    console.log('Local DB loaded successfully.');
  }
} catch (err) {
  console.error('Error loading local DB:', err);
}

function saveLocalDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(localDb, null, 2));
  } catch (err) {
    console.error('Error saving local DB:', err);
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());
  
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  const PORT = process.env.PORT || 3000;

  // Sign Up
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, gender, avatar } = req.body;
    
    try {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const tempId = uuidv4();
      
      verificationCodes.set(tempId, { 
        email, 
        code, 
        userData: { 
          name, 
          email, 
          password, 
          role: email === 'jiykhaled1@gmail.com' ? 'admin' : 'user', 
          gender,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` 
        } 
      });

      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'loopbgn <onboarding@resend.dev>',
          to: email,
          subject: 'رمز التحقق من حسابك في loopbgn',
          html: `<div dir="rtl"><h1>أهلاً ${name}!</h1><p>رمز التحقق الخاص بك هو: <strong>${code}</strong></p></div>`,
        });
      } else {
        console.log("RESEND_API_KEY missing - Simulation: Code is", code);
      }
      
      res.json({ tempId, message: "تم إرسال رمز التحقق" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "حدث خطأ ما" });
    }
  });

  // Verify Code
  app.post("/api/auth/verify", async (req, res) => {
    const { tempId, code } = req.body;
    const data = verificationCodes.get(tempId);

    if (!data || data.code !== code) {
      return res.status(400).json({ error: "الرمز غير صحيح" });
    }

    try {
      const newUser = { 
        ...data.userData, 
        id: uuidv4(), 
        verified: true,
        stats: { events: 0, attendance: 0, trophies: 0, balance: 0 }
      };
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([newUser])
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST205') {
          if (!localDb.users) localDb.users = [];
          localDb.users.push(newUser as never);
          saveLocalDb();
          verificationCodes.delete(tempId);
          return res.json({ user: newUser });
        }
        throw error;
      }

      verificationCodes.delete(tempId);
      res.json({ user: profile || newUser });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "فشل إنشاء الحساب" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    
    try {
      let user;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (error && error.code === 'PGRST205') {
        user = localDb.users?.find((u: any) => u.email === email && u.password === password);
      } else {
        user = data;
      }

      if (!user) {
        return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
      }

      // Hard-coded admin override
      if (user.email === 'jiykhaled1@gmail.com') {
        user.role = 'admin';
      }
      
      res.json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "حدث خطأ في تسجيل الدخول" });
    }
  });

  // Admin User Routes moved here
  app.get("/api/admin/users", async (req, res) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.users || []);
        throw error;
      }
      res.json(data || []);
    } catch (err) {
      res.json(localDb.users || []);
    }
  });

  app.patch("/api/admin/users/:id/role", async (req, res) => {
    const { role } = req.body;
    try {
      const { data, error } = await supabase.from('profiles').update({ role }).eq('id', req.params.id).select().single();
      if (error && error.code === 'PGRST205') {
        if (!localDb.users) localDb.users = [];
        const index = localDb.users.findIndex((u: any) => u.id === req.params.id);
        if (index !== -1) {
          (localDb.users[index] as any).role = role;
          saveLocalDb();
          return res.json(localDb.users[index]);
        }
      }
      if (error) throw error;
      res.json(data || { success: true });
    } catch (err) {
      res.status(500).json({ error: "فشل تحديث الرتبة" });
    }
  });

  // Bookings API
  app.get("/api/bookings", async (req, res) => {
    try {
      const { data, error } = await supabase.from('bookings').select('*');
      if (error && error.code === 'PGRST205') return res.json(localDb.bookings || []);
      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.json(localDb.bookings || []);
    }
  });

  app.get("/api/events/:id/bookings", async (req, res) => {
    try {
      const { data, error } = await supabase.from('bookings').select('*').eq('eventId', req.params.id);
      if (error && error.code === 'PGRST205') {
        const eventBookings = (localDb.bookings || []).filter((b: any) => b.eventId === req.params.id);
        return res.json(eventBookings);
      }
      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      const eventBookings = (localDb.bookings || []).filter((b: any) => b.eventId === req.params.id);
      res.json(eventBookings);
    }
  });

  app.post("/api/bookings", async (req, res) => {
    const booking = { 
      ...req.body, 
      id: uuidv4(), 
      attended: false, 
      created_at: new Date().toISOString() 
    };
    try {
      const { data, error } = await supabase.from('bookings').insert([booking]).select().single();
      if (error && error.code === 'PGRST205') {
        if (!localDb.bookings) localDb.bookings = [];
        localDb.bookings.push(booking as never);
        saveLocalDb();
        return res.json(booking);
      }
      if (error) throw error;
      res.json(data);
    } catch (err) {
      if (!localDb.bookings) localDb.bookings = [];
      localDb.bookings.push(booking as never);
      saveLocalDb();
      res.json(booking);
    }
  });

  app.patch("/api/bookings/:id/checkin", async (req, res) => {
    const { attended } = req.body;
    try {
      const { data, error } = await supabase.from('bookings').update({ attended }).eq('id', req.params.id).select().single();
      if (error && error.code === 'PGRST205') {
        const idx = (localDb.bookings || []).findIndex((b: any) => b.id === req.params.id);
        if (idx !== -1) {
          (localDb.bookings[idx] as any).attended = attended;
          saveLocalDb();
          return res.json(localDb.bookings[idx]);
        }
      }
      if (error) throw error;
      res.json(data);
    } catch (err) {
      const idx = (localDb.bookings || []).findIndex((b: any) => b.id === req.params.id);
      if (idx !== -1) {
        (localDb.bookings[idx] as any).attended = attended;
        saveLocalDb();
        res.json(localDb.bookings[idx]);
      } else {
        res.status(404).json({ error: "الحجز غير موجود" });
      }
    }
  });

  app.delete("/api/admin/users/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error && error.code === 'PGRST205') {
        if (localDb.users) {
          localDb.users = localDb.users.filter((u: any) => u.id !== id);
          saveLocalDb();
        }
        return res.json({ message: "تم حذف المستخدم محلياً" });
      }
      if (error) throw error;
      res.json({ message: "تم حذف المستخدم بنجاح" });
    } catch (err) {
      if (localDb.users) {
        localDb.users = localDb.users.filter((u: any) => u.id !== id);
        saveLocalDb();
      }
      res.json({ message: "تم حذف المستخدم بنجاح" });
    }
  });

  // Community: Get posts
  app.get("/api/posts", async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.posts);
        throw error;
      }
      res.json(data);
    } catch (err) {
      res.json(localDb.posts);
    }
  });

  // Community: Create post
  app.post("/api/posts", async (req, res) => {
    const { userId, userName, userAvatar, content } = req.body;
    const postToInsert = {
      id: uuidv4(),
      userId,
      userName,
      userAvatar,
      content,
      likes: 0,
      comments: 0,
      created_at: new Date().toISOString()
    };

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([postToInsert])
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST205') {
          localDb.posts.unshift(postToInsert as never);
          saveLocalDb();
          return res.json(postToInsert);
        }
        throw error;
      }
      res.json(data);
    } catch (err) {
      localDb.posts.unshift(postToInsert as never);
      saveLocalDb();
      res.json(postToInsert);
    }
  });

  // Admin/Owner: Delete post
  app.delete("/api/posts/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);

      if (error && error.code === 'PGRST205') {
        localDb.posts = localDb.posts.filter((p: any) => p.id !== id);
        saveLocalDb();
        return res.json({ message: "تم حذف المنشور محلياً" });
      }
      if (error) throw error;
      res.json({ message: "تم حذف المنشور" });
    } catch (err) {
      localDb.posts = localDb.posts.filter((p: any) => p.id !== id);
      saveLocalDb();
      res.json({ message: "تم حذف المنشور" });
    }
  });

  // Applications logic (Organizer Requests)
  app.get("/api/applications", async (req, res) => {
    try {
      const { data, error } = await supabase.from('applications').select('*');
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.applications);
        throw error;
      }
      res.json(data || []);
    } catch (err) {
      res.json(localDb.applications || []);
    }
  });

  app.post("/api/applications", async (req, res) => {
    const appToInsert = { ...req.body, id: uuidv4(), status: 'pending', created_at: new Date().toISOString() };
    try {
      const { data, error } = await supabase.from('applications').insert([appToInsert]).select().single();
      if (error) {
        if (error.code === 'PGRST205') {
          localDb.applications.push(appToInsert as never);
          saveLocalDb();
          return res.json(appToInsert);
        }
        throw error;
      }
      res.json(data || appToInsert);
    } catch (err) {
      localDb.applications.push(appToInsert as never);
      saveLocalDb();
      res.json(appToInsert);
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    const { status, userId } = req.body;
    try {
      const { data, error } = await supabase.from('applications').update({ status }).eq('id', req.params.id).select().single();
      
      let application;
      if (error && error.code === 'PGRST205') {
        const index = localDb.applications.findIndex((a: any) => a.id === req.params.id);
        if (index !== -1) {
          (localDb.applications[index] as any).status = status;
          application = localDb.applications[index];
        }
      } else {
        application = data;
      }

      if (status === 'accepted' && userId) {
        await supabase.from('profiles').update({ role: 'organizer' }).eq('id', userId);
        // Also update locally if needed
        if (localDb.users) {
          const uIdx = localDb.users.findIndex((u: any) => u.id === userId);
          if (uIdx !== -1) localDb.users[uIdx].role = 'organizer';
        }
      }

      saveLocalDb();
      res.json(application || { success: true });
    } catch (err) {
      res.status(500).json({ error: "فشل تحديث الطلب" });
    }
  });

  // Games: CRUD
  app.get("/api/games", async (req, res) => {
    try {
      const { data, error } = await supabase.from('games').select('*');
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.games);
        throw error;
      }
      res.json(data);
    } catch (err) {
      res.json(localDb.games);
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from('games').select('*').eq('id', req.params.id).single();
      if (error && error.code === 'PGRST205') {
        const game = localDb.games.find((g: any) => g.id === req.params.id);
        return game ? res.json(game) : res.status(404).json({ error: "Game not found" });
      }
      if (error) throw error;
      res.json(data);
    } catch (err) {
      const game = localDb.games.find((g: any) => g.id === req.params.id);
      game ? res.json(game) : res.status(404).json({ error: "Game not found" });
    }
  });

  app.post("/api/games", async (req, res) => {
    const { name, description, image, players, playTime, difficulty, rules } = req.body;
    const gameToInsert: any = {
      id: uuidv4(),
      name,
      description,
      image,
      players,
      playTime,
      difficulty,
      rules: rules || ''
    };
    
    try {
      const { data, error } = await supabase.from('games').insert([gameToInsert]).select().single();
      if (error) {
        if (error.code === 'PGRST205') {
          localDb.games.push(gameToInsert as never);
          saveLocalDb();
          return res.json(gameToInsert);
        }
        return res.status(400).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      localDb.games.push(gameToInsert as never);
      saveLocalDb();
      res.json(gameToInsert);
    }
  });

  app.delete("/api/games/:id", async (req, res) => {
    try {
      const { error } = await supabase.from('games').delete().eq('id', req.params.id);
      if (error && error.code === 'PGRST205') {
        localDb.games = localDb.games.filter((g: any) => g.id !== req.params.id);
        saveLocalDb();
        return res.json({ message: "تم حذف اللعبة محلياً" });
      }
      if (error) throw error;
      localDb.games = localDb.games.filter((g: any) => g.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف اللعبة" });
    } catch (err) {
      localDb.games = localDb.games.filter((g: any) => g.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف اللعبة" });
    }
  });

  // Events: CRUD
  app.get("/api/events", async (req, res) => {
    try {
      const { data, error } = await supabase.from('events').select('*');
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.events);
        throw error;
      }
      res.json(data);
    } catch (err) {
      res.json(localDb.events);
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', req.params.id).single();
      if (error && error.code === 'PGRST205') {
        const event = localDb.events.find((e: any) => e.id === req.params.id);
        return event ? res.json(event) : res.status(404).json({ error: "Event not found" });
      }
      if (error) throw error;
      res.json(data);
    } catch (err) {
      const event = localDb.events.find((e: any) => e.id === req.params.id);
      event ? res.json(event) : res.status(404).json({ error: "Event not found" });
    }
  });

  app.post("/api/events", async (req, res) => {
    const { title, description, date, time, location, image, type, city, lat, lng, radius, details } = req.body;
    const eventToInsert: any = { 
      id: uuidv4(),
      title, 
      description, 
      date, 
      time, 
      location, 
      image, 
      type, 
      city,
      details: details || '',
      lat: lat || 24.7,
      lng: lng || 46.7,
      radius: radius || 200
    };
    
    try {
      const { data, error } = await supabase.from('events').insert([eventToInsert]).select().single();
      if (error) {
        if (error.code === 'PGRST205') {
          localDb.events.push(eventToInsert as never);
          saveLocalDb();
          return res.json(eventToInsert);
        }
        return res.status(400).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      localDb.events.push(eventToInsert as never);
      saveLocalDb();
      res.json(eventToInsert);
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', req.params.id);
      if (error && error.code === 'PGRST205') {
        localDb.events = localDb.events.filter((e: any) => e.id !== req.params.id);
        saveLocalDb();
        return res.json({ message: "تم حذف الفعالية محلياً" });
      }
      if (error) throw error;
      localDb.events = localDb.events.filter((e: any) => e.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف الفعالية" });
    } catch (err) {
      localDb.events = localDb.events.filter((e: any) => e.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف الفعالية" });
    }
  });

  // Places: CRUD
  app.get("/api/places", async (req, res) => {
    try {
      const { data, error } = await supabase.from('places').select('*');
      if (error) {
        if (error.code === 'PGRST205') return res.json(localDb.places);
        throw error;
      }
      res.json(data);
    } catch (err) {
      res.json(localDb.places);
    }
  });

  app.get("/api/places/:id", async (req, res) => {
    try {
      const { data, error } = await supabase.from('places').select('*').eq('id', req.params.id).single();
      if (error && error.code === 'PGRST205') {
        const place = localDb.places.find((p: any) => p.id === req.params.id);
        return place ? res.json(place) : res.status(404).json({ error: "Place not found" });
      }
      if (error) throw error;
      res.json(data);
    } catch (err) {
      const place = localDb.places.find((p: any) => p.id === req.params.id);
      place ? res.json(place) : res.status(404).json({ error: "Place not found" });
    }
  });

  app.post("/api/places", async (req, res) => {
    const { name, description, city, image, rating, features, lat, lng, radius, details } = req.body;
    const placeToInsert: any = { 
      id: uuidv4(),
      name, 
      description, 
      city, 
      image, 
      rating, 
      features,
      details: details || '',
      lat: lat || 24.7,
      lng: lng || 46.7,
      radius: radius || 200
    };

    try {
      const { data, error } = await supabase.from('places').insert([placeToInsert]).select().single();
      if (error) {
        if (error.code === 'PGRST205') {
          localDb.places.push(placeToInsert as never);
          saveLocalDb();
          return res.json(placeToInsert);
        }
        return res.status(400).json({ error: error.message });
      }
      res.json(data);
    } catch (err) {
      localDb.places.push(placeToInsert as never);
      saveLocalDb();
      res.json(placeToInsert);
    }
  });

  app.delete("/api/places/:id", async (req, res) => {
    try {
      const { error } = await supabase.from('places').delete().eq('id', req.params.id);
      if (error && error.code === 'PGRST205') {
        localDb.places = localDb.places.filter((p: any) => p.id !== req.params.id);
        saveLocalDb();
        return res.json({ message: "تم حذف المكان محلياً" });
      }
      if (error) throw error;
      localDb.places = localDb.places.filter((p: any) => p.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف المكان" });
    } catch (err) {
      localDb.places = localDb.places.filter((p: any) => p.id !== req.params.id);
      saveLocalDb();
      res.json({ message: "تم حذف المكان" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
