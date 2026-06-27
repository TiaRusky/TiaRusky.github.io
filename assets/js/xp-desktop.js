/**
 * xp-desktop.js - Desktop features: Start menu, clock, context menu, icon selection
 */

const StartMenu = (() => {
  function toggle() {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');
    const isVisible = menu.style.display === 'block';
    
    if (isVisible) {
      close();
    } else {
      window.XPSounds?.menuOpen();
      menu.style.display = 'block';
      btn.classList.add('active');
      
      // Close on click outside
      setTimeout(() => {
        document.addEventListener('click', closeOnClickOutside);
      }, 0);
    }
  }

  function close() {
    document.getElementById('start-menu').style.display = 'none';
    document.getElementById('start-button').classList.remove('active');
    document.removeEventListener('click', closeOnClickOutside);
  }

  function closeOnClickOutside(e) {
    const menu = document.getElementById('start-menu');
    const btn = document.getElementById('start-button');
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      close();
    }
  }

  return { toggle, close };
})();

// Clock
const Clock = (() => {
  let interval_ = null;

  function start() {
    update();
    interval_ = setInterval(update, 1000);
  }

  function update() {
    const el = document.getElementById('tray-clock');
    if (!el) return;
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    el.textContent = hours + ':' + minutes;
  }

  return { start };
})();

// Context menu (right-click on desktop)
const ContextMenu = (() => {
  function show(e) {
    // Only show if right-clicking on desktop background, not on icons/windows
    if (e.target.closest('.xp-window') || e.target.closest('.desktop-icon') || 
        e.target.closest('.xp-taskbar') || e.target.closest('.start-menu') ||
        e.target.closest('.context-menu')) {
      return;
    }
    e.preventDefault();
    
    const menu = document.getElementById('context-menu');
    menu.style.display = 'block';
    menu.style.left = e.clientX + 'px';
    menu.style.top = e.clientY + 'px';
    
    document.addEventListener('click', close);
  }

  function close() {
    document.getElementById('context-menu').style.display = 'none';
    document.removeEventListener('click', close);
  }

  // Initialize
  document.addEventListener('contextmenu', show);

  return { close };
})();

// Desktop icon click-outside deselection
document.addEventListener('click', (e) => {
  if (!e.target.closest('.desktop-icon')) {
    document.querySelectorAll('.desktop-icon.selected').forEach(icon => {
      icon.classList.remove('selected');
    });
  }
});

// Desktop icon single click selection
document.querySelectorAll('.desktop-icon').forEach(icon => {
  icon.addEventListener('click', function(e) {
    document.querySelectorAll('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
    this.classList.add('selected');
  });
});

// Expose for inline onclick handlers
window.StartMenu = StartMenu;
window.Clock = Clock;
window.ContextMenu = ContextMenu;