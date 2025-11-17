const express = require('express');
const router = express.Router();
const postresController = require('../controllers/postresControllers');
const contactController = require('../controllers/contactControllers');
const galeriaController = require('../controllers/galeriControllers');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadImage');
const { body } = require('express-validator');
const homeInfoController = require('../controllers/homeInfoControllers');
const userAdminController = require('../controllers/userAdminControllers');

// Proteger rutas del panel de administración
router.use(authMiddleware.isAuthenticated);
// Panel de administración para postres
router.get('/postres', async (req, res) => {
  const postres = await require('../models/Postre').find();
  res.render('admin/postres', { postres, old: {}, errors: [] });
});

router.get('/contact', async (req, res) => {
  const contact = await require('../models/Contact').find();
  res.render('admin/contact', { contact, old: {}, errors: [] });
});

router.get('/galeria', async (req, res) => {
  const galeria = await require('../models/Galeria').find();
  res.render('admin/galeri', { galeria, old: {}, errors: [] });
});

router.get('/', (req, res) => res.render('admin/index'));
// Configuración de Home / branding
router.get('/homeinfo', homeInfoController.getAdminHomeInfo);
router.post('/homeinfo/text', homeInfoController.updateText);
router.post('/homeinfo/image', upload.single('imageFile'), homeInfoController.updateImage);

// Gestión de contactos (similar a WebServiTec)
router.post('/contact/add', upload.single('iconFile'), [
  body('name').notEmpty().withMessage('Nombre requerido'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  body('telefono').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Teléfono demasiado corto'),
  body('facebookUrl').optional({ checkFalsy: true }).isURL().withMessage('Facebook URL inválida'),
  body('extraUrl').optional({ checkFalsy: true }).isURL().withMessage('URL adicional inválida')
], contactController.addContact);
router.post('/contact/delete/:id', contactController.deleteContact);
router.post('/contact/update/:id', upload.single('iconFile'), [
  body('name').notEmpty().withMessage('Nombre requerido'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email inválido'),
  body('telefono').optional({ checkFalsy: true }).isLength({ min: 7 }).withMessage('Teléfono demasiado corto'),
  body('facebookUrl').optional({ checkFalsy: true }).isURL().withMessage('Facebook URL inválida'),
  body('extraUrl').optional({ checkFalsy: true }).isURL().withMessage('URL adicional inválida')
], contactController.updateContact);
// Usuarios administradores
router.get('/users', userAdminController.listUsers);
router.post('/users/add', upload.single('avatar'), [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Las contraseñas no coinciden')
], userAdminController.addUser);
router.get('/users/edit/:id', userAdminController.getEditUser);
router.post('/users/edit/:id', upload.single('avatar'), [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('confirmPassword').custom((value, { req }) => {
    if (req.body.password) return value === req.body.password;
    return true;
  }).withMessage('Las contraseñas no coinciden')
], userAdminController.updateUser);
router.post('/users/delete/:id', userAdminController.deleteUser);
router.post('/postres/add', upload.single('imageFile'), [
  body('title').notEmpty().withMessage('Título requerido'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Precio inválido')
], postresController.addPostre);
router.post('/postres/delete/:id', postresController.deletePostre);
router.post('/postres/update/:id', upload.single('imageFile'), [
  body('title').notEmpty().withMessage('Título requerido'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Precio inválido')
], postresController.updatePostre);
router.post('/galeria/add', upload.single('imageFile'), [
  body('title').notEmpty().withMessage('Título requerido'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Precio inválido')
], galeriaController.addGaleria);
router.post('/galeria/delete/:id', galeriaController.deleteGaleria);
router.post('/galeria/update/:id', upload.single('imageFile'), [
  body('title').notEmpty().withMessage('Título requerido'),
  body('description').notEmpty().withMessage('Descripción requerida'),
  body('price').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Precio inválido')
], galeriaController.updateGaleria);

module.exports = router;
