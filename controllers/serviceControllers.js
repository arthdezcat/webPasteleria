const Service = require('../models/Service');
const fs = require('fs');
const path = require('path');
const { cloudinary } = require('../middlewares/cloudinary');

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
    const { title, description, price, imageUrl, address, phone, schedule } = req.body;
    const image = (req.file && req.file.path) ? req.file.path : imageUrl; // URL Cloudinary o URL directa

    const newService = new Service({ title, description, price, address, phone, schedule, image });
    await newService.save();
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al agregar la pastelería.');
  }
};

// Actualizar un servicio
exports.updateService = async (req, res) => {
  try {
    const { id } = req.params;
    let image = req.body.imageUrl; // por si se pasa URL
    const service = await Service.findById(id);
    if (req.file && req.file.path) {
      image = req.file.path; // URL Cloudinary
      // Si el anterior era Cloudinary, borrar
      if (service && service.image && service.image.includes('cloudinary.com')) {
        const publicId = service.image.split('/').slice(-1)[0].split('.')[0];
        try { await cloudinary.uploader.destroy('webpasteleria/' + publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
      }
    }
    const { title, description, price, address, phone, schedule } = req.body;
    await Service.findByIdAndUpdate(id, { title, description, price, address, phone, schedule, image });
    res.redirect('/admin/services');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar la pastelería');
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

    // Eliminar imagen remota/local según corresponda
    if (service.image) {
      if (service.image.includes('cloudinary.com')) {
        try {
          const publicId = service.image.split('/').slice(-1)[0].split('.')[0];
          await cloudinary.uploader.destroy('webpasteleria/' + publicId);
        } catch (e) {
          console.error('Error al eliminar en Cloudinary:', e);
        }
      } else {
        const imagePath = path.join(__dirname, '..', 'public', service.image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen:', err);
          }
        });
      }
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