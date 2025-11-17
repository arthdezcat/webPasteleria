const Postre = require('../models/Postre');
const Contact = require('../models/Contact');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');
const { validationResult } = require('express-validator');

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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const postres = await Postre.find();
      return res.status(400).render('admin/postres', { postres, errors: errors.array(), old: req.body });
    }
    const { title, description, price, imageUrl } = req.body;
    const image = (req.file && req.file.path) ? req.file.path : imageUrl;
    const nuevo = new Postre({ title, description, price, image });
    await nuevo.save();
    req.flash('success_msg', 'Postre creado correctamente');
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al agregar el postre');
    res.redirect('/admin/postres');
  }
};

// Admin: actualizar postre
exports.updatePostre = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const postres = await Postre.find();
      return res.status(400).render('admin/postres', { postres, errors: errors.array(), old: req.body });
    }
    const { id } = req.params;
    const p = await Postre.findById(id);
    if (!p) {
      req.flash('error_msg', 'Postre no encontrado');
      return res.redirect('/admin/postres');
    }
    const updateData = {};
    if (req.body.title !== undefined && req.body.title !== '') updateData.title = req.body.title;
    if (req.body.description !== undefined && req.body.description !== '') updateData.description = req.body.description;
    if (req.body.price !== undefined && req.body.price !== '') updateData.price = req.body.price;
    // image handling
    if (req.file && req.file.path) {
      const image = req.file.path;
      if (p.image && p.image.includes('cloudinary.com')) {
        const publicId = p.image.split('/').slice(-1)[0].split('.')[0];
        try { await cloudinary.uploader.destroy('webpasteleria/' + publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
      }
      updateData.image = image;
    } else if (req.body.imageUrl !== undefined && req.body.imageUrl !== '') {
      updateData.image = req.body.imageUrl;
    }
    await Postre.findByIdAndUpdate(id, updateData);
    req.flash('success_msg', 'Postre actualizado correctamente');
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar el postre');
    res.redirect('/admin/postres');
  }
};

// Admin: eliminar postre
exports.deletePostre = async (req, res) => {
  try {
    const { id } = req.params;
    const p = await Postre.findById(id);
    if (!p) {
      req.flash && req.flash('error_msg', 'Postre no encontrado.');
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
    req.flash('success_msg', 'Postre eliminado');
    res.redirect('/admin/postres');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al eliminar el postre');
    res.redirect('/admin/postres');
  }
};