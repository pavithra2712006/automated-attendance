// controllers/attendancecontroller.js
const Attendance = require('../models/attendance');
const isWithinGeofence = require('../utils/geofence'); // lat/lng, radius check helper
const PDFDocument = require('pdfkit');
// ---------------- GEOFENCE CONFIG ----------------

// Campus coordinates (replace with real college lat/lng)
const CAMPUS_LAT = 12.8894069;
const CAMPUS_LNG = 79.8744695;
const GEOFENCE_RADIUS_M = 300; // meters

// ---------------- CHECK-IN (faculty + student) ----------------
// Body: { facultyMobile, studentMobile, location: { lat, lng, accuracy } }
exports.checkin = async (req, res) => {
  try {
    const { facultyMobile, studentMobile, location } = req.body;

    if (!location || location.lat == null || location.lng == null) {
      return res.status(400).json({ message: 'Location is required' });
    }

    // Time window: 7:30–9:00 AM
   // const now = new Date();
   // const currentMinutes = now.getHours() * 60 + now.getMinutes();
    //const startMinutes = 7 * 60 + 30;
   // const endMinutes = 9 * 60;

   // if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
   //   return res
   //     .status(403)
   //     .json({ message: 'Check-in only allowed between 7:30 and 9:00 AM.' });
  //  }

    // Geofence check
    const inside = isWithinGeofence(
      location.lat,
      location.lng,
      CAMPUS_LAT,
      CAMPUS_LNG,
      GEOFENCE_RADIUS_M
    );

    if (!inside) {
      return res
        .status(403)
        .json({ message: 'Outside campus geofence. Attendance denied.' });
    }

    // Normalize "today"
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { facultyMobile, studentMobile, date: today },
      {
        date: today,
        checkInTime: new Date(),
        location,
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy,
        status: 'Present',
      },
      { upsert: true, new: true }
    );

    res.json({ message: 'Attendance marked present', record });
  } catch (error) {
    console.error('Checkin error:', error);
    res.status(500).json({ message: 'Error during check-in', error: error.message });
  }
};

// ---------------- CHECK-OUT ----------------
// Body: { facultyMobile, studentMobile }
exports.checkout = async (req, res) => {
  try {
    const { facultyMobile, studentMobile } = req.body;

    // Time window: 3:00–4:00 PM
   // const now = new Date();
   // const currentMinutes = now.getHours() * 60 + now.getMinutes();
   // const startMinutes = 15 * 60; // 3:00 PM
   // const endMinutes = 16 * 60;   // 4:00 PM

  //  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
  //    return res
   //     .status(403)
  //      .json({ message: 'Checkout only allowed between 3:00 and 4:00 PM.' });
  //  }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await Attendance.findOneAndUpdate(
      { facultyMobile, studentMobile, date: today },
      { checkOutTime: new Date() },
      { new: true }
    );

    if (!record) {
      return res
        .status(404)
        .json({ message: 'No check-in record found for today.' });
    }

    res.json({ message: 'Checkout recorded successfully', record });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ message: 'Error during checkout', error: error.message });
  }
};

// ---------------- TODAY COUNT (overview card) ----------------
exports.getTodayAttendanceCount = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({ count });
  } catch (err) {
    console.error('Today count error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- WEEKLY SUMMARY (for chart) ----------------
exports.getWeeklySummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const data = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: weekAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' },
          },
          present: {
            $sum: { $cond: [{ $eq: ['$status', 'Present'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    console.error('Weekly summary error:', error);
    res.status(500).json({ message: 'Error fetching weekly summary' });
  }
};

// ---------------- OPTIONAL: GENERIC GEOFENCE MARK (userId/userType) ----------------
// Body: { userId, name, userType, latitude, longitude, accuracy }
exports.markWithGeofence = async (req, res) => {
  try {
    const { userId, name, userType, latitude, longitude, accuracy } = req.body;

    if (!userId || !name || !userType || latitude == null || longitude == null) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const inside = isWithinGeofence(
      Number(latitude),
      Number(longitude),
      CAMPUS_LAT,
      CAMPUS_LNG,
      GEOFENCE_RADIUS_M
    );

    if (!inside) {
      return res.status(403).json({
        message: 'You are outside college geofence',
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await Attendance.findOne({
      userId,
      userType,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existing) {
      return res.json({
        message: 'Attendance already marked for today',
        attendance: existing,
      });
    }

    const attendance = await Attendance.create({
      userId,
      name,
      userType,
      date: new Date(),
      status: 'Present',
      latitude,
      longitude,
      accuracy,
    });

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance,
    });
  } catch (err) {
    console.error('Generic geofence mark error:', err);
    res.status(500).json({ message: 'Error marking attendance', error: err.message });
  }
};

// Weekly stats for chart (last 7 days)
exports.getWeeklyStats = async (req, res) => {
  try {
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6); // last 7 days (today included)

    const stats = await Attendance.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: today }, // or use 'date' field
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$personType", // 'student' / 'faculty'
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // convert to frontend‑friendly format
    const dayMap = {}; // { '2025-01-01': { student: 10, faculty: 5 }, ... }
    stats.forEach((s) => {
      const day = s._id.day;
      const type = s._id.type || "other";
      if (!dayMap[day]) dayMap[day] = { student: 0, faculty: 0 };
      if (type === "student") dayMap[day].student = s.count;
      if (type === "faculty") dayMap[day].faculty = s.count;
    });

    // build sorted arrays
    const labels = [];
    const studentCounts = [];
    const facultyCounts = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      labels.push(key);
      const entry = dayMap[key] || { student: 0, faculty: 0 };
      studentCounts.push(entry.student);
      facultyCounts.push(entry.faculty);
    }

    res.json({ labels, studentCounts, facultyCounts });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
// Export attendance as PDF
exports.exportPDF = async (req, res) => {
  try {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.pdf');

    doc.pipe(res);

    // Header
    doc.fontSize(20).text('Attendance Report', { align: 'center' });
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    // Get stats from DB (same weekly-stats logic)
    const today = new Date();
    const start = new Date();
    start.setDate(today.getDate() - 6);

    const stats = await Attendance.aggregate([
      {
        $match: { createdAt: { $gte: start, $lte: today } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Table
    doc.fontSize(12).text('Daily Attendance Summary:', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 200;

    doc.text('Date', col1X, tableTop);
    doc.text('Count', col2X, tableTop);
    doc.moveTo(50, tableTop + 20).lineTo(500, tableTop + 20).stroke();

    let yPos = tableTop + 30;
    stats.forEach((s) => {
      doc.text(s._id, col1X, yPos);
      doc.text(String(s.total), col2X, yPos);
      yPos += 25;
    });

    doc.moveDown();
    doc.fontSize(10).text('This is an auto-generated report.', { align: 'center' });

    doc.end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};