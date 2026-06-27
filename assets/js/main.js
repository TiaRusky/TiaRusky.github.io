/**
 * main.js - App initialization, Documentation & Challenges logic, XP Explorer
 */

// =========================================================
// XP Explorer — shared toolbar + folder view behavior
// =========================================================
const Explorer = (() => {
  function injectToolbar(container, title, backFn) {
    const tb = document.createElement('div');
    tb.className = 'xp-explorer-toolbar';
    tb.id = 'explorer-toolbar';
    tb.innerHTML = `
      <div class="xp-toolbar-buttons">
        <button class="xp-toolbar-btn" id="xp-btn-back" title="Indietro" ${backFn ? '' : 'disabled'}>◀</button>
        <button class="xp-toolbar-btn" disabled>🔼</button>
        <button class="xp-toolbar-btn" disabled>🔍</button>
        <button class="xp-toolbar-btn" disabled>📁</button>
      </div>
      <div class="xp-toolbar-path">
        <span>📁</span> <span class="xp-path-text">${title}</span>
      </div>
    `;
    // Mark body as explorer for zero-padding CSS
    container.classList.add('xp-explorer-body');
    container.insertBefore(tb, container.firstChild);
    
    // Wire up back button
    const backBtn = tb.querySelector('#xp-btn-back');
    if (backFn && backBtn) {
      backBtn.addEventListener('click', backFn);
    }
  }

  return { injectToolbar };
})();

// =========================================================
// Icon generator — works on any container, uses base64 SVG
// =========================================================
const IconGen = (() => {
  const iconMap = {
    'folder-docs':   { color: '#F0C040', shape: 'folder' },
    'folder-shield': { color: '#CC3333', shape: 'folder' },
    'user-info':     { color: '#0088CC', shape: 'user' },
    'mycomputer':    { color: '#245EDC', shape: 'pc' },
    'recyclebin':    { color: '#888888', shape: 'bin' },
    'start':         { color: '#3C9D26', shape: 'start' },
    'folder':        { color: '#F0C040', shape: 'folder' },
    'file':          { color: '#CCCCCC', shape: 'file' },
    'note':          { color: '#3399FF', shape: 'note' },
    'disk':          { color: '#999999', shape: 'disk' },
  };

  const iconCache_ = {};

  function getIcon(name) {
    if (iconCache_[name]) return iconCache_[name];
    const cfg = iconMap[name] || { color: '#999', shape: 'default' };
    const svg = buildSVG(cfg.color, cfg.shape);
    const bytes = new TextEncoder().encode(svg);
    const b64 = btoa(String.fromCharCode(...bytes));
    iconCache_[name] = 'data:image/svg+xml;base64,' + b64;
    return iconCache_[name];
  }

  function buildSVG(color, shape) {
    if (shape === 'folder') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <rect x="2" y="12" width="44" height="30" rx="2" fill="${color}"/>
        <path d="M2,10 C2,8 4,6 8,6 L20,6 L24,12 L2,12 Z" fill="${color}" opacity="0.75"/>
        <rect x="3" y="18" width="42" height="3" rx="1" fill="white" opacity="0.25"/>
        <rect x="3" y="24" width="36" height="3" rx="1" fill="white" opacity="0.2"/>
      </svg>`;
    }
    if (shape === 'user') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="15" r="9" fill="${color}"/>
        <path d="M8,44 C8,30 40,30 40,44" fill="${color}"/>
      </svg>`;
    }
    if (shape === 'pc') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <rect x="6" y="6" width="36" height="24" rx="2" fill="${color}"/>
        <rect x="4" y="32" width="40" height="5" rx="2" fill="${color}" opacity="0.7"/>
        <rect x="18" y="38" width="12" height="4" rx="1" fill="${color}" opacity="0.5"/>
        <rect x="10" y="10" width="28" height="16" rx="1" fill="#1a1a2e"/>
      </svg>`;
    }
    if (shape === 'bin') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <path d="M10,14 L8,14 L14,8 L34,8 L40,14 L38,14 L36,42 L12,42 Z" fill="${color}"/>
        <rect x="14" y="18" width="20" height="2" fill="white" opacity="0.3"/>
        <rect x="14" y="24" width="15" height="2" fill="white" opacity="0.3"/>
      </svg>`;
    }
    if (shape === 'file') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M0,4 C0,2 2,0 4,0 L20,0 L32,12 L32,38 C32,39 31,40 30,40 L2,40 C1,40 0,39 0,38 Z" fill="${color}"/>
        <path d="M20,0 L20,10 C20,11 21,12 22,12 L32,12" fill="${color}" opacity="0.5"/>
        <rect x="4" y="16" width="24" height="2" rx="1" fill="white" opacity="0.4"/>
        <rect x="4" y="22" width="18" height="2" rx="1" fill="white" opacity="0.3"/>
      </svg>`;
    }
    if (shape === 'note') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M0,4 C0,2 2,0 4,0 L20,0 L32,12 L32,38 C32,39 31,40 30,40 L2,40 C1,40 0,39 0,38 Z" fill="${color}"/>
        <path d="M20,0 L20,10 C20,11 21,12 22,12 L32,12" fill="${color}" opacity="0.5"/>
        <rect x="4" y="16" width="24" height="2" rx="1" fill="white" opacity="0.4"/>
        <rect x="4" y="22" width="18" height="2" rx="1" fill="white" opacity="0.3"/>
      </svg>`;
    }
    if (shape === 'disk') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
        <rect x="4" y="4" width="40" height="40" rx="4" fill="${color}"/>
        <circle cx="24" cy="24" r="12" fill="#555"/>
        <circle cx="24" cy="24" r="4" fill="#333"/>
      </svg>`;
    }
    if (shape === 'start') {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
        <rect x="1" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
        <rect x="9" y="1" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
        <rect x="1" y="9" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
        <rect x="9" y="9" width="6" height="6" rx="1" fill="white" opacity="0.9"/>
      </svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect width="48" height="48" rx="4" fill="${color}"/>
    </svg>`;
  }

  /** Generate all icons in a container (or whole document) */
  function generate(container) {
    const root = container || document;
    root.querySelectorAll('img[data-icon]').forEach(img => {
      const name = img.getAttribute('data-icon');
      img.src = getIcon(name);
      img.onerror = null;
      img.classList.add('icon-ready');
    });
    // Also handle old-style src-based detection for desktop icons
    root.querySelectorAll('img[src*="icons/"]').forEach(img => {
      const src = img.getAttribute('src') || '';
      const match = src.match(/icons\/(\w+)\.png/);
      if (match) {
        img.src = getIcon(match[1]);
        img.onerror = null;
        img.classList.add('icon-ready');
      }
    });
  }

  return { generate, getIcon };
})();

