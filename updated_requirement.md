# Product Requirements Document (PRD) & System Architecture

## 1. Project Overview
- **Project Name:** Car Parts Marketplace & Catalog
- **Domain:** Automotive Aftermarket Parts & Accessories Catalog
- **Business Model:** Catalog-only e-commerce showcase without online payment processing. Conversational checkout and customer support take place via WhatsApp integration.

---

## 2. Senior Software Engineer Analysis & Brainstorming (Clarifications Resolved)

Below is the structured breakdown of items from `base.md` that required technical clarification, along with senior engineering recommendations and resolutions:

| # | Item / Ambiguity | Challenge | Resolution / Requirement Specification |
|---|---|---|---|
| 1 | **Tech Stack Choice** | Monolith architecture requirement with reactive catalog UI and local file uploads. | **Chosen Stack: Node.js / Express + React (Vite) + SQLite + Local File Storage**. Express serves API & static assets, Vite + React provides client rendering, SQLite handles database storage without external DB server overhead. |
| 2 | **Storage Strategy** | Storing uploaded product images cleanly in monolith. | **Chosen Strategy: Local Disk / Folder Storage (`/uploads`)**. Product images are uploaded via Express/Multer into local static storage, optimized via Sharp, and served statically. |
| 3 | **Image & Product Draft Lifecycle** | How does draft vs published state apply to photos and products? | **Resolution:** Both Products and Images have a `status` flag (`draft` \| `published`). When an admin uploads photos for a new or existing product, new images default to `draft`. Basic users only see `published` products and `published` images. Admin can publish images individually or publish the whole product. |
| 4 | **Admin Bootstrapping & Last Admin Rule** | How is the first admin created, and how is the "cannot delete last admin" rule enforced? | **Resolution:** Database seeder initializes a default super-admin (`admin` / default hash) on initial migration. Database/API enforces a guard query: `COUNT(users) > 1` before executing any admin user deletion. |
| 5 | **WhatsApp Integration & Encoding** | How are cart checkout vs single-product detail page inquiries formatted? | **Resolution:** Standardized URI parameter encoding (`encodeURIComponent`) format targeting a configurable WhatsApp phone number stored in the system `settings` table. |
| 6 | **Shopping Cart & Persistence** | How is cart data stored for basic users who don't log in? | **Resolution:** Browser `localStorage` persistence. Cart data stores product ID, title, model, ref_no, price, primary image URL, and quantity. |

---

## 3. Confirmed Technical Architecture

```
+-------------------------------------------------------------------+
|               MONOLITH APPLICATION (Express + React)              |
|                                                                   |
|   +-----------------------------------------------------------+   |
|   |             React Single Page App (Vite Build)            |   |
|   |  - Basic User Catalog (Grid, Filters, Detail, Cart)       |   |
|   |  - Admin Dashboard (Product CRUD, User Mgmt, Settings)    |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|   +-----------------------------------------------------------+   |
|   |                Node.js / Express Backend                  |   |
|   |  - Auth & Session Handler (Bcrypt + HttpOnly JWT Cookie)  |   |
|   |  - Express Upload & Sharp Processing Pipeline             |   |
|   |  - SQLite Database Client (Better-SQLite3 / Prisma)       |   |
|   +-----------------------------------------------------------+   |
|                                 |                                 |
|   +--------------------------+  +-----------------------------+   |
|   |  SQLite DB (app.db)      |  | Local Uploads (/uploads)    |   |
|   +--------------------------+  +-----------------------------+   |
+-------------------------------------------------------------------+
```

---

## 4. Functional Requirements

### 4.1 Module 1: Basic User (Public View - No Authentication Required)

#### 4.1.1 Product Catalog & Discovery
- **Product Grid Display:** Displays all items where `product.status = 'published'`.
- **Search:** Instant keyword search across `title`, `ref_no`, `brand`, `model`, and `description`.
- **Multi-faceted Filtering:**
  - **Brand:** Filter by automotive brand (e.g., Toyota, Honda, BMW, Mercedes, Nissan).
  - **Type:** Filter by part category (e.g., Engine, Transmission, Suspension, Bodykit, Brakes, Electrical).
  - **Year:** Filter by compatible vehicle manufacturing year or year range.
  - **Model:** Filter by specific vehicle model (e.g., Civic, Corolla, E46, Golf).
