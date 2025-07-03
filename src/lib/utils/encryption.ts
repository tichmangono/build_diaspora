import CryptoJS from 'crypto-js';

// Get encryption key from environment or generate a default (should be in env)
const ENCRYPTION_KEY = process.env.ENCRYPTION_SECRET || 'default-dev-key-change-in-production';

/**
 * Encrypt sensitive data using AES encryption
 * @param text - The text to encrypt
 * @returns Encrypted string
 */
export function encryptData(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param encryptedText - The encrypted text to decrypt
 * @returns Decrypted string
 */
export function decryptData(encryptedText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash sensitive data (one-way encryption)
 * @param text - The text to hash
 * @returns Hashed string
 */
export function hashData(text: string): string {
  try {
    return CryptoJS.SHA256(text).toString();
  } catch (error) {
    console.error('Hashing error:', error);
    throw new Error('Failed to hash data');
  }
}

/**
 * Generate a secure random token
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
export function generateSecureToken(length: number = 32): string {
  try {
    return CryptoJS.lib.WordArray.random(length).toString();
  } catch (error) {
    console.error('Token generation error:', error);
    throw new Error('Failed to generate secure token');
  }
}

/**
 * Encrypt PII (Personally Identifiable Information) data
 * This uses a stronger encryption method for sensitive personal data
 */
export function encryptPII(data: string): string {
  try {
    // Use PBKDF2 for key derivation with salt
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const iv = CryptoJS.lib.WordArray.random(128/8);
    const encrypted = CryptoJS.AES.encrypt(data, key, { 
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // Combine salt, iv, and encrypted data
    const combined = salt.concat(iv).concat(encrypted.ciphertext);
    return combined.toString(CryptoJS.enc.Base64);
  } catch (error) {
    console.error('PII encryption error:', error);
    throw new Error('Failed to encrypt PII data');
  }
}

/**
 * Decrypt PII data
 */
export function decryptPII(encryptedData: string): string {
  try {
    const combined = CryptoJS.enc.Base64.parse(encryptedData);
    
    // Extract salt, iv, and ciphertext
    const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, 4));
    const iv = CryptoJS.lib.WordArray.create(combined.words.slice(4, 8));
    const ciphertext = CryptoJS.lib.WordArray.create(combined.words.slice(8));
    
    // Derive key using same parameters
    const key = CryptoJS.PBKDF2(ENCRYPTION_KEY, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext } as CryptoJS.lib.CipherParams,
      key,
      { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
    );
    
    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      throw new Error('Failed to decrypt PII data - invalid key or corrupted data');
    }
    
    return result;
  } catch (error) {
    console.error('PII decryption error:', error);
    throw new Error('Failed to decrypt PII data');
  }
}

/**
 * Secure data comparison (timing-safe)
 * Prevents timing attacks when comparing sensitive data
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Mask sensitive data for logging/display
 * @param data - The data to mask
 * @param visibleChars - Number of characters to show at start/end
 * @returns Masked string
 */
export function maskSensitiveData(data: string, visibleChars: number = 2): string {
  if (data.length <= visibleChars * 2) {
    return '*'.repeat(data.length);
  }
  
  const start = data.slice(0, visibleChars);
  const end = data.slice(-visibleChars);
  const middle = '*'.repeat(data.length - visibleChars * 2);
  
  return `${start}${middle}${end}`;
} 