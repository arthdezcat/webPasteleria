const HomeInfo = require('../models/HomeInfo');
const { cloudinary } = require('../middlewares/cloudinary');

// Obtener configuración HomeInfo en admin
exports.getAdminHomeInfo = async (req, res) => {
  try {
    const info = await HomeInfo.findOne();
    res.render('admin/homeinfo', { info });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar configuración de inicio');
  }
};

// Actualizar textos básicos HomeInfo
exports.updateText = async (req, res) => {
  try {
    const { brandName, tagline, descriptionHome, whatsapp, facebook, instagram } = req.body;
    let info = await HomeInfo.findOne();
    if (!info) info = new HomeInfo();
    info.brandName = brandName ?? info.brandName;
    info.tagline = tagline ?? info.tagline;
    info.descriptionHome = descriptionHome ?? info.descriptionHome;
    info.whatsapp = whatsapp ?? info.whatsapp;
    info.facebook = facebook ?? info.facebook;
    info.instagram = instagram ?? info.instagram;
    await info.save();
    res.redirect('/admin/homeinfo');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar textos');
  }
};

// Actualizar una imagen (logo, icon, o fondo por página)
exports.updateImage = async (req, res) => {
  try {
    const { targetField, imageUrl } = req.body;
    let info = await HomeInfo.findOne();
    if (!info) info = new HomeInfo();

    // Resolver imagen nueva
    const newUrl = req.file && req.file.path ? req.file.path : imageUrl;
    if (!newUrl) {
      return res.redirect('/admin/homeinfo');
    }

    // Obtener objeto existente y eliminar de Cloudinary si aplica
    const current = info[targetField];
    if (current && current.url && current.url.includes('cloudinary.com') && current.publicId) {
      try { await cloudinary.uploader.destroy('webpasteleria/' + current.publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
    }

    // Si viene de Cloudinary, intentaremos extraer publicId
    let publicId = undefined;
    if (newUrl.includes('cloudinary.com')) {
      // newUrl should be like https://res.cloudinary.com/..../image/upload/v123/webpasteleria/<publicId>.jpg
      publicId = newUrl.split('/').slice(-1)[0].split('.')[0];
    }

    info[targetField] = { url: newUrl, publicId };
    await info.save();
    res.redirect('/admin/homeinfo');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar imagen');
  }
};