// routes/studentroute.js
const express = require('express');
const router = express.Router();

const upload = require('../middleware/upload');

const {
  addStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentCount,          // NEW
} = require('../controllers/studentcontroller');

router.get('/count', getStudentCount);  // /api/students/count


// ✅ Add new student (with image upload)
router.post('/add', upload.single('image'), addStudent);

// ✅ Get all students
router.get('/', getStudents);

// ✅ Get one student by ID
router.get('/:id', getStudentById);

// ✅ Update student by ID (image optional)
router.put('/:id', upload.single('image'), updateStudent);

// ✅ Delete student by ID
router.delete('/:id', deleteStudent);

module.exports = router;
