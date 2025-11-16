(function(){
  // Theme toggle script: toggles .dark-theme on <html> and persists in localStorage
  function setTheme(theme){
    if(theme === 'dark'){
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
    // update buttons text/icon
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.textContent = document.documentElement.classList.contains('dark-theme') ? '☀️' : '🌙';
    });
  }

  function toggleTheme(){
    const isDark = document.documentElement.classList.toggle('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.querySelectorAll('.theme-toggle').forEach(btn => btn.textContent = isDark ? '☀️' : '🌙');
  }

  document.addEventListener('DOMContentLoaded', function(){
    // apply saved theme
    const saved = localStorage.getItem('theme');
    if(saved === 'dark') setTheme('dark');
    else setTheme('light');

    // attach handlers
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', function(e){
        toggleTheme();
      });
    });
  });
})();
