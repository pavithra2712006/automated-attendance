const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const facultyRoutes = require('./routes/facultyroute');
const authRoutes = require('./routes/authroute');   // NEW



// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/attendance', require('./routes/attendanceroute'));
app.use('/api/faculty', require('./routes/facultyroute'));
app.use('/api/students', require('./routes/studentroute'));
// 🔹 Auth (login) route
app.use('/api/auth', authRoutes);



// Server listen
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // 👇 dynamic import use pannunga (ESM package + CommonJS)
  import('open')
    .then((openModule) => {
      const open = openModule.default;          // default export
      return open('http://localhost:5000/login.html', {
        app: 'msedge',                          // Edge
      });
    })
    .catch((e) => {
      console.log('Could not open browser:', e.message);
    });
});
