const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');

// Obtener todos los servicios
exports.getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.render('pages/services', { services });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios'); 
  }
};

// Añadir un nuevo servicio
// Controlador para agregar un servicio
exports.addService = async (req, res) => {
  try {
    const { title, description, price, imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl; // Ruta de la imagen o URL

    const newService = new Service({
      title,
      description,
      price,
      image,
    });

    await newService.save();
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar el servicio.');
  }
};

// Eliminar un servicio
exports.deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el servicio para obtener la ruta de la imagen
    const service = await Service.findById(id);
    if (!service) {
      req.flash('error', 'Servicio no encontrado.');
      return res.redirect('/admin/services');
    }

    // Eliminar la imagen del sistema de archivos (si existe)
    if (service.image) {
      const imagePath = path.join(__dirname, '..', 'public', service.image);
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error al eliminar la imagen:', err);
        }
      });
    }

    // Eliminar el servicio de la base de datos
    await Service.findByIdAndDelete(id);

    // Redirigir al panel de administración de servicios
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el servicio');
  }
};