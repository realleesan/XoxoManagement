import supabase from '../utils/supabase.js';
import db from '../utils/db.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import { createId } from '@paralleldrive/cuid2';

export const register = async (email, password, name, role = 'USER') => {
  // Không cho phép đăng ký với role ADMIN
  if (role && role.toUpperCase() === 'ADMIN') {
    throw new Error('Không thể đăng ký với vai trò Admin');
  }

  // Check if user exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found (OK)
    throw new Error('Error checking user: ' + checkError.message);
  }

  if (existingUser) {
    throw new Error('Email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate ID (cuid2)
  const userId = createId();
  const now = new Date().toISOString();

  // Create user using raw SQL để tránh vấn đề với Supabase client
  const result = await db.query(
    `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, email, name, role`,
    [userId, email, hashedPassword, name, role.toUpperCase(), now, now]
  );

  if (!result.rows || result.rows.length === 0) {
    throw new Error('Error creating user: No data returned');
  }

  const user = result.rows[0];

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user,
    token,
  };
};

export const login = async (email, password) => {
  // Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, password, name, role')
    .eq('email', email)
    .single();

  if (error || !user) {
    throw new Error('Invalid email or password');
  }

  // Check password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
};

export const getMe = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', userId)
    .single();

  if (error || !user) {
    throw new Error('User not found');
  }

  return user;
};

