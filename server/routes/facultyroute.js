const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');   // multer middleware for image upload
const {
  addFaculty,
  getFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getFacultyCount,         // NEW
} = require('../controllers/facultycontroller');

router.get('/count', getFacultyCount);  // /api/faculty/count


// ✅ Add new faculty (with image upload)
router.post('/add', upload.single('image'), addFaculty);

// ✅ Get all faculty
router.get('/', getFaculty);

// ✅ Get one faculty by ID
router.get('/:id', getFacultyById);

// ✅ Update faculty by ID (image optional)
router.put('/:id', upload.single('image'), updateFaculty);

// ✅ Delete faculty by ID
router.delete('/:id', deleteFaculty);

module.exports = router;