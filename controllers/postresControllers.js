const Postre = require('../models/Postre');
const Contact = require('../models/Contact');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');

// Página pública: listar postres
exports.getPostres = async (req, res) => {
  try {
    const postres = await Postre.find();
    const contact = await Contact.find();
    res.render('pages/postres', { postres, contact, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los postres');
  }
};

// Admin: agregar postre
exports.addPostre = async (req, res) => {
  try {
    const { title, description, price, imageUrl } = req.body;
    const image = (req.file && req.file.path) ? req.file.path : imageUrl;
    const nuevo = new Postre({ title, description, price, image });
    await nuevo.save();
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el postre');
  }
};

// Admin: actualizar postre
exports.updatePostre = async (req, res) => {
  try {
    const { id } = req.params;
    let image = req.body.imageUrl;
    const p = await Postre.findById(id);
    if (req.file && req.file.path) {
      image = req.file.path;
      if (p && p.image && p.image.includes('cloudinary.com')) {
        const publicId = p.image.split('/').slice(-1)[0].split('.')[0];
        try { await cloudinary.uploader.destroy('webpasteleria/' + publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
      }
    }
    const { title, description, price } = req.body;
    await Postre.findByIdAndUpdate(id, { title, description, price, image });
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el postre');
  }
};

// Admin: eliminar postre
exports.deletePostre = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Postre.findById(id);
    if (!p) {
      req.flash && req.flash('error', 'Postre no encontrado.');
      return res.redirect('/admin/postres');
    }
    if (p.image) {
      if (p.image.includes('cloudinary.com')) {
        try {
          const publicId = p.image.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy('webpasteleria/' + publicId);
        } catch (e) {
          console.error('Error al eliminar en Cloudinary:', e);
        }
      } else {
        const imagePath = path.join(__dirname, '..', 'public', p.image);
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error al eliminar la imagen:', err);
        });
      }
    }
    await Postre.findByIdAndDelete(id);
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el postre');
  }
};