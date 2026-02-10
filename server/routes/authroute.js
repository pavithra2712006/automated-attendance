// routes/authroute.js
const express = require('express');
const router = express.Router();

const Faculty = require('../models/faculty');
const Student = require('../models/student'); // unga student model filename idhu nu assume; vera name na maathunga

// Helper: password = first 3 letters of name + last 5 digits of phone
function buildPassword(name, phone) {
  const first3 = name.trim().toLowerCase().slice(0, 3); // first 3 chars [web:72][web:73]
  const last5  = phone.toString().slice(-5);            // last 5 chars [web:86][web:80]
  return first3 + last5;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password, role } = req.body; // identifier = phone number

    if (!identifier || !password || !role) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    let userDoc;

    if (role === 'teacher') {
      // faculty collection la phone number field name EXACT‑aa maathunga
      userDoc = await Faculty.findOne({ contact: identifier });
    } else if (role === 'student') {
      userDoc = await Student.findOne({ contact: identifier });
    } else if (role === 'management') {
      // Simple management login (phone + password hardcode)
      if (identifier === '9999999999' && password === 'admin123') {
        return res.json({
          user: { mobile: identifier, name: 'Management', role: 'management' },
        });
      }
      return res.status(401).json({ message: 'Invalid management credentials' });
    }

    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    const generatedPassword = buildPassword(userDoc.name, userDoc.contact);

    if (password !== generatedPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    return res.json({
      user: {
        mobile: userDoc.contact,
        name: userDoc.name,
        role,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
