import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'app.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      ref_no TEXT NOT NULL,
      brand TEXT NOT NULL,
      type TEXT NOT NULL,
      year TEXT NOT NULL,
      model TEXT NOT NULL,
      status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      is_primary INTEGER DEFAULT 0,
      status TEXT CHECK(status IN ('draft', 'published')) DEFAULT 'draft',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default admin if no users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run('admin', hash);
    console.log('Seeded default admin user: admin / admin123');
  }

  // Seed default settings if not exists
  const getSetting = (key) => db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  
  if (!getSetting('whatsapp_number')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('whatsapp_number', '628123456789');
  }
  if (!getSetting('whatsapp_cart_template')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(
      'whatsapp_cart_template',
      'Hai admin, mau bertanya terkait barang-barang berikut ini :'
    );
  }
  if (!getSetting('whatsapp_single_template')) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run(
      'whatsapp_single_template',
      'Hai admin, mau bertanya terkait barang berikut ini :'
    );
  }

  // Seed demo products if empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (productCount === 0) {
    seedDemoProducts();
  }
}

function seedDemoProducts() {
  const insertProduct = db.prepare(`
    INSERT INTO products (title, description, price, ref_no, brand, type, year, model, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, image_url, is_primary, status)
    VALUES (?, ?, ?, ?)
  `);

  const demoProducts = [
    {
      title: 'ATAK ECU 2000 Pro Standalone Engine Control Unit',
      description: 'Flagship standalone ECU with real-time Bluetooth tuning, sequential fuel injection, 3D ignition mapping, integrated MAP sensor, and launch control.',
      price: 14500000,
      ref_no: 'ATAK-2000-PRO',
      brand: 'ATAK ECU 2000',
      type: 'ECU & Electronics',
      year: '2015-2024',
      model: 'Universal / Honda Civic / Toyota 86',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'ATAK ECU 2000 Plug & Play Wire Harness Adapter',
      description: 'OEM grade automotive wiring harness adapter for seamless installation of ATAK ECU 2000 without cutting factory wiring.',
      price: 2800000,
      ref_no: 'ATAK-PnP-H01',
      brand: 'ATAK ECU 2000',
      type: 'Wiring & Accessories',
      year: '2016-2022',
      model: 'Civic FK8 / GR Yaris',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'ATAK ECU 2000 Dual Channel Wideband O2 Controller Module',
      description: 'High-precision AFR wideband controller with Bosch LSU 4.9 sensor interface for real-time auto-lambda feedback tuning.',
      price: 4200000,
      ref_no: 'ATAK-WB- Bosch',
      brand: 'ATAK ECU 2000',
      type: 'Sensors & Controllers',
      year: '2010-2025',
      model: 'All Vehicles',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Brembo GT 6-Piston Big Brake Kit',
      description: 'High-performance forged aluminum monoblock calipers with 380mm slotted 2-piece rotors for extreme stopping power.',
      price: 32500000,
      ref_no: 'BM-GT6P-380',
      brand: 'BMW',
      type: 'Brakes',
      year: '2018-2023',
      model: 'M3 / M4 (F80/F82)',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'KW Variant 3 Coilover Suspension Kit',
      description: 'Independently adjustable rebound and compression damping settings for custom chassis response and stance lowering.',
      price: 28900000,
      ref_no: 'KW-35220085',
      brand: 'Toyota',
      type: 'Suspension',
      year: '2019-2024',
      model: 'GR Supra / GT86',
      status: 'published',
      images: [
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  demoProducts.forEach(prod => {
    const res = insertProduct.run(
      prod.title,
      prod.description,
      prod.price,
      prod.ref_no,
      prod.brand,
      prod.type,
      prod.year,
      prod.model,
      prod.status
    );
    const productId = res.lastInsertRowid;
    prod.images.forEach((imgUrl, idx) => {
      insertImage.run(productId, imgUrl, idx === 0 ? 1 : 0, 'published');
    });
  });
}

export default db;
