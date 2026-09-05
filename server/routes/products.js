import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import db from '../db.js';
import { authenticateAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer Storage Configuration
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'part-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
      return cb(null, true);
    }
    cb(new Error('Only JPG, PNG, and WEBP image files are allowed.'));
  }
});

// Helper to format product with images
function attachImagesToProducts(products, adminView = false) {
  if (!products || products.length === 0) return [];
  const productIds = products.map(p => p.id);
  const placeholders = productIds.map(() => '?').join(',');

  const imageQuery = adminView
    ? `SELECT * FROM product_images WHERE product_id IN (${placeholders}) ORDER BY is_primary DESC, id ASC`
    : `SELECT * FROM product_images WHERE product_id IN (${placeholders}) AND status = 'published' ORDER BY is_primary DESC, id ASC`;

  const images = db.prepare(imageQuery).all(...productIds);

  const imageMap = {};
  images.forEach(img => {
    if (!imageMap[img.product_id]) imageMap[img.product_id] = [];
    imageMap[img.product_id].push(img);
  });

  return products.map(p => ({
    ...p,
    images: imageMap[p.id] || [],
    primary_image: (imageMap[p.id] && imageMap[p.id].length > 0) ? imageMap[p.id][0].image_url : null
  }));
}

// -------------------------------------------------------------
// PUBLIC ROUTES
// -------------------------------------------------------------

// GET /api/products - Search, Filter, Sort Published Products
router.get('/products', (req, res) => {
  const { brand, type, year, model, search, sort } = req.query;

  let query = "SELECT * FROM products WHERE status = 'published'";
  const params = [];

  if (brand) {
    query += " AND brand = ?";
    params.push(brand);
  }
  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  if (year) {
    query += " AND year = ?";
    params.push(year);
  }
  if (model) {
    query += " AND model = ?";
    params.push(model);
  }
  if (search) {
    query += " AND (title LIKE ? OR ref_no LIKE ? OR description LIKE ? OR brand LIKE ? OR model LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  // Sorting
  if (sort === 'price_asc') {
    query += " ORDER BY price ASC";
  } else if (sort === 'price_desc') {
    query += " ORDER BY price DESC";
  } else {
    query += " ORDER BY created_at DESC";
  }

  const products = db.prepare(query).all(...params);
  const result = attachImagesToProducts(products, false);
  return res.json(result);
});

// GET /api/products/meta/filters - Get filter options (brands, types, years, models)
router.get('/products/meta/filters', (req, res) => {
  const brands = db.prepare("SELECT DISTINCT brand FROM products WHERE status = 'published' AND brand IS NOT NULL ORDER BY brand ASC").all().map(r => r.brand);
  const types = db.prepare("SELECT DISTINCT type FROM products WHERE status = 'published' AND type IS NOT NULL ORDER BY type ASC").all().map(r => r.type);
  const years = db.prepare("SELECT DISTINCT year FROM products WHERE status = 'published' AND year IS NOT NULL ORDER BY year ASC").all().map(r => r.year);
  const models = db.prepare("SELECT DISTINCT model FROM products WHERE status = 'published' AND model IS NOT NULL ORDER BY model ASC").all().map(r => r.model);

  return res.json({ brands, types, years, models });
});

// GET /api/products/:id - Single Product Detail
router.get('/products/:id', (req, res) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ? AND status = 'published'").get(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found or not published.' });
  }

  const result = attachImagesToProducts([product], false)[0];
  return res.json(result);
});

// -------------------------------------------------------------
// ADMIN PROTECTED ROUTES
// -------------------------------------------------------------

// GET /api/admin/products - List all products for admin
router.get('/admin/products', authenticateAdmin, (req, res) => {
  const products = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  const result = attachImagesToProducts(products, true);
  return res.json(result);
});

