const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  telefono: { type: String, required: true },
  emailUrl: { type: String },
  whatsappUrl: { type: String },
  facebookUrl: { type: String },
  messenger: { type: String },
  messengerUrl: { type: String },
  extraUrl: { type: String },
  footer: { type: String },
  iconColor: { type: String },
  iconUrl: { type: String },
  iconFile: { type: String }
});

module.exports = mongoose.model('Contact', contactSchema);
