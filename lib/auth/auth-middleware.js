/**
 * 認証ミドルウェア
 */
const jwt = require('jsonwebtoken');
const { getUserById } = require('./db');

// JWT秘密鍵（auth-controller.jsと同じ値を使用）
const JWT_SECRET = 'your-secret-key-should-be-long-and-secure';

/**
 * JWTトークンを検証
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
async function authenticateToken(req, res, next) {
  // クッキーからトークンを取得
  const token = req.cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: '認証されていません' });
  }

  try {
    // トークンを検証
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザー情報をリクエストに追加
    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    return res.status(403).json({ message: 'トークンが無効です' });
  }
}

/**
 * 特定のロールを持つユーザーのみアクセスを許可
 * @param {Array<string>} roles - 許可するロールの配列
 * @returns {Function} ミドルウェア関数
 */
function authorizeRoles(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: '認証されていません' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'このリソースへのアクセス権限がありません' });
    }

    next();
  };
}

/**
 * ユーザーの詳細情報を取得（他のミドルウェア後に使用）
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 * @param {Function} next - 次のミドルウェア関数
 */
async function loadUserDetails(req, res, next) {
  if (!req.user) {
    return next();
  }

  try {
    const user = await getUserById(req.user.id);
    if (user) {
      req.user.fullName = user.full_name;
      req.user.email = user.email;
    }
    next();
  } catch (error) {
    console.error('ユーザー詳細取得エラー:', error);
    next();
  }
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  loadUserDetails
};
