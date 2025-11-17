const Admin = require('../models/Admin');

// Registro de un nuevo administrador
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = new Admin({ username, password });
    await admin.save();
    req.flash('success_msg', 'Administrador registrado. Ya puedes iniciar sesión.');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error al registrar el administrador');
    res.redirect('/register');
  }
};

// Mostrar página de inicio de sesión
exports.showLoginPage = (req, res) => {
  res.render('auth/login');
};

// Manejar inicio de sesión
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).send('Usuario y Contraseña incorrectas');
    }

    req.session.adminId = admin._id;
    res.redirect('/admin');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al iniciar sesión');
  }
};

// Manejar cierre de sesión
exports.logoutAdmin = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};


