import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { dbAsync } from '../database/db.js';
import { config } from '../config/index.js';
import { AuthRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters')
});

const loginSchema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(1, 'Password is required')
});

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const validated = registerSchema.safeParse(req.body);
      if (!validated.success) {
        res.status(400).json({
          success: false,
          message: validated.error.errors[0]?.message || 'Validation error'
        });
        return;
      }

      const { email, password, full_name } = validated.data;

      // Check existing email
      const existingUser = await dbAsync.get('SELECT id FROM users WHERE email = ?', [email]);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Email is already registered' });
        return;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const today = new Date().toISOString().split('T')[0];

      const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=5B5FEF&color=fff`;

      const result = await dbAsync.run(
        `INSERT INTO users (email, password_hash, full_name, avatar_url, daily_goal_minutes, streak_count, last_active_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, passwordHash, full_name, defaultAvatar, 15, 1, today]
      );

      const userId = result.lastID;
      const token = jwt.sign({ id: userId, email }, config.jwtSecret, {
        expiresIn: '7d'
      });

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          token,
          user: {
            id: userId,
            email,
            full_name,
            avatar_url: defaultAvatar,
            daily_goal_minutes: 15,
            streak_count: 1
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Register failed' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.safeParse(req.body);
      if (!validated.success) {
        res.status(400).json({
          success: false,
          message: validated.error.errors[0]?.message || 'Validation error'
        });
        return;
      }

      const { email, password } = validated.data;
      const user = await dbAsync.get<any>('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        res.status(401).json({ success: false, message: 'Incorrect email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Incorrect email or password' });
        return;
      }

      // Update streak and last_active_date
      const today = new Date().toISOString().split('T')[0];
      let newStreak = user.streak_count || 1;

      if (user.last_active_date) {
        const lastDate = new Date(user.last_active_date);
        const currentDate = new Date(today);
        const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1; // Streak broken
        }
      }

      await dbAsync.run(
        'UPDATE users SET streak_count = ?, last_active_date = ? WHERE id = ?',
        [newStreak, today, user.id]
      );

      const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
        expiresIn: '7d'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            daily_goal_minutes: user.daily_goal_minutes,
            streak_count: newStreak
          }
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  },

  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const user = await dbAsync.get<any>(
        'SELECT id, email, full_name, avatar_url, daily_goal_minutes, streak_count, last_active_date, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch user' });
    }
  }
};
