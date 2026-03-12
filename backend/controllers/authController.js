import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/user.js';
import pool from '../database/dlibrarydb.js';
import dotenv from 'dotenv';
dotenv.config();

const SALT_ROUNDS = 10;

export async function register(req, res) {
  const { firstName, lastName, email, universityId, password } = req.body;

  const isAdminEmail = email && email.endsWith('@bfu.bg');
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!isAdminEmail && !universityId) {
    return res.status(400).json({ error: 'University ID is required for student accounts' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  if (await findUserByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  let role = 'USER';
  if (email.endsWith('@students.bfu.bg')) {
    role = 'USER';
  } else if (email.endsWith('@bfu.bg')) {
    role = 'ADMIN';
  }

  try {
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const finalUniversityId = isAdminEmail ? (universityId || null) : universityId;
    const user = await createUser({ firstName, lastName, email, universityId: finalUniversityId, password: hashed, role });
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.status !== 'APPROVED') {
      return res.status(403).json({ 
        error: 'Account pending approval. Please wait for admin approval before logging in.' 
      });
    }
    
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
}

export async function profile(req, res) {
  try {
    const userId = req.user.sub;
    const result = await pool.query(
      `SELECT id, "firstName", "lastName", email, university_id AS "universityId", role, status
       FROM users
       WHERE id = $1`,
      [userId]
    );
    
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = result.rows[0];
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        universityId: user.universityId,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
}