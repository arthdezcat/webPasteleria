const Admin = require('../models/Admin');

exports.listUsers = async (req, res) => {
  try {
    const users = await Admin.find().lean();
    res.render('admin/users', { users });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al listar usuarios');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    // Evitar que el usuario actual se elimine a sí mismo por accidente
    if (req.session && req.session.adminId && String(req.session.adminId) === String(id)) {
      return res.status(400).send('No puedes eliminar tu propio usuario en esta vista.');
    }
    await Admin.findByIdAndDelete(id);
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar usuario');
  }
};