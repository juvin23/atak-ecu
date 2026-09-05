import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { authenticateAdmin, generateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken({ id: user.id, username: user.username });
  return res.json({
    token,
    user: { id: user.id, username: user.username }
  });
});

// GET /api/auth/me
router.get('/me', authenticateAdmin, (req, res) => {
  const user = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json(user);
});

// GET /api/auth/users - List admins (Protected)
router.get('/users', authenticateAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, created_at FROM users ORDER BY id ASC').all();
  return res.json(users);
});

// POST /api/auth/users - Add new admin user (Protected)
router.post('/users', authenticateAdmin, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  if (username.length < 3 || password.length < 4) {
    return res.status(400).json({ error: 'Username must be at least 3 chars, password at least 4 chars.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
  const newUser = db.prepare('SELECT id, username, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json(newUser);
});

// DELETE /api/auth/users/:id - Delete admin user (Protected with Last Admin Rule)
router.delete('/users/:id', authenticateAdmin, (req, res) => {
  const userId = parseInt(req.params.id, 10);

  // Check admin count
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (count <= 1) {
    return res.status(400).json({
      error: 'Cannot delete the last admin user. At least one admin must exist in the system.'
    });
  }

  const targetUser = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (!targetUser) {
    return res.status(404).json({ error: 'Admin user not found.' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return res.json({ message: 'Admin user removed successfully.' });
});

export default router;
