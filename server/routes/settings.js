import express from 'express';
import db from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

const getSettingVal = (key, fallback) => {
  const row = db.prepare("SELECT value FROM settings WHERE key = ?").get(key);
  return row ? row.value : fallback;
};

const upsertSetting = (key, value) => {
  db.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
  `).run(key, value);
};

// GET /api/settings/whatsapp - Public
router.get('/settings/whatsapp', (req, res) => {
  const whatsapp_number = getSettingVal('whatsapp_number', '628123456789');
  const whatsapp_cart_template = getSettingVal('whatsapp_cart_template', 'Hai admin, mau bertanya terkait barang-barang berikut ini :');
  const whatsapp_single_template = getSettingVal('whatsapp_single_template', 'Hai admin, mau bertanya terkait barang berikut ini :');

  return res.json({
    whatsapp_number,
    whatsapp_cart_template,
    whatsapp_single_template
  });
});

// POST /api/admin/settings/whatsapp - Admin protected
router.post('/admin/settings/whatsapp', authenticateAdmin, (req, res) => {
  const { whatsapp_number, whatsapp_cart_template, whatsapp_single_template } = req.body;
  if (!whatsapp_number) {
    return res.status(400).json({ error: 'WhatsApp number is required.' });
  }

  // Clean non-digits for phone
  const cleanPhone = whatsapp_number.replace(/\D/g, '');
  if (cleanPhone.length < 8) {
    return res.status(400).json({ error: 'Invalid phone number format.' });
  }

  const cartTpl = whatsapp_cart_template || 'Hai admin, mau bertanya terkait barang-barang berikut ini :';
  const singleTpl = whatsapp_single_template || 'Hai admin, mau bertanya terkait barang berikut ini :';

  upsertSetting('whatsapp_number', cleanPhone);
  upsertSetting('whatsapp_cart_template', cartTpl);
  upsertSetting('whatsapp_single_template', singleTpl);

  return res.json({
    whatsapp_number: cleanPhone,
    whatsapp_cart_template: cartTpl,
    whatsapp_single_template: singleTpl,
    message: 'WhatsApp settings & custom message templates updated successfully.'
  });
});

export default router;
