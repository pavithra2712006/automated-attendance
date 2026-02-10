// routes/attendanceroute.js
const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');


const {
  checkin,
  checkout,
  getTodayAttendanceCount,
  getWeeklySummary,
  markWithGeofence,
  getWeeklyStats,
  exportPDF,
} = require('../controllers/attendancecontroller');


// ✅ Get attendance by student mobile
// GET /api/attendance/student/:mobile
router.get('/student/:mobile', async (req, res) => {
  try {
    const records = await Attendance.find({ studentMobile: req.params.mobile });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});
// GET /api/attendance  -> all attendance records (for table)
router.get('/', async (req, res) => {
  try {
    const records = await Attendance.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error('List attendance error:', err);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// GET /api/attendance/weekly-stats
router.get('/weekly-stats', getWeeklyStats);

// ✅ Geofence check‑in (faculty + student)
// POST /api/attendance/checkin
router.post('/checkin', checkin);
router.get('/export-pdf', exportPDF);



// ✅ Geofence check‑out
// POST /api/attendance/checkout
router.post('/checkout', checkout);


// ✅ Generic geofence mark using userId/userType (optional)
// POST /api/attendance/geofence-mark
router.post('/geofence-mark', markWithGeofence);


// ✅ Today's attendance count (for overview top card)
// GET /api/attendance/today-count
router.get('/today-count', getTodayAttendanceCount);


// ✅ Weekly summary (for future chart)
// GET /api/attendance/weekly-summary
router.get('/weekly-summary', getWeeklySummary);


module.exports = router;