- **Sorting:**
  - Price: Low to High
  - Price: High to Low
  - Date Added: Newest First

#### 4.1.2 Product Detail Page
- **URL Structure:** `/products/[id]` or `/products/[slug]`
- **Media Gallery:** Image carousel/viewer showing only images marked as `published`.
- **Product Specifications Table:**
  - Title & Reference Number (`ref.no` / SKU / OEM Part No.)
  - Price (Formatted in local currency, e.g., IDR / USD)
  - Brand, Model, Type, Compatible Year
  - Detailed Description
- **Call-to-Actions (CTA):**
  - **"Add to Cart"** button.
  - **"Direct Inquiry via WhatsApp"** button (immediately opens WhatsApp with this single product prefilled).

#### 4.1.3 Shopping Cart & WhatsApp Checkout
- **Cart Side-Drawer / Modal:**
  - View selected items, thumbnail, title, ref.no, model, price, quantity selector, remove item, clear cart.
  - Subtotal calculation.
- **Checkout Process:**
  - Clicking **"Checkout via WhatsApp"** collects all cart items and builds the targeted WhatsApp URL.
  - Opens WhatsApp Web or WhatsApp Mobile App targeting the active admin phone number.

---

### 4.2 Module 2: Admin User (Protected Access)

#### 4.2.1 Authentication & Security
- **Entry Path:** `/admin/login`
- **Credentials:** Username & Password authentication against encrypted database hashes (Bcrypt / Argon2).
- **Session Management:** Secure HTTP-Only JWT or Session Cookie. Auto-expiration on inactivity.

#### 4.2.2 Admin User Management
- **View Admin List:** List all registered admin accounts (ID, Username, Created Date).
- **Create Admin:** Form to add a new admin (Username, Password, Confirm Password).
- **Delete Admin:** Ability to remove an admin user.
  - *Safety Guard:* System enforces that at least **1 active admin user** must exist in the database. Attempting to delete the last admin triggers a validation error (`400 Bad Request: Cannot delete the last admin user`).

#### 4.2.3 Product & Image Catalog Management (CRUD + Workflow)
- **Product Creation & Editing:**
  - Input fields: Title, Description, Price, Ref No, Brand, Type, Year, Model, Product Status (`Draft` / `Published`).
- **Photo Upload & Draft Workflow:**
  - Admin can upload one or multiple images per product.
  - Uploaded images initially enter a **Draft** state (`status = 'draft'`).
  - Admin can toggle image status between **Draft** and **Published**.
  - Admin can select a primary/cover photo for the product grid.
  - Admin can delete individual images or replace them.
  - Once the admin clicks **Publish Product**, the product and its published images become publicly visible to basic users.

#### 4.2.4 Store Settings & WhatsApp Target Configuration
- **Dynamic WhatsApp Phone Number:** Admin interface to update the target WhatsApp phone number (stored in international format without leading zero/plus, e.g., `628123456789`).
- **Global Store Info:** Option to update store display name, welcome message header, etc.

---

## 5. WhatsApp Message Specification

### 5.1 Cart Checkout Message Format
When the user clicks "Checkout via WhatsApp" from the Cart drawer:
```text
Hai admin, mau bertanya terkait barang-barang berikut ini :
- <title> | <model> | <ref-No>
- <title> | <model> | <ref-No>
- <title> | <model> | <ref-No>
```

### 5.2 Single Product Direct Inquiry Message Format
When the user clicks "Chat via WhatsApp" directly on a Product Detail page:
```text
Hai admin, mau bertanya terkait barang berikut ini :
- <title> | <model> | <ref-No>
```

