const Galeria = require('../models/Galeria');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');

// Obtener todos los servicios
exports.getGaleria = async (req, res) => {
  try {
    const galeria = await Galeria.find();
    res.render('pages/galeri', { galeria });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios'); 
  }
};

// Añadir un nuevo servicio
const { validationResult } = require('express-validator');
exports.addGaleria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const galeria = await Galeria.find();
      return res.status(400).render('admin/galeri', { galeria, errors: errors.array(), old: req.body });
    }
    const { title, description, imageUrl } = req.body;
    const image = (req.file && req.file.path) ? req.file.path : imageUrl;

    if (!image) {
      req.flash('error_msg', 'No se ha subido ninguna imagen.');
      return res.redirect('/admin/galeria');
    }

    const newGaleria = new Galeria({ title, description, image });
    await newGaleria.save();
    req.flash('success_msg', 'Imagen añadida a la galería');
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al agregar la imagen a la galería.');
    res.redirect('/admin/galeria');
  }
};

// Actualizar galería
exports.updateGaleria = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const galeria = await Galeria.find();
      return res.status(400).render('admin/galeri', { galeria, errors: errors.array(), old: req.body });
    }
    const { id } = req.params;
    let image = req.body.imageUrl;
    const galeria = await Galeria.findById(id);
    if (req.file && req.file.path) {
      image = req.file.path;
      if (galeria && galeria.image && galeria.image.includes('cloudinary.com')) {
        const publicId = galeria.image.split('/').slice(-1)[0].split('.')[0];
        try { await cloudinary.uploader.destroy('webpasteleria/' + publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
      }
    }
    const { title, description } = req.body;
    await Galeria.findByIdAndUpdate(id, { title, description, image });
    req.flash('success_msg', 'Galería actualizada correctamente');
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar la galería');
    res.redirect('/admin/galeria');
  }
};

// Eliminar un servicio
exports.deleteGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Encontrar la galería que se va a eliminar
    const galeria = await Galeria.findById(id);
    if (!galeria) {
      req.flash('error_msg', 'Galería no encontrada.');
      return res.redirect('/admin/galeria');
    }

    // Eliminar imagen remota/local según corresponda
    if (galeria.image) {
      if (galeria.image.includes('cloudinary.com')) {
        try {
          const publicId = galeria.image.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy('webpasteleria/' + publicId);
        } catch (e) {
          console.error('Error al eliminar en Cloudinary:', e);
        }
      } else {
        const imagePath = path.join(__dirname, '..', 'public', galeria.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });
      }
    }

    // Eliminar el registro de la base de datos
    await Galeria.findByIdAndDelete(id);

    // Redirigir al panel de administración de la galería
    req.flash('success_msg', 'Elemento de galería eliminado');
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al eliminar la galería');
    res.redirect('/admin/galeria');
  }
};