const express = require('express');
const router = express.Router();
const postresController = require('../controllers/postresControllers');
const contactController = require('../controllers/contactControllers');
const galeriaController = require('../controllers/galeriControllers');
const homeInfoPublic = require('../controllers/homeInfoPublic');
const Contact = require('../models/Contact');
// Página de clientes

// Cargar HomeInfo y Contact en todas las páginas públicas
router.use(homeInfoPublic.loadHomeInfo);
router.use(async (req, res, next) => {
  try { res.locals.contact = await Contact.find(); } catch (e) { res.locals.contact = []; }
  next();
});

router.get('/', (req, res) => res.render('pages/index'));
<<<<<<< HEAD
=======
router.get('/postres', postresController.getPostres);
>>>>>>> fix/diseño
router.get('/contact', contactController.getContact);
router.get('/galeria', galeriaController.getGaleria);

module.exports = router;


