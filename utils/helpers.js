import bcrypt from 'bcryptjs';

/**
 * Hashes a password using bcrypt
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} - The hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(13);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

/**
 * Compares a plain text password with a hashed password
 * @param {string} password - The plain text password to verify
 * @param {string} hash - The hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
export const isPassMatched = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};
