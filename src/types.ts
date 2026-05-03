/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  USER = 'user',
  ORGANIZER = 'organizer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  gender?: 'male' | 'female';
  stats?: {
    events: number;
    attendance: number;
    trophies: number;
    balance: number;
  };
}

export interface Event {
  id: string;
  title: string;
  city: string;
  location: string;
  date: string;
  time: string;
  price?: number;
  maxPlayers?: number;
  currentPlayers?: number;
  description: string;
  image: string;
  organizerId?: string;
  type: string;
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface Place {
  id: string;
  name: string;
  rating: number;
  image: string;
  city: string;
  description?: string;
  features?: string[];
  lat?: number;
  lng?: number;
  radius?: number;
}

export interface Game {
  id: string;
  name: string;
  image: string;
  description: string;
  difficulty: string;
  players: string;
  playTime: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp?: string;
  created_at?: string;
  likes: number;
  comments: number;
}
