/**
 * xp-crypto.js - Client-side AES-GCM encryption/decryption for writeups
 */

const CryptoManager = (() => {
  // Current pending challenge slug
  let pendingslug_ = null;

  /**
   * Derive a crypto key from a password using PBKDF2
   */
  async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: enc.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt plaintext with a password
   * Returns base64 string: salt(16) + iv(12) + ciphertext
   */
  async function encrypt(plaintext, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, new TextDecoder().decode(salt));
    const enc = new TextEncoder();
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      enc.encode(plaintext)
    );

    // Combine salt + iv + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + ciphertext.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypt base64 ciphertext with a password
   * Returns plaintext string or null on failure
   */
  async function decrypt(ciphertextB64, password) {
    try {
      const combined = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const ciphertext = combined.slice(28);

      const key = await deriveKey(password, new TextDecoder().decode(salt));
      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        ciphertext
      );
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return null;
    }
  }

  /**
   * Called when user wants to open an encrypted writeup
   */
  function promptDecrypt(slug) {
    pendingslug_ = slug;
    const overlay = document.getElementById('password-dialog-overlay');
    const input = document.getElementById('decrypt-password');
    const error = document.getElementById('decrypt-error');
    overlay.style.display = 'flex';
    input.value = '';
    error.style.display = 'none';
    setTimeout(() => input.focus(), 100);

    // Enter key to submit
    input.onkeydown = (e) => {
      if (e.key === 'Enter') decryptAndShow();
    };
  }

  /**
   * Decrypt and show the content for the pending challenge
   */
  async function decryptAndShow() {
    const password = document.getElementById('decrypt-password').value;
    const error = document.getElementById('decrypt-error');
    
    if (!password) {
      error.textContent = 'Inserisci la chiave segreta.';
      error.style.display = 'block';
      return;
    }

    if (!pendingslug_) return;

    // Find the challenge in the data
    const challenges = window.__CHALLENGES_DATA__;
    const challenge = challenges?.find(c => c.slug === pendingslug_);
    if (!challenge?.encryptedData) {
      error.textContent = 'Errore: dati cifrati non trovati.';
      error.style.display = 'block';
      return;
    }

    const plaintext = await decrypt(challenge.encryptedData, password);
    
    if (plaintext === null) {
      error.textContent = '❌ Chiave segreta errata.';
      error.style.display = 'block';
      XPSounds.error();
      return;
    }

    // Success! Show the content
    document.getElementById('password-dialog-overlay').style.display = 'none';
    Challenges.showContent(plaintext);
  }

  return { encrypt, decrypt, promptDecrypt, decryptAndShow };
})();
