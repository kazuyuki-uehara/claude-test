/**
 * 認証関連のデータベース操作
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { generateSalt, hashPassword } = require('./utils');

// データベース接続
const dbPath = path.resolve(process.cwd(), 'schedule.db');
const db = new sqlite3.Database(dbPath);

/**
 * ユーザーを登録
 * @param {string} username - ユーザー名
 * @param {string} password - パスワード
 * @param {string} fullName - フルネーム
 * @param {string} email - メールアドレス
 * @param {string} role - ユーザーロール（デフォルト: 'user'）
 * @returns {Promise<number>} 作成されたユーザーのID
 */
function createUser(username, password, fullName, email, role = 'user') {
  return new Promise((resolve, reject) => {
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const query = `
      INSERT INTO users (username, password_hash, salt, full_name, email, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [username, passwordHash, salt, fullName, email, role],
      function (err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      }
    );
  });
}

/**
 * ユーザー名からユーザーを取得
 * @param {string} username - ユーザー名
 * @returns {Promise<Object|null>} ユーザー情報またはnull
 */
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE username = ?';

    db.get(query, [username], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

/**
 * IDからユーザーを取得
 * @param {number} id - ユーザーID
 * @returns {Promise<Object|null>} ユーザー情報またはnull
 */
function getUserById(id) {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM users WHERE id = ?';

    db.get(query, [id], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row || null);
    });
  });
}

/**
 * 最終ログイン日時を更新
 * @param {number} userId - ユーザーID
 * @returns {Promise<void>}
 */
function updateLastLogin(userId) {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?';

    db.run(query, [userId], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

module.exports = {
  createUser,
  getUserByUsername,
  getUserById,
  updateLastLogin
};
