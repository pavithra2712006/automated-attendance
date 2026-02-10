const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  facultyId: String,
  name: String,
  year: String,
  department: String,
  subject: String,
  experience: String,
  qualification: String,
  contact: String,
  image: String // stores filename or path
});

module.exports = mongoose.model('Faculty', facultySchema);