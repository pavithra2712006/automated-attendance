const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');

// ✅ Get attendance by student mobile
router.get('/student/:mobile', async (req, res) => {
  try {
    const records = await Attendance.find({ studentMobile: req.params.mobile });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance records' });
  }
});

// ✅ Get today's attendance count (for overview)
router.get('/today-count', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching today attendance count' });
  }
});

module.exports = router;
