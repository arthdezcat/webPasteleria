const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: { type: String },
  publicId: { type: String },
});

const HomeInfoSchema = new mongoose.Schema(
  {
    brandName: { type: String, default: 'Pastelería Dulce Sabor' },
    tagline: { type: String, default: 'Tradición y sabor en cada bocado' },
    descriptionHome: {
      type: String,
      default:
        'Bienvenido a nuestra pastelería. Preparamos pasteles artesanales, cupcakes y postres con ingredientes frescos y mucho cariño.'
    },

    logo: ImageSchema,
    icon: ImageSchema,

    // Fondos por página pública
    homeBg: ImageSchema,
    servicesBg: ImageSchema,
    galeriBg: ImageSchema,
    contactBg: ImageSchema,

    // Redes / contacto opcional
    whatsapp: { type: String },
    facebook: { type: String },
    instagram: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HomeInfo', HomeInfoSchema);