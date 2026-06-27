/**
 * main.js - App initialization, Documentation & Challenges logic
 */

// =========================================================
// Documentation App
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

    // Find the hidden content div
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

    // If encrypted, prompt for password
    if (challenge.encrypted) {
      loadEncryptedData(challenge);
      return;
    }

    // Show content from hidden div
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

    // Load external encrypted file
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
// Generate placeholder icons as inline SVGs
// =========================================================
function generateIcons() {
  const iconMap = {
    'folder-docs': '#3366CC',
    'folder-shield': '#CC3333',
    'user-info': '#0088CC',
    'mycomputer': '#666699',
    'recyclebin': '#999999',
    'start': '#3C9D26'
  };

  document.querySelectorAll('img[src*="icons/"]').forEach(img => {
    const src = img.getAttribute('src') || '';
    const match = src.match(/icons\/(\w+)\.png/);
    if (match && iconMap[match[1]]) {
      const svg = createIconSVG(iconMap[match[1]], match[1]);
      img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
      img.onerror = null;
      img.classList.add('icon-ready');
    }
  });
}

function createIconSVG(color, name) {
  if (name === 'folder-docs' || name === 'folder-shield') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect x="2" y="10" width="44" height="34" rx="2" fill="${color}"/>
      <rect x="2" y="4" width="20" height="10" rx="2" fill="${color}" opacity="0.8"/>
      <rect x="6" y="14" width="14" height="2" rx="1" fill="white" opacity="0.3"/>
      <rect x="6" y="20" width="10" height="2" rx="1" fill="white" opacity="0.3"/>
    </svg>`;
  }
  if (name === 'user-info') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="14" r="10" fill="${color}"/>
      <ellipse cx="24" cy="40" rx="18" ry="12" fill="${color}"/>
    </svg>`;
  }
  if (name === 'mycomputer') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect x="4" y="6" width="40" height="26" rx="3" fill="${color}"/>
      <rect x="2" y="34" width="44" height="6" rx="2" fill="${color}" opacity="0.6"/>
      <rect x="16" y="40" width="16" height="4" rx="2" fill="${color}" opacity="0.4"/>
      <rect x="8" y="10" width="32" height="18" rx="1" fill="#1a1a2e" opacity="0.6"/>
    </svg>`;
  }
  if (name === 'recyclebin') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <path d="M12 14 L8 14 L14 6 L34 6 L40 14 L36 14" fill="${color}" stroke="${color}" stroke-width="2"/>
      <rect x="10" y="14" width="28" height="26" rx="2" fill="${color}" opacity="0.8"/>
      <rect x="14" y="18" width="20" height="2" fill="white" opacity="0.3"/>
      <rect x="14" y="24" width="15" height="2" fill="white" opacity="0.3"/>
    </svg>`;
  }
  if (name === 'start') {
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

// =========================================================
// Initialize on DOM ready
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Parse JSON data
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

  // Generate icons
  generateIcons();

  // Start clock
  Clock.start();

  // Try to load Bliss wallpaper
  tryLoadBliss();

  // Initialize sounds on first user interaction (AudioContext policy)
  initSoundsOnInteraction();
});

/** Try to load Bliss wallpaper; fall back to CSS gradient if missing */
function tryLoadBliss() {
  const baseUrl = (window.__BASE_URL__ || '').replace(/\/+$/, '');
  const img = new Image();
  img.onload = function() {
    document.body.classList.add('bliss-loaded');
  };
  img.onerror = function() {
    // Keep CSS gradient — nothing to do
  };
  img.src = baseUrl + '/assets/img/bliss.jpg';
}

/** Wait for first user gesture to init audio + play startup */
function initSoundsOnInteraction() {
  let startupPlayed = false;
  
  function onInteraction(e) {
    // Init audio context
    XPSounds.init();
    
    if (!startupPlayed) {
      startupPlayed = true;
      // Small delay so the gesture context propagates
      setTimeout(() => XPSounds.startup(), 300);
    }
  }
  
  ['click', 'keydown', 'touchstart'].forEach(ev => {
    document.addEventListener(ev, onInteraction, { once: true });
  });
}
