# e-Haazri

**Jeppiaar Institute of Technology Attendance Management System**



## 📝 Description

e-Haazri is a **GPS-based automated attendance system** for Jeppiaar Institute. Students and faculty mark attendance automatically when they enter campus boundaries (100m radius) during class hours. No manual button press needed - page loads → GPS check → attendance marked.

**Management** gets real-time dashboard with daily/weekly stats, filtered records by date/class, and PDF export.

***

## ✨ Features
- GPS geofence (campus only)
- Auto check-in 7:30-9AM, check-out 3-4PM
- Student/Faculty/Management login
- Real-time dashboard + analytics
- Mobile responsive design

***

## 🚀 Quick Start

```bash
git clone <repo>
cd server
npm start
```

**Open**: `http://localhost:5000`

## 🛠️ Tech Stack
```
Node.js + Express + MongoDB
HTML/CSS/JS + Bootstrap 5
```

***

## 📱 How It Works
```
1. Login → attendance.html
2. Auto GPS → Campus check → ✅ Marked
3. Dashboard → View records + stats
```

***

## 📂 Structure
```
public/          # HTML pages (login, attendance, overview)
routes/          # API routes
models/          # DB schemas  
controllers/     # Logic
app.js           # Server
```

***

## 🌐 API Endpoints
```
POST /api/attendance/checkin    # Auto attendance
POST /api/attendance/checkout   # Check-out
GET  /api/attendance            # All records
```

***

## 📄 License
MIT © 2026 Jeppiaar Institute of Technology
