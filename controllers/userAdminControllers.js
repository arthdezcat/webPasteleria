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
    req.flash('success_msg', 'Usuario eliminado correctamente');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error al eliminar usuario');
    res.redirect('/admin/users');
  }
};

// Agregar nuevo usuario desde panel admin
exports.addUser = async (req, res) => {
  const { validationResult } = require('express-validator');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msgs = errors.array().map(e => e.msg).join('. ');
      req.flash('error_msg', msgs);
      return res.redirect('/admin/users');
    }

    const { fullName, username, email, role, status, password } = req.body;
    // Evitar duplicados de username
    const exists = await Admin.findOne({ username });
    if (exists) {
      req.flash('error_msg', 'El nombre de usuario ya existe');
      return res.redirect('/admin/users');
    }

    const avatar = req.file && req.file.path ? req.file.path : undefined;
    const newUser = new Admin({ fullName, username, email, role: role || 'user', status: status || 'active', password, avatar });
    await newUser.save();
    req.flash('success_msg', 'Usuario creado correctamente');
    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error al crear usuario:', err);
    req.flash('error_msg', 'Error al crear usuario');
    res.redirect('/admin/users');
  }
};

// Mostrar formulario de edición
exports.getEditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Admin.findById(id).lean();
    if (!user) return res.status(404).send('Usuario no encontrado');
    res.render('admin/editUser', { user });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error al cargar usuario');
    res.redirect('/admin/users');
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  const { validationResult } = require('express-validator');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const msgs = errors.array().map(e => e.msg).join('. ');
      req.flash('error_msg', msgs);
      return res.redirect('/admin/users');
    }

    const { id } = req.params;
    const { fullName, username, email, role, status, password } = req.body;
    const update = { fullName, username, email, role, status };
    if (req.file && req.file.path) update.avatar = req.file.path;
    if (password) {
      if (password !== confirmPassword) return res.status(400).send('Las contraseñas no coinciden');
      update.password = password; // will be hashed by pre-save if using save(); using findByIdAndUpdate won't trigger pre-save
    }

    // If password is being updated, load and save to trigger pre-save hook
    if (update.password) {
      const user = await Admin.findById(id);
      if (!user) return res.status(404).send('Usuario no encontrado');
      user.fullName = update.fullName;
      user.username = update.username;
      user.email = update.email;
      user.role = update.role;
      user.status = update.status;
      if (update.avatar) user.avatar = update.avatar;
      user.password = update.password;
      await user.save();
      req.flash('success_msg', 'Usuario actualizado correctamente');
    } else {
      await Admin.findByIdAndUpdate(id, update);
      req.flash('success_msg', 'Usuario actualizado correctamente');
    }

    res.redirect('/admin/users');
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    req.flash('error_msg', 'Error al actualizar usuario');
    res.redirect('/admin/users');
  }
};