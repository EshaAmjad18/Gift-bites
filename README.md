# 🍔 GIFT Bites — University Cafeteria System

A full-stack web application for GIFT University that allows students and faculty to pre-order food from campus cafeterias, track order status in real-time, and make advance payments — eliminating long queues during peak hours.

## 🔗 Live Demo

👉 [gift-bites.vercel.app](https://gift-bites.vercel.app)

### Demo Credentials

| Role    | Email                        | Password      |
|---------|------------------------------|---------------|
| Student | 231370057@gift.edu.pk        | 231370057     |
| Staff   | basement_staff@gmail.com     | Basement@123  |
| Admin   | admin@gmail.com              | Admin@123     |

## ✨ Features

- 🔐 Role-based authentication (Student, Staff, Admin)
- 🛒 Advance food ordering from multiple cafeterias
- 📊 Real-time order status tracking (Accepted → Preparing → Ready → Picked)
- 💳 Online payment via Stripe (test mode)
- 🔔 Real-time notifications via Socket.io
- 👨‍💼 Admin dashboard — user management, reports, violations, total revenue
- 👨‍🍳 Staff dashboard — menu management, order handling, refunds

## 🛠️ Tech Stack

**Frontend:** React.js, Vite, Tailwind CSS
**Backend:** Node.js, Express.js  
**Database:** MongoDB (Mongoose)  
**Auth:** JWT + bcryptjs  
**Payments:** Stripe  
**Real-time:** Socket.io  
**Storage:** Multer  
**Deployment:** Vercel (frontend) · Railway (backend)

## 🚀 Getting Started
```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/gift-bites.git

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Run frontend
npm run dev

# Run backend
cd backend && npm start
```

## 📁 Project Structure
```
(root)/  
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── uploads/
│   ├── .env          
│   ├── app.js
│   └── package.json
│
├── src/              ← Frontend (root)
│   ├── assets/
│   ├── Components/
│   ├── layouts/
│   ├── pages/
│   └── utils/
├── .gitignore
├── index.html
└── package.json      ← Frontend

## 👩‍💻 Developed By
Esha Amjad — Full Stack Developer  

