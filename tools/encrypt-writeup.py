#!/usr/bin/env python3
"""
Encrypt a writeup file using AES-256-GCM with PBKDF2 key derivation.
Compatible with the xp-crypto.js decryption on the website.

Usage:
    python tools/encrypt-writeup.py writeup.md password
    python tools/encrypt-writeup.py writeup.md --stdin

Output: writeup.enc file in base64 format
"""

import sys
import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.backends import default_backend


def encrypt(plaintext: bytes, password: str) -> bytes:
    """Encrypt plaintext with password, returns base64-encoded string."""
    # Generate random salt (16 bytes) and IV (12 bytes)
    salt = os.urandom(16)
    iv = os.urandom(12)

    # Derive key using PBKDF2
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,  # 256-bit key for AES-256
        salt=salt,
        iterations=100000,
        backend=default_backend(),
    )
    key = kdf.derive(password.encode("utf-8"))

    # Encrypt with AES-256-GCM
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(iv, plaintext, None)

    # Combine: salt (16) + iv (12) + ciphertext
    combined = salt + iv + ciphertext

    # Base64 encode for storage
    return base64.b64encode(combined)


def main():
    if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
        print(__doc__)
        sys.exit(0)

    input_file = sys.argv[1]

    # Read plaintext
    with open(input_file, "rb") as f:
        plaintext = f.read()

    # Get password
    if "--stdin" in sys.argv:
        password = sys.stdin.readline().strip()
    elif len(sys.argv) >= 3:
        password = sys.argv[2]
    else:
        import getpass
        password = getpass.getpass("Password: ")

    if not password:
        print("Error: no password provided.", file=sys.stderr)
        sys.exit(1)

    # Encrypt
    encrypted = encrypt(plaintext, password)

    # Write output
    output_file = input_file + ".enc"
    with open(output_file, "wb") as f:
        f.write(encrypted)

    print(f"Encrypted -> {output_file}")
    print(f"   Salt: 16 bytes, IV: 12 bytes, AES-256-GCM, PBKDF2-SHA256 (100000 iter)")


if __name__ == "__main__":
    main()
