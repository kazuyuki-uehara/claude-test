/**
 * 認証関連のユーティリティ関数
 */
const crypto = require('crypto');

/**
 * ランダムなソルト値を生成
 * @returns {string} ランダムなソルト文字列
 */
function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * パスワードをハッシュ化
 * @param {string} password - ハッシュ化するパスワード
 * @param {string} salt - ソルト値
 * @returns {string} ハッシュ化されたパスワード
 */
function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

/**
 * パスワードを検証
 * @param {string} password - 検証するパスワード
 * @param {string} hash - データベースに保存されたハッシュ
 * @param {string} salt - データベースに保存されたソルト
 * @returns {boolean} パスワードが一致するか
 */
function verifyPassword(password, hash, salt) {
  const passwordHash = hashPassword(password, salt);
  return passwordHash === hash;
}

module.exports = {
  generateSalt,
  hashPassword,
  verifyPassword
};