// POST /api/admin/products - Create a new product
router.post('/admin/products', authenticateAdmin, (req, res) => {
  const { title, description, price, ref_no, brand, type, year, model, status } = req.body;

  if (!title || !ref_no || !brand || !type || !year || !model) {
    return res.status(400).json({ error: 'Missing required product fields.' });
  }

  const numPrice = parseFloat(price) || 0;
  const prodStatus = status === 'published' ? 'published' : 'draft';

  const result = db.prepare(`
    INSERT INTO products (title, description, price, ref_no, brand, type, year, model, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description || '', numPrice, ref_no, brand, type, year, model, prodStatus);

  const newProd = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
  return res.status(201).json({ ...newProd, images: [] });
});

// PUT /api/admin/products/:id - Update product
router.put('/admin/products/:id', authenticateAdmin, (req, res) => {
  const { title, description, price, ref_no, brand, type, year, model, status } = req.body;
  const prodId = req.params.id;

  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(prodId);
  if (!existing) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const numPrice = parseFloat(price) || 0;
  const prodStatus = status === 'published' ? 'published' : 'draft';

  db.prepare(`
    UPDATE products
    SET title = ?, description = ?, price = ?, ref_no = ?, brand = ?, type = ?, year = ?, model = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(title, description, numPrice, ref_no, brand, type, year, model, prodStatus, prodId);

  const updatedProd = db.prepare('SELECT * FROM products WHERE id = ?').get(prodId);
  const result = attachImagesToProducts([updatedProd], true)[0];
  return res.json(result);
});

// DELETE /api/admin/products/:id - Delete product and files
router.delete('/admin/products/:id', authenticateAdmin, (req, res) => {
  const prodId = req.params.id;

  // Get associated images to delete local files
  const images = db.prepare('SELECT image_url FROM product_images WHERE product_id = ?').all(prodId);
  images.forEach(img => {
    if (img.image_url && img.image_url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', img.image_url);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error('Failed to delete file:', e); }
      }
    }
  });

  db.prepare('DELETE FROM products WHERE id = ?').run(prodId);
  return res.json({ message: 'Product deleted successfully.' });
});

// POST /api/admin/products/:id/images - Upload image (defaults to draft)
router.post('/admin/products/:id/images', authenticateAdmin, upload.array('photos', 5), (req, res) => {
  const prodId = req.params.id;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No image files uploaded.' });
  }

  const existingImagesCount = db.prepare('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?').get(prodId).count;

  const insertImage = db.prepare(`
    INSERT INTO product_images (product_id, image_url, is_primary, status)
    VALUES (?, ?, ?, 'draft')
  `);

  const uploadedImages = [];
  files.forEach((file, index) => {
    const imageUrl = `/uploads/${file.filename}`;
    const isPrimary = (existingImagesCount === 0 && index === 0) ? 1 : 0;
    const resImg = insertImage.run(prodId, imageUrl, isPrimary);
    const imgObj = db.prepare('SELECT * FROM product_images WHERE id = ?').get(resImg.lastInsertRowid);
    uploadedImages.push(imgObj);
  });

  return res.status(201).json({
    message: 'Images uploaded in draft state.',
    images: uploadedImages
  });
});

// PATCH /api/admin/images/:imageId/status - Toggle image state (draft vs published)
router.patch('/admin/images/:imageId/status', authenticateAdmin, (req, res) => {
  const { imageId } = req.params;
  const { status } = req.body; // 'draft' or 'published'

  if (!['draft', 'published'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value. Must be draft or published.' });
  }

  const existing = db.prepare('SELECT * FROM product_images WHERE id = ?').get(imageId);
  if (!existing) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  db.prepare('UPDATE product_images SET status = ? WHERE id = ?').run(status, imageId);
  const updated = db.prepare('SELECT * FROM product_images WHERE id = ?').get(imageId);
  return res.json(updated);
});

// PATCH /api/admin/images/:imageId/primary - Set image as primary cover
router.patch('/admin/images/:imageId/primary', authenticateAdmin, (req, res) => {
  const { imageId } = req.params;

  const target = db.prepare('SELECT * FROM product_images WHERE id = ?').get(imageId);
  if (!target) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  // Reset all other images for this product
  db.prepare('UPDATE product_images SET is_primary = 0 WHERE product_id = ?').run(target.product_id);
  // Set target as primary
  db.prepare('UPDATE product_images SET is_primary = 1 WHERE id = ?').run(imageId);

  return res.json({ message: 'Primary image updated.' });
});

// DELETE /api/admin/images/:imageId - Delete image
router.delete('/admin/images/:imageId', authenticateAdmin, (req, res) => {
  const { imageId } = req.params;

  const target = db.prepare('SELECT * FROM product_images WHERE id = ?').get(imageId);
  if (!target) {
    return res.status(404).json({ error: 'Image not found.' });
  }

  // Remove file if local
  if (target.image_url && target.image_url.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, '../../', target.image_url);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
    }
  }

  db.prepare('DELETE FROM product_images WHERE id = ?').run(imageId);
  return res.json({ message: 'Image deleted.' });
});

export default router;
