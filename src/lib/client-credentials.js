/**
 * Client credential delivery for member portal onboarding.
 * - Temp password: create user with random password; coach shares it with client (or send via your email).
 * - Magic URL: when Appwrite server Users API supports createMagicURLToken(userId, email, url), call it
 *   so the client receives an email with a login link. Until then, use temp password.
 */

const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
const DEFAULT_LENGTH = 14;

/**
 * Generate a secure random password for new client accounts.
 * @param {number} [length=14]
 * @returns {string}
 */
export function generateTempPassword(length = DEFAULT_LENGTH) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
  }
  let s = "";
  for (let i = 0; i < length; i++) {
    s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return s;
}
