/**
 * xp-window-manager.js - Manages draggable, resizable XP-style windows
 */

const WindowManager = (() => {
  let windows_ = {};
  let zIndexCounter_ = 200;
  let activeWindow_ = null;

  // Window configs
  const windowConfigs_ = {
    documentation: {
      title: '📁 Documentazione',
      icon: '/assets/img/icons/folder-docs.png',
      width: 720,
      height: 480,
      x: 80,
      y: 40
    },
    challenges: {
      title: '🛡️ Challenge Writeups',
      icon: '/assets/img/icons/folder-shield.png',
      width: 760,
      height: 500,
      x: 100,
      y: 60
    },
    about: {
      title: '👤 Chi sono',
      icon: '/assets/img/icons/user-info.png',
      width: 500,
      height: 450,
      x: 120,
      y: 60
    },
    mycomputer: {
      title: '💻 Risorse del computer',
      icon: '/assets/img/icons/mycomputer.png',
      width: 650,
      height: 440,
      x: 160,
      y: 80
    },
    recyclebin: {
      title: '🗑️ Cestino',
      icon: '/assets/img/icons/recyclebin.png',
      width: 400,
      height: 350,
      x: 300,
      y: 150
    }
  };

  function createWindowElement(id, config) {
    const win = document.createElement('div');
    win.className = 'xp-window';
    win.id = 'window-' + id;
    win.style.width = config.width + 'px';
    win.style.height = config.height + 'px';
    win.style.left = config.x + 'px';
    win.style.top = config.y + 'px';
    win.style.zIndex = ++zIndexCounter_;

    // Titlebar
    const titlebar = document.createElement('div');
    titlebar.className = 'xp-titlebar';
    titlebar.innerHTML = `
      <div class="xp-titlebar-left">
        <img class="xp-titlebar-icon" src="${config.icon}" alt="" onerror="this.style.display='none'">
        <span class="xp-titlebar-text">${config.title}</span>
      </div>
      <div class="xp-titlebar-buttons">
        <button class="xp-title-btn minimize" title="Minimizza">─</button>
        <button class="xp-title-btn maximize" title="Ingrandisci">□</button>
        <button class="xp-title-btn close" title="Chiudi">✕</button>
      </div>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'xp-window-body';
    
    // Load template content
    const template = document.getElementById('template-' + id);
    if (template) {
      body.innerHTML = template.innerHTML;
    } else {
      body.innerHTML = '<p>Contenuto non disponibile.</p>';
    }

    // Inject XP Explorer toolbar for folder-type windows
    if (id === 'documentation') {
      Explorer.injectToolbar(body, config.title, () => Documentation.showTree());
    } else if (id === 'challenges') {
      Explorer.injectToolbar(body, config.title, () => Challenges.showList());
    } else if (id === 'mycomputer') {
      Explorer.injectToolbar(body, config.title, null);
    }

    // Generate icons in the window body
    setTimeout(() => IconGen.generate(body), 0);

    // Resize handles
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    handles.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = 'resize-handle ' + dir;
      handle.dataset.resize = dir;
      win.appendChild(handle);
    });

    win.appendChild(titlebar);
    win.appendChild(body);

    // Event listeners for dragging
    titlebar.addEventListener('mousedown', (e) => onDragStart(e, win));
    
    // Event listeners for window buttons
    titlebar.querySelector('.minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      minimize(id);
    });
    titlebar.querySelector('.maximize').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximize(id);
    });
    titlebar.querySelector('.close').addEventListener('click', (e) => {
      e.stopPropagation();
      close(id);
    });

    // Titlebar double-click to maximize
    titlebar.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      toggleMaximize(id);
    });

    // Resize handles
    win.querySelectorAll('.resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => onResizeStart(e, win));
    });

    // Click on window to focus
    win.addEventListener('mousedown', () => focus(id));

    return win;
  }

  // ---- Drag logic ----
  let dragInfo_ = null;

  function onDragStart(e, win) {
    if (e.target.closest('.xp-titlebar-buttons')) return;
    e.preventDefault();
    focusFromElement_(win);

    dragInfo_ = {
      win: win,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: win.offsetLeft,
      origTop: win.offsetTop
    };

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  function onDragMove(e) {
    if (!dragInfo_) return;
    const dx = e.clientX - dragInfo_.startX;
    const dy = e.clientY - dragInfo_.startY;
    
    // If maximized, restore first with stored dimensions
    if (dragInfo_.win.classList.contains('maximized')) {
      dragInfo_.win.classList.remove('maximized');
      const saved = dragInfo_.win._preMaximize;
      if (saved) {
        dragInfo_.win.style.width = saved.width + 'px';
        dragInfo_.win.style.height = saved.height + 'px';
      }
      dragInfo_.startX = e.clientX;
      dragInfo_.startY = e.clientY;
      dragInfo_.origLeft = e.clientX - dragInfo_.win.offsetWidth / 2;
      dragInfo_.origTop = Math.max(0, e.clientY - 15);
    }
    
    dragInfo_.win.style.left = Math.max(0, dragInfo_.origLeft + dx) + 'px';
    dragInfo_.win.style.top = Math.max(0, dragInfo_.origTop + dy) + 'px';
  }

  function onDragEnd() {
    dragInfo_ = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  }

  // ---- Resize logic ----
  let resizeInfo_ = null;

  function onResizeStart(e, win) {
    e.preventDefault();
    e.stopPropagation();
    focusFromElement_(win);

    if (win.classList.contains('maximized')) return;

    const handle = e.target;
    resizeInfo_ = {
      win: win,
      handle: handle.dataset.resize,
      startX: e.clientX,
      startY: e.clientY,
      origW: win.offsetWidth,
      origH: win.offsetHeight,
      origLeft: win.offsetLeft,
      origTop: win.offsetTop
    };

    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  }

  function onResizeMove(e) {
    if (!resizeInfo_) return;
    const h = resizeInfo_.handle;
    const dx = e.clientX - resizeInfo_.startX;
    const dy = e.clientY - resizeInfo_.startY;
    const win = resizeInfo_.win;

    if (h.includes('e')) {
      win.style.width = Math.max(250, resizeInfo_.origW + dx) + 'px';
    }
    if (h.includes('w')) {
      const newW = Math.max(250, resizeInfo_.origW - dx);
      win.style.width = newW + 'px';
      win.style.left = (resizeInfo_.origLeft + resizeInfo_.origW - newW) + 'px';
    }
    if (h.includes('s')) {
      win.style.height = Math.max(100, resizeInfo_.origH + dy) + 'px';
    }
    if (h.includes('n')) {
      const newH = Math.max(100, resizeInfo_.origH - dy);
      win.style.height = newH + 'px';
      win.style.top = (resizeInfo_.origTop + resizeInfo_.origH - newH) + 'px';
    }
  }

  function onResizeEnd() {
    resizeInfo_ = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
  }

  function focusFromElement_(win) {
    const id = win.id.replace('window-', '');
    focus(id);
  }

  // ---- Public API ----

  function open(id) {
    window.XPSounds?.click();
    // If already exists, focus and possibly un-minimize
    if (windows_[id]) {
      windows_[id].classList.remove('minimized');
      window.XPSounds?.windowOpen();
      focus(id);
      updateTaskbar();
      return;
    }

    const config = windowConfigs_[id];
    if (!config) {
      console.warn('No config for window:', id);
      return;
    }

    const el = createWindowElement(id, config);
    document.getElementById('window-container').appendChild(el);
    windows_[id] = el;
    activeWindow_ = id;
    updateTaskbar();
    
    // Sound
    XPSounds.windowOpen();
  }

  function close(id) {
    const win = windows_[id];
    if (!win) return;

    win.remove();
    delete windows_[id];

    if (activeWindow_ === id) {
      // Focus the next window if any
      const keys = Object.keys(windows_);
      activeWindow_ = keys[keys.length - 1] || null;
      if (activeWindow_) {
        windows_[activeWindow_].style.zIndex = ++zIndexCounter_;
        windows_[activeWindow_].classList.remove('inactive');
      }
    }

    updateTaskbar();
    
    // Sound
    window.XPSounds?.windowClose();
  }

  function focus(id) {
    if (activeWindow_ === id || !windows_[id]) return;
    
    // Deactivate old window
    if (activeWindow_ && windows_[activeWindow_]) {
      windows_[activeWindow_].classList.add('inactive');
    }

    activeWindow_ = id;
    windows_[id].style.zIndex = ++zIndexCounter_;
    windows_[id].classList.remove('inactive');
    updateTaskbar();
  }

  function minimize(id) {
    const win = windows_[id];
    if (!win) return;
    win.classList.toggle('minimized');
    if (!win.classList.contains('minimized')) {
      focus(id);
      window.XPSounds?.windowOpen();
    } else if (activeWindow_ === id) {
      window.XPSounds?.minimize();
      // Focus the next non-minimized window
      const keys = Object.keys(windows_).filter(k => 
        k !== id && windows_[k] && !windows_[k].classList.contains('minimized')
      );
      if (keys.length > 0) focus(keys[keys.length - 1]);
      else activeWindow_ = null;
    }
    updateTaskbar();
  }

  function toggleMaximize(id) {
    const win = windows_[id];
    if (!win) return;
    const wasMaximized = win.classList.contains('maximized');
    win.classList.toggle('maximized');
    if (win.classList.contains('maximized')) {
      // Store pre-maximize dimensions
      window.XPSounds?.maximize();
      win._preMaximize = {
        width: win.offsetWidth,
        height: win.offsetHeight,
        left: win.offsetLeft,
        top: win.offsetTop
      };
    } else if (win._preMaximize) {
      // Restore pre-maximize dimensions
      window.XPSounds?.windowOpen();
      win.style.width = win._preMaximize.width + 'px';
      win.style.height = win._preMaximize.height + 'px';
      win.style.left = win._preMaximize.left + 'px';
      win.style.top = win._preMaximize.top + 'px';
    } else if (!wasMaximized) {
      // Fallback to config
      const config = windowConfigs_[id];
      win.style.width = (config?.width || 680) + 'px';
      win.style.height = (config?.height || 480) + 'px';
      win.style.left = (config?.x || 100) + 'px';
      win.style.top = (config?.y || 50) + 'px';
    }
    focus(id);
  }

  function updateTaskbar() {
    const container = document.getElementById('taskbar-windows');
    if (!container) return;
    
    container.innerHTML = '';
    const configs = windowConfigs_;
    
    Object.keys(windows_).forEach(id => {
      const win = windows_[id];
      if (!win) return;
      
      const btn = document.createElement('div');
      btn.className = 'taskbar-window-btn' + (activeWindow_ === id && !win.classList.contains('minimized') ? ' active' : '');
      btn.innerHTML = `<img src="${configs[id]?.icon || ''}" alt="" onerror="this.style.display='none'" style="width:14px;height:14px;"> ${configs[id]?.title || id}`;
      
      btn.addEventListener('click', () => {
        if (activeWindow_ === id && !win.classList.contains('minimized')) {
          minimize(id);
        } else {
          win.classList.remove('minimized');
          focus(id);
        }
      });
      
      container.appendChild(btn);
    });
  }

  function getActiveWindow() {
    return activeWindow_;
  }

  return { open, close, focus, minimize, toggleMaximize, getActiveWindow, updateTaskbar };
})();

// Expose for inline onclick handlers
window.WindowManager = WindowManager;