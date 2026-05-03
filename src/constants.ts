/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserRole, type Event, type Place, type Game, type Post, type User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'u3',
    name: 'مدير النظام',
    email: 'admin@loopbgn.com',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
  }
];

export const MOCK_EVENTS: Event[] = [];

export const MOCK_PLACES: Place[] = [];

export const MOCK_GAMES: Game[] = [];

export const MOCK_POSTS: Post[] = [];
