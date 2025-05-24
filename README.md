# Bufferka Shop

Bufferka Shop is an online e-commerce platform where players can purchase in-game interactions, items, and services that are otherwise only obtainable through in-game achievements. This project bridges the gap between casual players and professional gamers, enabling safe and transparent transactions.  

> **Note:** This is **not a marketplace**. All operations are managed by the site's administrator who assigns professionals to fulfill services.  

---

## 🚀 Project Overview

- **Frontend**: React.js  
- **Backend**: Node.js with Express  
- **Database**: PostgreSQL  
- **Other technologies**: Nginx, FreeKassa payment integration, Google OAuth 2.0, Telegram bot notifications

The project is divided into two main parts:
1. **Frontend** – Client-side web application with React.js  
2. **Backend** – API server handling user requests, payments, and admin functions  

---

## 🌐 Features

- Secure payment gateway integration (FreeKassa)  
- Localization (Russian and English)  
- Role-based access for users and administrators  
- Responsive design  
- User authentication (including Google OAuth)  
- Real-time notifications via Telegram (for authorized users)  
- Flexible admin panel for order and product management  

---

## 🔨 Installation & Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env # configure environment variables
npm run start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Deployment

This project is deployed using:
- Nginx for reverse proxy and static content delivery
- PM2 or similar process manager for Node.js backend
- Certbot for SSL/TLS certificates (Let's Encrypt)
