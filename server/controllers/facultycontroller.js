const Faculty = require('../models/faculty');

// ✅ Add new faculty
exports.addFaculty = async (req, res) => {
  try {
    const data = {
      facultyId: req.body.facultyId,
      name: req.body.name,
      year: req.body.year,
      department: req.body.department,
      subject: req.body.subject,
      experience: req.body.experience,
      qualification: req.body.qualification,
      contact: req.body.contact,
      image: req.file ? req.file.filename : null
    };
    const doc = await Faculty.create(data);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all faculty
exports.getFaculty = async (req, res) => {
  try {
    const list = await Faculty.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get one faculty by ID
exports.getFacultyById = async (req, res) => {
  try {
    const doc = await Faculty.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Faculty not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update faculty by ID
exports.updateFaculty = async (req, res) => {
  try {
    console.log("Updating ID:", req.params.id); // ✅ debug

    const existing = await Faculty.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Faculty not found' });

    const update = {
      facultyId: req.body.facultyId,
      name: req.body.name,
      year: req.body.year,
      department: req.body.department,
      subject: req.body.subject,
      experience: req.body.experience,
      qualification: req.body.qualification,
      contact: req.body.contact,
      image: req.file ? req.file.filename : existing.image // ✅ preserve old image
    };

    const updated = await Faculty.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete faculty by ID
exports.deleteFaculty = async (req, res) => {
  try {
    const doc = await Faculty.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Faculty not found' });
    res.json({ message: 'Faculty deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ✅ Get faculty count
exports.getFacultyCount = async (req, res) => {
  try {
    const count = await Faculty.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