// =========================================================
// Documentation App — XP Explorer style
// =========================================================
const Documentation = (() => {
  function toggleCategory(header) {
    const category = header.parentElement;
    category.classList.toggle('open');
  }

  function openNote(categorySlug, noteSlug) {
    const docTree = document.getElementById('doc-tree');
    const docContent = document.getElementById('doc-content');
    const docBack = document.getElementById('doc-back');
    if (!docTree || !docContent || !docBack) return;

    const contentDiv = document.getElementById('doc-content-' + noteSlug);
    docContent.innerHTML = contentDiv ? contentDiv.innerHTML : '<p>Contenuto non disponibile.</p>';
    docTree.style.display = 'none';
    docContent.style.display = 'block';
    docBack.style.display = 'block';
  }

  function showTree() {
    const docTree = document.getElementById('doc-tree');
    const docContent = document.getElementById('doc-content');
    const docBack = document.getElementById('doc-back');
    if (!docTree || !docContent || !docBack) return;
    docTree.style.display = 'block';
    docContent.style.display = 'none';
    docBack.style.display = 'none';
  }

  return { toggleCategory, openNote, showTree };
})();

// =========================================================
// Challenges App
// =========================================================
const Challenges = (() => {
  function openChallenge(slug) {
    const data = window.__CHALLENGES_DATA__;
    if (!data) return;
    const challenge = data.find(c => c.slug === slug);
    if (!challenge) return;
    if (challenge.encrypted) {
      loadEncryptedData(challenge);
      return;
    }
    const contentDiv = document.getElementById('chal-content-' + slug);
    const html = contentDiv ? contentDiv.innerHTML : '<p>Writeup non ancora disponibile.</p>';
    showContent(html);
  }

  async function loadEncryptedData(challenge) {
    if (challenge._encryptedData) {
      window.__PENDING_CHALLENGE__ = challenge;
      CryptoManager.promptDecrypt(challenge.slug);
      return;
    }
    const baseUrl = (window.__BASE_URL__ || '').replace(/\/+$/, '');
    try {
      const resp = await fetch(baseUrl + '/assets/data/challenges/' + challenge.slug + '.enc');
      if (resp.ok) {
        challenge._encryptedData = await resp.text();
        challenge.encryptedData = challenge._encryptedData;
      }
    } catch (e) {
      console.warn('Could not load encrypted data for', challenge.slug);
    }
    window.__PENDING_CHALLENGE__ = challenge;
    if (challenge.encryptedData) {
      CryptoManager.promptDecrypt(challenge.slug);
    } else {
      showContent('<p>🔒 Questo writeup è protetto.</p><p>File cifrato non trovato: <code>/assets/data/challenges/' + challenge.slug + '.enc</code></p>');
    }
  }

  function showContent(html) {
    const list = document.getElementById('challenge-list');
    const content = document.getElementById('challenge-content');
    const back = document.getElementById('challenge-back');
    if (!list || !content || !back) return;
    content.innerHTML = html;
    list.style.display = 'none';
    content.style.display = 'block';
    back.style.display = 'block';
  }

  function showList() {
    const list = document.getElementById('challenge-list');
    const content = document.getElementById('challenge-content');
    const back = document.getElementById('challenge-back');
    if (!list || !content || !back) return;
    list.style.display = 'block';
    content.style.display = 'none';
    back.style.display = 'none';
  }

  return { openChallenge, showContent, showList };
})();

// =========================================================
// Initialize
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  const docDataEl = document.getElementById('__doc-data');
  const chalDataEl = document.getElementById('__chal-data');
  if (docDataEl) {
    try { window.__DOCUMENTATION_DATA__ = JSON.parse(docDataEl.textContent); }
    catch(e) { console.warn('Could not parse doc data'); }
  }
  if (chalDataEl) {
    try { window.__CHALLENGES_DATA__ = JSON.parse(chalDataEl.textContent); }
    catch(e) { console.warn('Could not parse challenges data'); }
  }

  IconGen.generate();
  Clock.start();
  tryLoadBliss();
  initSoundsOnInteraction();
});

function tryLoadBliss() {
  const baseUrl = (window.__BASE_URL__ || '').replace(/\/+$/, '');
  const img = new Image();
  img.onload = function() { document.body.classList.add('bliss-loaded'); };
  img.onerror = function() {};
  img.src = baseUrl + '/assets/img/bliss.jpg';
}

function initSoundsOnInteraction() {
  let startupPlayed = false;
  function onInteraction() {
    XPSounds.init();
    if (!startupPlayed) {
      startupPlayed = true;
      setTimeout(() => XPSounds.startup(), 300);
    }
  }
  ['click', 'keydown', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, onInteraction, { once: true });
  });
}
