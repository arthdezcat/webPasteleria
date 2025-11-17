const mongoose = require('mongoose');

const postreSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number },
  image: { type: String },
});

module.exports = mongoose.model('Postre', postreSchema);