// controllers/studentcontroller.js
const Student = require('../models/student');

// ✅ Add new student
exports.addStudent = async (req, res) => {
  try {
    const data = {
      studentId: req.body.studentId,
      name: req.body.name,
      class: req.body.class,
      year: req.body.year,
      department: req.body.department,
      parentName: req.body.parentName,
      contact: req.body.contact,
      image: req.file ? req.file.filename : null,
    };

    const doc = await Student.create(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all students
exports.getStudents = async (req, res) => {
  try {
    const list = await Student.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get one student by ID
exports.getStudentById = async (req, res) => {
  try {
    const doc = await Student.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Student not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update student by ID
exports.updateStudent = async (req, res) => {
  try {
    const existing = await Student.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Student not found' });

    const update = {
      studentId: req.body.studentId,
      name: req.body.name,
      class: req.body.class,
      year: req.body.year,
      department: req.body.department,
      parentName: req.body.parentName,
      contact: req.body.contact,
      image: req.file ? req.file.filename : existing.image, // keep old image if not changed
    };

    const updated = await Student.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete student by ID
exports.deleteStudent = async (req, res) => {
  try {
    const doc = await Student.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get student count
exports.getStudentCount = async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
