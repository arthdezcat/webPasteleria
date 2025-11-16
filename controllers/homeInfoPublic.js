const HomeInfo = require('../models/HomeInfo');

// Middleware para cargar HomeInfo en res.locals para todas las vistas
exports.loadHomeInfo = async (req, res, next) => {
  try {
    let info = await HomeInfo.findOne().lean();
    if (!info) {
      info = {
        brandName: 'Pastelería Dulce Sabor',
        tagline: 'Tradición y sabor en cada bocado',
        descriptionHome:
          'Bienvenido a nuestra pastelería. Preparamos pasteles artesanales, cupcakes y postres con ingredientes frescos y mucho cariño.',
        logo: { url: null },
        icon: { url: null },
        homeBg: { url: '/img/home-f.jpg' },
        servicesBg: { url: '/img/servicio.png' },
        galeriBg: { url: '/img/galeria.jpg' },
        contactBg: { url: '/img/Contact.jpg' },
      };
    }
    res.locals.homeInfo = info;
    next();
  } catch (err) {
    console.error('Error cargando HomeInfo:', err);
    next();
  }
};