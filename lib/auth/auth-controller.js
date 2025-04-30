/**
 * 認証コントローラー
 */
const { getUserByUsername, updateLastLogin, createUser } = require('./db');
const { verifyPassword } = require('./utils');
const jwt = require('jsonwebtoken');

// JWT秘密鍵（実際の環境では環境変数から取得するべき）
const JWT_SECRET = 'your-secret-key-should-be-long-and-secure';
// トークン有効期限（1日）
const TOKEN_EXPIRY = '1d';

/**
 * ユーザー登録
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
async function register(req, res) {
  try {
    const { username, password, fullName, email, role } = req.body;

    // 入力検証
    if (!username || !password) {
      return res.status(400).json({ message: 'ユーザー名とパスワードは必須です' });
    }

    // ユーザー名の重複チェック
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'このユーザー名は既に使用されています' });
    }

    // ユーザー作成
    const userId = await createUser(username, password, fullName, email, role);

    res.status(201).json({
      message: 'ユーザーが正常に登録されました',
      userId
    });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({ message: '内部サーバーエラーが発生しました' });
  }
}

/**
 * ログイン認証
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // 入力検証
    if (!username || !password) {
      return res.status(400).json({ message: 'ユーザー名とパスワードは必須です' });
    }

    // ユーザー取得
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' });
    }

    // パスワード検証
    const isPasswordValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' });
    }

    // 最終ログイン日時更新
    await updateLastLogin(user.id);

    // JWTトークン生成
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    // JWTトークンをクッキーに保存
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 1日
    });

    res.status(200).json({
      message: 'ログインに成功しました',
      token: token,  // トークンをレスポンスに含める
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: '内部サーバーエラーが発生しました' });
  }
}

/**
 * ログアウト
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
function logout(req, res) {
  // クッキーからトークンをクリア
  res.clearCookie('auth_token');
  res.status(200).json({ message: 'ログアウトしました' });
}

/**
 * 現在のユーザー情報を取得
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
function getCurrentUser(req, res) {
  // 認証ミドルウェアでreq.userが設定されている
  if (!req.user) {
    return res.status(401).json({ message: '認証されていません' });
  }

  res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role
    }
  });
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
