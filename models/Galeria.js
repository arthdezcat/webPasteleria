const mongoose = require('mongoose');

const galeriaSchema = new mongoose.Schema({  
  title: { type: String, required: true },
  description:{type: String, required: true},
  image: { type: String, required: true },
  price: { type: String }
});

module.exports = mongoose.model('Galeria', galeriaSchema); 