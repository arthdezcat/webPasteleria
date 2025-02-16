const Galeria = require('../models/Galeria');
const fs = require('fs');
const path = require('path');

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
exports.addGaleria = async (req, res) => {
  try {
    const { title, description, imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    if (!image) {
      req.flash('error', 'No se ha subido ninguna imagen.');
      return res.redirect('/admin/galeria');
    }

    const newGaleria = new Galeria({
      title,
      description,
      image,
    });

    await newGaleria.save();
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar la imagen a la galería.');
  }
};

// Eliminar un servicio
exports.deleteGaleria = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Encontrar la galería que se va a eliminar
    const galeria = await Galeria.findById(id);
    if (!galeria) {
      req.flash('error', 'Galería no encontrada.');
      return res.redirect('/admin/galeria');
    }

    // Eliminar la imagen del sistema de archivos (si existe)
    if (galeria.image) {
      const imagePath = path.join(__dirname, '..', 'public', galeria.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        }
      });
    }

    // Eliminar el registro de la base de datos
    await Galeria.findByIdAndDelete(id);

    // Redirigir al panel de administración de la galería
    res.redirect('/admin/galeria');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar la galería');
  }
};