### 5.3 WhatsApp URL Construction Rule
Target URL template:
`https://wa.me/<TARGET_PHONE_NUMBER>?text=<URL_ENCODED_MESSAGE>`

---

## 6. Database Schema Specification

### 6.1 `users` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER / UUID | Primary Key | User identifier |
| `username` | VARCHAR(50) | Unique, NOT NULL | Admin login username |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

### 6.2 `products` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER / UUID | Primary Key | Product identifier |
| `title` | VARCHAR(255) | NOT NULL | Part title |
| `description` | TEXT | NULLABLE | Detailed description |
| `price` | DECIMAL(12,2) | NOT NULL, DEFAULT 0 | Price |
| `ref_no` | VARCHAR(100) | NOT NULL, INDEX | Reference / OEM SKU number |
| `brand` | VARCHAR(100) | NOT NULL, INDEX | Car brand (e.g. Toyota) |
| `type` | VARCHAR(100) | NOT NULL, INDEX | Part category (e.g. Engine) |
| `year` | VARCHAR(50) | NOT NULL, INDEX | Compatible year range |
| `model` | VARCHAR(100) | NOT NULL, INDEX | Car model (e.g. Civic) |
| `status` | ENUM | 'draft', 'published' (DEFAULT 'draft') | Overall product visibility |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### 6.3 `product_images` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER / UUID | Primary Key | Image identifier |
| `product_id` | INTEGER / UUID | Foreign Key -> `products.id` ON DELETE CASCADE | Associated product |
| `image_url` | VARCHAR(500) | NOT NULL | File path or cloud URL |
| `is_primary` | BOOLEAN | DEFAULT FALSE | Cover image flag |
| `status` | ENUM | 'draft', 'published' (DEFAULT 'draft') | Image publication status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

### 6.4 `settings` Table
| Column Name | Data Type | Constraints | Description |
|---|---|---|---|
| `key` | VARCHAR(100) | Primary Key | Config key (e.g. `whatsapp_number`) |
| `value` | TEXT | NOT NULL | Config value (e.g. `628123456789`) |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

---

## 7. Non-Functional Requirements (NFR)

1. **Performance & Responsiveness:**
   - Image optimization pipeline (convert uploaded images to WebP format, max width 1200px, thumbnail generation).
   - Fast catalog search and filtering (< 100ms response time).
2. **Mobile Optimization:**
   - 100% mobile-responsive layout for seamless transition from browser to mobile WhatsApp app.
3. **Security:**
   - Strict file type validation on upload (`image/jpeg`, `image/png`, `image/webp` only).
   - Parameterized SQL / ORM database queries to prevent SQL Injection.
   - Protection against CSRF and XSS.
   - Admin routes strictly protected by middleware authentication checks.
4. **Data Integrity:**
   - Deleting a product automatically cleans up associated image records and local disk files.
   - Database constraint ensures `COUNT(users) >= 1` at all times.

---

## 8. Development Roadmap & Implementation Steps

1. **Step 1: Project Setup & Core Monolith Structure**
   - Initialize framework/server structure with database ORM/client.
   - Setup migration scripts and database seeder for default admin (`admin` / `admin123`).
2. **Step 2: Admin Authentication & User Management**
   - Build login page, session handler, protected admin dashboard.
   - Implement Admin User CRUD with last-admin guard logic.
3. **Step 3: Product & Image Management System**
   - Build Admin Product Form with file upload dropzone.
   - Implement image processing, saving, draft/published state toggles.
   - Settings page for updating target WhatsApp phone number.
4. **Step 4: Public Catalog & Filter System**
   - Build basic user product gallery with instant search, brand/type/year/model filter controls, price sorting.
   - Build Product Detail view with gallery slider.
5. **Step 5: Shopping Cart & WhatsApp Deep-Link Generator**
   - Implement local storage cart state.
   - Implement message formatting helper & WhatsApp redirection URL generator.
6. **Step 6: End-to-End Verification & Testing**
   - Test admin workflow, image publish toggles, last-admin deletion block, cart checkout formatting, responsive UI layout.
