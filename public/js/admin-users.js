document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.service-form-admin');
  if (!form) return;

  // Password confirmation validation
  const password = form.querySelector('input[name="password"]');
  const confirm = form.querySelector('input[name="confirmPassword"]');
  if (password && confirm) {
    form.addEventListener('submit', (e) => {
      if (password.value || confirm.value) {
        if (password.value !== confirm.value) {
          e.preventDefault();
          alert('Las contraseñas no coinciden');
          confirm.focus();
        }
      }
    });
  }

  // Avatar preview
  const avatarInput = form.querySelector('input[type="file"][name="avatar"]');
  if (avatarInput) {
    const preview = document.createElement('img');
    preview.className = 'avatar-preview';
    preview.style.display = 'none';
    avatarInput.parentNode.appendChild(preview);

    avatarInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) { preview.style.display = 'none'; return; }
      if (!file.type.startsWith('image/')) { alert('Solo se permiten imágenes'); avatarInput.value = ''; return; }
      const reader = new FileReader();
      reader.onload = (ev) => {
        preview.src = ev.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    });
  }
});