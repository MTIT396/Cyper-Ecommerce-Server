# 🛒 Cyper E-Commerce Backend API

A robust, scalable Node.js/Express backend API for an e-commerce platform built with MySQL database and JWT authentication.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Authentication Flow](#authentication-flow)
- [Error Handling](#error-handling)
- [Security](#security)

---

## 🎯 Overview

This is a full-featured e-commerce backend API that provides all essential functionalities for an online shopping platform including user management, product catalog, shopping cart, orders, payments, and admin features.

---

## ✨ Features

### 👤 User Management

- User registration and login with JWT authentication
- Google OAuth 2.0 integration
- Profile management and avatar upload
- Password change functionality
- Role-based access control (Admin/User)

### 🛍️ Product Management

- Complete product CRUD operations
- Product filtering and search
- Product slug-based routing
- Product images via Cloudinary integration
- Admin product management with validation

### 📦 Shopping Features

- Shopping cart management (add, update, remove items)
- Wishlist/Favorites functionality
- Address management for delivery
- Order creation and tracking
- Order status management (pending, shipping, delivered, cancelled)

### 💳 Payment Integration

- Momo payment gateway integration
- Payment status checking
- Transaction callbacks handling
- Secure payment verification

### 🏷️ Categories & Catalog

- Category management
- Product categorization
- Category-based filtering

### 📊 Admin Features

- Admin product management
- User management and viewing
- Order management dashboard
- Upload management for product images

---

## 🛠️ Tech Stack

### Core Framework

- **Express.js** (v5.2.1) - Web framework
- **Node.js** - Runtime environment

### Database

- **MySQL 2** (v3.16.0) - SQL database with promise support
- Connection pooling with automated management

### Authentication & Security

- **JWT (jsonwebtoken)** (v9.0.3) - Token-based authentication
- **bcryptjs** (v3.0.3) - Password hashing
- **crypto-js** (v4.2.0) - Additional encryption
- **CORS** (v2.8.5) - Cross-origin resource sharing

### File Management

- **Cloudinary** (v2.9.0) - Cloud image storage
- **Multer** (v2.1.1) - File upload handling

### Utilities

- **Slugify** (v1.6.6) - URL slug generation
- **Day.js** (v1.11.19) - Date/time handling
- **Axios** (v1.13.6) - HTTP client
- **Cookie-parser** (v1.4.7) - Cookie parsing
- **Dotenv** (v17.2.3) - Environment variables

### Development

- **Nodemon** (v3.1.11) - Auto-restart on file changes

---

## 📁 Project Architecture

```
server/
├── config/               # Database & configuration
│   └── db.js            # MySQL connection pool setup
│
├── controllers/          # Business logic handlers
│   ├── auth.controller.js
│   ├── product.controller.js
│   ├── category.controller.js
│   ├── cart.controller.js
│   ├── user.controller.js
│   ├── order.controller.js
│   ├── address.controller.js
│   ├── wishlist.controller.js
│   ├── payment.controller.js
│   ├── upload.controller.js
│   ├── google.controller.js
│   └── admin.product.controller.js
│
├── routes/              # API route definitions
│   ├── auth.routes.js
│   ├── product.routes.js
│   ├── category.routes.js
│   ├── cart.routes.js
│   ├── user.routes.js
│   ├── order.routes.js
│   ├── address.routes.js
│   ├── wishlist.routes.js
│   ├── payment.routes.js
│   ├── upload.routes.js
│   ├── google.routes.js
│   └── admin.product.routes.js
│
├── services/            # Business logic & database interactions
│   ├── auth.service.js
│   ├── product.service.js
│   ├── category.service.js
│   ├── cart.service.js
│   ├── user.service.js
│   ├── order.service.js
│   ├── address.service.js
│   ├── wishlist.service.js
│   ├── payment.service.js
│   ├── upload.service.js
│   └── momo/            # Momo payment service
│
├── repo/                # Database query layer
│   ├── address.repository.js
│   ├── admin.product.repository.js
│   ├── cart.repository.js
│   ├── category.repository.js
│   ├── order.repository.js
│   ├── payment.repository.js
│   ├── user.repository.js
│   └── wishlist.repository.js
│
├── middlewares/         # Express middlewares
│   ├── auth.middleware.js       # JWT verification & token refresh
│   ├── error.middleware.js      # Global error handler
│   ├── role.middleware.js       # Role-based access control
│   ├── upload.middleware.js     # File upload handling
│   └── validate.middleware.js   # Request validation
│
├── utils/               # Utility functions
│   ├── AppError.js      # Custom error class
│   ├── jwt.js          # JWT token management
│   └── hash.js         # Password hashing utilities
│
├── constant/            # Constants
│   └── priceRange.js   # Price filtering constants
│
├── dto/                 # Data transfer objects
│   └── product.dto.js  # Product data validation
│
├── integrations/        # Third-party integrations
│   └── momo/           # Momo payment gateway
│
├── server.js           # Application entry point
├── package.json        # Dependencies
└── README.md          # This file
```

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn package manager

### 1. Clone & Install Dependencies

```bash
cd server
npm install
```

### 2. Create `.env` File

```bash
cp .env.example .env
```

### 3. Configure Environment Variables

See [Environment Variables](#environment-variables) section

### 4. Set Up Database

```bash
# Create your MySQL database and tables
# Import your database schema if available
```

### 5. Start the Server

**Development Mode** (with auto-restart):

```bash
npm run dev
```

**Production Mode**:

```bash
node server.js
```

The server will run on `http://localhost:8080` (or your configured PORT)

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_DATABASE=ecommerce_db

# JWT Secrets
JWT_ACCESS_SECRET=your_access_token_secret_key
JWT_REFRESH_SECRET=your_refresh_token_secret_key

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Momo Payment Gateway
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
MOMO_ENDPOINT=https://test-payment.momo.vn/v3/gateway/api/create

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

## 📡 API Endpoints

### 🔑 Authentication Routes (`/api/auth`)

| Method | Endpoint    | Description        | Auth |
| ------ | ----------- | ------------------ | ---- |
| POST   | `/register` | Register new user  | ❌   |
| POST   | `/login`    | User login         | ❌   |
| POST   | `/logout`   | User logout        | ✅   |
| POST   | `/google`   | Google OAuth login | ❌   |

**Register Example:**

```json
POST /api/auth/register
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "fullName": "User Name"
}
```

**Login Example:**

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### 👤 User Routes (`/api/users`)

| Method | Endpoint       | Description              | Auth |
| ------ | -------------- | ------------------------ | ---- |
| GET    | `/me`          | Get current user profile | ✅   |
| PUT    | `/me`          | Update user profile      | ✅   |
| PUT    | `/me/password` | Change password          | ✅   |
| PATCH  | `/me/profile`  | Update avatar            | ✅   |
| GET    | `/`            | Get all users (Admin)    | ✅🔐 |
| GET    | `/:id`         | Get user by ID (Admin)   | ✅🔐 |

**Update Profile Example:**

```json
PUT /api/users/me
{
  "fullName": "New Name",
  "phone": "0123456789"
}
```

---

### 🛍️ Product Routes (`/api/products`)

| Method | Endpoint  | Description                     | Auth |
| ------ | --------- | ------------------------------- | ---- |
| GET    | `/`       | Get all products (paginated)    | ❌   |
| GET    | `/filter` | Filter products with conditions | ❌   |
| GET    | `/:slug`  | Get product by slug             | ❌   |
| POST   | `/`       | Create product                  | ✅   |
| PUT    | `/:id`    | Update product                  | ✅   |
| DELETE | `/:id`    | Delete product                  | ✅   |

**Get Products with Pagination:**

```
GET /api/products?page=1&limit=10
GET /api/products/filter?category=electronics&priceMin=100&priceMax=500
GET /api/products/awesome-product
```

**Create Product Example:**

```json
POST /api/products
{
  "name": "Product Name",
  "price": 99.99,
  "description": "Product description",
  "image": "image_url",
  "categoryId": 1,
  "stock": 50
}
```

---

### 🏷️ Category Routes (`/api/categories`)

| Method | Endpoint | Description          | Auth |
| ------ | -------- | -------------------- | ---- |
| GET    | `/`      | Get all categories   | ❌   |
| GET    | `/:slug` | Get category by slug | ❌   |

```
GET /api/categories
GET /api/categories/electronics
```

---

### 🛒 Cart Routes (`/api/cart`)

| Method | Endpoint     | Description               | Auth |
| ------ | ------------ | ------------------------- | ---- |
| GET    | `/`          | Get user cart             | ✅   |
| POST   | `/items`     | Add item to cart          | ✅   |
| PUT    | `/items/:id` | Update cart item quantity | ✅   |
| DELETE | `/items/:id` | Remove item from cart     | ✅   |
| DELETE | `/clear`     | Clear entire cart         | ✅   |

**Add to Cart Example:**

```json
POST /api/cart/items
{
  "productId": 1,
  "quantity": 2
}
```

**Update Cart Item:**

```json
PUT /api/cart/items/1
{
  "quantity": 5
}
```

---

### ❤️ Wishlist Routes (`/api/wishlist`)

| Method | Endpoint            | Description                  | Auth |
| ------ | ------------------- | ---------------------------- | ---- |
| GET    | `/`                 | Get wishlist                 | ✅   |
| POST   | `/toggle`           | Add/remove from wishlist     | ✅   |
| GET    | `/check/:productId` | Check if product in wishlist | ✅   |

**Toggle Wishlist:**

```json
POST /api/wishlist/toggle
{
  "productId": 1
}
```

---

### 📍 Address Routes (`/api/address`)

| Method | Endpoint       | Description            | Auth |
| ------ | -------------- | ---------------------- | ---- |
| GET    | `/`            | Get user addresses     | ✅   |
| GET    | `/:id`         | Get address by ID      | ✅   |
| POST   | `/`            | Create new address     | ✅   |
| PUT    | `/:id`         | Update address         | ✅   |
| PATCH  | `/:id/default` | Set as default address | ✅   |
| DELETE | `/:id`         | Delete address         | ✅   |

**Create Address Example:**

```json
POST /api/address
{
  "fullName": "John Doe",
  "phone": "0123456789",
  "street": "123 Main St",
  "city": "Ho Chi Minh",
  "district": "District 1",
  "ward": "Ward 1",
  "isDefault": true
}
```

---

### 📦 Order Routes (`/api/orders`)

| Method | Endpoint      | Description       | Auth |
| ------ | ------------- | ----------------- | ---- |
| GET    | `/`           | Get user orders   | ✅   |
| GET    | `/:id`        | Get order details | ✅   |
| POST   | `/`           | Create order      | ✅   |
| PATCH  | `/:id/cancel` | Cancel order      | ✅   |

**Create Order Example:**

```json
POST /api/orders
{
  "addressId": 1,
  "paymentMethod": "momo",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

---

### 💳 Payment Routes (`/api/payment`)

| Method | Endpoint                   | Description          | Auth |
| ------ | -------------------------- | -------------------- | ---- |
| POST   | `/momo`                    | Create Momo payment  | ✅   |
| POST   | `/momo/callback`           | Payment callback     | ❌   |
| POST   | `/momo/transaction-status` | Check payment status | ✅   |

**Create Payment Example:**

```json
POST /api/payment/momo
{
  "orderId": 1,
  "amount": 500000,
  "description": "Order payment"
}
```

---

### 📤 Upload Routes (`/api/upload`)

| Method | Endpoint | Description                | Auth |
| ------ | -------- | -------------------------- | ---- |
| POST   | `/`      | Upload image to Cloudinary | ✅   |

**Upload Image:**

```bash
POST /api/upload
Content-Type: multipart/form-data
file: <image_file>
```

---

### 🔧 Admin Product Routes (`/api/admin/products`)

| Method | Endpoint | Description              | Auth |
| ------ | -------- | ------------------------ | ---- |
| POST   | `/`      | Create product (Admin)   | ✅🔐 |
| PUT    | `/:id`   | Update product (Admin)   | ✅🔐 |
| DELETE | `/:id`   | Delete product (Admin)   | ✅🔐 |
| GET    | `/`      | Get all products (Admin) | ✅🔐 |

**Note:** 🔐 indicates admin-only access (role-based)

---

## 🔐 Authentication Flow

### JWT Token Management

The API uses a two-token authentication system:

1. **Access Token** (15 minutes validity)
   - Used for API requests
   - Stored in `httpOnly` cookie
   - Automatically verified on each request

2. **Refresh Token** (7 days validity)
   - Used to generate new access tokens
   - Stored in `httpOnly` cookie
   - Automatically refreshed when access token expires

### Token Refresh Flow

```
Client Request
    ↓
Check Access Token
    ↓
├─ Valid → Continue ✅
└─ Expired → Check Refresh Token
    ├─ Valid → Generate new Access Token ✅
    └─ Invalid → Re-login required ❌
```

### Authentication Header

Most protected endpoints require the Authorization header:

```
Authorization: Bearer <access_token>
```

**Note:** Tokens are also set as `httpOnly` cookies for security

---

## ⚠️ Error Handling

The API uses standardized error responses:

### Success Response

```json
{
  "success": true,
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Status | Meaning                                |
| ------ | -------------------------------------- |
| 200    | OK - Request successful                |
| 201    | Created - Resource created             |
| 400    | Bad Request - Invalid parameters       |
| 401    | Unauthorized - Authentication required |
| 403    | Forbidden - Insufficient permissions   |
| 404    | Not Found - Resource not found         |
| 500    | Internal Server Error                  |

### Custom Error Class

The API uses a custom `AppError` class for consistent error handling:

```javascript
throw new AppError("Error message", 400);
```

---

## 🛡️ Security

### Best Practices Implemented

1. **Password Security**
   - Bcryptjs hashing with salt rounds
   - Password change validation

2. **JWT Tokens**
   - HttpOnly cookies (prevents XSS)
   - Secure flag in production
   - Token expiration and refresh mechanism
   - Access & Refresh token separation

3. **CORS Protection**
   - Whitelist allowed origins
   - Credentials included in requests
   - Limited HTTP methods
   - Restricted headers

4. **Input Validation**
   - Request validation middleware
   - DTO validation for product creation
   - Sanitization of user inputs

5. **Role-Based Access Control**
   - Admin middleware for protected routes
   - User verification on sensitive operations

6. **File Upload Security**
   - Cloudinary integration for secure storage
   - Multer middleware for file handling
   - Validation of file types

7. **Database Security**
   - Connection pooling
   - Parameterized queries (via mysql2)
   - Timezone management

---

## 📝 Code Examples

### Making API Requests from Frontend

**Using Fetch API:**

```javascript
// Get user profile
const response = await fetch("/api/users/me", {
  method: "GET",
  credentials: "include",
});
const data = await response.json();
```

**Using Axios:**

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
});

// Get products
const { data } = await api.get("/api/products");

// Create order
const { data } = await api.post("/api/orders", {
  addressId: 1,
  paymentMethod: "momo",
});
```

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit changes (`git commit -m 'Add AmazingFeature'`)
3. Push to branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 📞 Support

For issues, questions, or suggestions, please contact the development team or open an issue in the repository.

---

## 🚦 Quick Start Checklist

- [ ] Install Node.js dependencies: `npm install`
- [ ] Create `.env` file with required variables
- [ ] Set up MySQL database
- [ ] Test database connection
- [ ] Run server: `npm run dev`
- [ ] Test API endpoints using Postman or Insomnia
- [ ] Configure frontend to connect to API

---

**Last Updated:** May 2026
**Version:** 1.0.0

# 👨‍💻 Author

Developed by **Le Minh Thien**
