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
    const { fullName, username, email, role, status, password, confirmPassword } = req.body;
    const update = {};
    if (fullName !== undefined && fullName !== '') update.fullName = fullName;
    if (username !== undefined && username !== '') update.username = username;
    if (email !== undefined && email !== '') update.email = email;
    if (role !== undefined && role !== '') update.role = role;
    if (status !== undefined && status !== '') update.status = status;
    if (req.file && req.file.path) update.avatar = req.file.path;

    if (password) {
      if (password !== confirmPassword) {
        req.flash('error_msg', 'Las contraseñas no coinciden');
        return res.redirect('/admin/users');
      }
      // handle password update by loading the user and saving to trigger pre-save hook
      const user = await Admin.findById(id);
      if (!user) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect('/admin/users');
      }
      // update fields that were provided
      if (update.fullName) user.fullName = update.fullName;
      if (update.username) user.username = update.username;
      if (update.email) user.email = update.email;
      if (update.role) user.role = update.role;
      if (update.status) user.status = update.status;
      if (update.avatar) user.avatar = update.avatar;
      user.password = password;
      await user.save();
      req.flash('success_msg', 'Usuario actualizado correctamente');
    } else {
      // No password change: do partial update
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