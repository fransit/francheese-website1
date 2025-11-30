# FranCheese E-commerce - Quick Start Guide

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)

### 2. Setup
Run the setup script:
```bash
setup.bat
```
Or manually:
```bash
npm install
```

### 3. Configure Environment
Update `.env` file with your settings:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/francheese
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Start Services

**Terminal 1 - Backend:**
```bash
npm start
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
python -m http.server 8000
```
Frontend will run on http://localhost:8000

### 5. Access the Application
- **Frontend:** http://localhost:8000/src/francheese.html
- **Backend API:** http://localhost:5000/api

## 🔐 Default Admin Account
- **Email:** admin@francheese.com
- **Password:** admin123

## 📋 What Was Fixed

### Previous Issues:
- ❌ Client-side password hashing (insecure)
- ❌ localStorage data storage (not persistent)
- ❌ No real authentication system
- ❌ Broken bcryptjs CDN

### New Features:
- ✅ **Secure server-side authentication** with JWT
- ✅ **MongoDB database** for persistent data
- ✅ **Proper password hashing** with bcrypt
- ✅ **RESTful API** endpoints
- ✅ **User registration and login**
- ✅ **Admin dashboard**
- ✅ **Product management**

## 🛠 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (admin)

### Orders
- `POST /api/orders` - Create order

## 🔒 Security Features
- Password hashing with bcrypt
- JWT token authentication
- Input validation
- Admin role protection

## 🚀 Production Deployment
For production:
1. Use MongoDB Atlas
2. Set strong JWT secret
3. Enable HTTPS
4. Configure CORS properly

---

**Enjoy your new secure e-commerce site! 🧀**
