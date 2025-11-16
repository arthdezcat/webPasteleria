const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  // Nombre de la pastelería
  title: { type: String, required: true },
  // Descripción breve
  description: { type: String, required: true },
  // Dirección física de la pastelería
  address: { type: String },
  // Teléfono de contacto
  phone: { type: String },
  // Horario de atención
  schedule: { type: String },
  // Precio opcional (por ejemplo, precio promedio)
  price: { type: Number },
  // URL de la imagen (logo o foto representativa)
  image: { type: String }
});

module.exports = mongoose.model('Service', serviceSchema);
