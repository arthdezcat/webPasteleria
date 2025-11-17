const Contact = require('../models/Contact');
const { cloudinary } = require('../middlewares/cloudinary');

// Helpers de validación y normalización
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const normalizePhone = (telefono) => String(telefono || '').replace(/\D/g, '');
const buildEmailUrl = (email) => (isValidEmail(email) ? `mailto:${email}` : '');
const buildWhatsappUrl = (num) => (num && num.length >= 7 ? `https://wa.me/${num}` : '');
const ensureHttps = (url) => {
  if (!url) return '';
  const u = String(url).trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
};


// Obtener contactos y renderizar página pública
exports.getContact = async (req, res) => {
  try {
    const contact = await Contact.find();
    res.render('pages/contact', { contact, homeInfo: res.locals.homeInfo });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener los servicios');
  }
};

// Añadir nuevo contacto (admin)
const { validationResult } = require('express-validator');
exports.addContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const contact = await Contact.find();
      return res.status(400).render('admin/contact', { contact, errors: errors.array(), old: req.body });
    }
    let { name, email, telefono, facebookUrl, extraUrl, footer, iconColor, iconUrl, messenger } = req.body;
    // Normalizar entradas
    email = normalizeEmail(email);
    const telefonoNum = normalizePhone(telefono);
    facebookUrl = ensureHttps(facebookUrl);
    extraUrl = ensureHttps(extraUrl);
    // Si se subió archivo, usar la URL de Cloudinary
    if (req.file && req.file.path) {
      iconUrl = req.file.path;
    }
    // Generar enlaces
    const emailUrl = buildEmailUrl(email);
    const whatsappUrl = buildWhatsappUrl(telefonoNum);
    const messengerUrl = ensureHttps(messenger);
    const newContact = new Contact({
      name,
      email,
      telefono,
      emailUrl,
      whatsappUrl,
      facebookUrl,
      messenger,
      messengerUrl,
      extraUrl,
      footer,
      iconColor,
      iconUrl
    });
    await newContact.save();
    req.flash('success_msg', 'Contacto agregado correctamente');
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al agregar el contacto');
    res.redirect('/admin/contact');
  }
};

// Actualizar contacto (admin)
exports.updateContact = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const contact = await Contact.find();
      // Renderizamos la vista con errores y los datos enviados
      return res.status(400).render('admin/contact', { contact, errors: errors.array(), old: req.body });
    }
    const { id } = req.params;
    let { name, email, telefono, facebookUrl, extraUrl, footer, iconColor, iconUrl, messenger } = req.body;
    // Normalizar entradas
    email = normalizeEmail(email);
    const telefonoNum = normalizePhone(telefono);
    facebookUrl = ensureHttps(facebookUrl);
    extraUrl = ensureHttps(extraUrl);
    const contacto = await Contact.findById(id);
    if (req.file && req.file.path) {
      // Borrar icono anterior si estaba en Cloudinary
      if (contacto && contacto.iconUrl && contacto.iconUrl.includes('cloudinary.com')) {
        const publicId = contacto.iconUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy('webservitec/' + publicId);
      }
      iconUrl = req.file.path;
    }
    const emailUrl = buildEmailUrl(email);
    const whatsappUrl = buildWhatsappUrl(telefonoNum);
    const messengerUrl = ensureHttps(messenger);
    // Build update object only with provided fields (preserve others)
    const updateData = {};
    if (name !== undefined && name !== '') updateData.name = name;
    if (email !== undefined && email !== '') { updateData.email = email; updateData.emailUrl = emailUrl; }
    if (telefono !== undefined && telefono !== '') { updateData.telefono = telefono; updateData.whatsappUrl = whatsappUrl; }
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (messenger !== undefined) { updateData.messenger = messenger; updateData.messengerUrl = messengerUrl; }
    if (extraUrl !== undefined) updateData.extraUrl = extraUrl;
    if (footer !== undefined) updateData.footer = footer;
    if (iconColor !== undefined) updateData.iconColor = iconColor;
    if (iconUrl !== undefined) updateData.iconUrl = iconUrl;
    await Contact.findByIdAndUpdate(id, updateData);
    req.flash('success_msg', 'Contacto actualizado correctamente');
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al actualizar el contacto');
    res.redirect('/admin/contact');
  }
};

// Eliminar contacto (admin)
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const contacto = await Contact.findById(id);
    if (contacto && contacto.iconUrl && contacto.iconUrl.includes('cloudinary.com')) {
      const publicId = contacto.iconUrl.split('/').slice(-1)[0].split('.')[0];
      await cloudinary.uploader.destroy('webservitec/' + publicId);
    }
    await Contact.findByIdAndDelete(id);
    req.flash('success_msg', 'Contacto eliminado');
    res.redirect('/admin/contact');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al eliminar el contacto');
    res.redirect('/admin/contact');
  }
};