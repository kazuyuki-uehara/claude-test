/**
 * Next.jsミドルウェア - 認証状態の確認と保護されたルートへのアクセス制御
 */
import { NextResponse } from 'next/server';

// 認証が不要なパス
const publicPaths = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',
  '/_next',
  '/favicon.ico'
];

/**
 * パスが公開パスかどうかをチェック
 * @param {string} path - チェックするパス
 * @returns {boolean} 公開パスの場合はtrue
 */
function isPublicPath(path) {
  return publicPaths.some(publicPath => {
    return path === publicPath || path.startsWith(publicPath + '/');
  });
}

/**
 * ミドルウェア関数
 * @param {Object} request - リクエストオブジェクト
 * @returns {NextResponse} NextResponseオブジェクト
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  console.log('ミドルウェア実行:', pathname);
  
  // 認証トークンの取得
  const authToken = request.cookies.get('auth_token')?.value;
  console.log('認証トークンの有無:', authToken ? 'あり' : 'なし');
  
  // 認証が不要なパスの場合はそのまま続行
  if (isPublicPath(pathname)) {
    console.log('公開パスなのでそのまま続行:', pathname);
    return NextResponse.next();
  }
  
  // 認証されていない場合はログインページにリダイレクト
  if (!authToken) {
    console.log('認証されていないのでログインページへリダイレクト:', pathname);
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  // 認証されている場合は続行
  console.log('認証済みなのでそのまま続行:', pathname);
  return NextResponse.next();
}

/**
 * ミドルウェアの設定
 */
export const config = {
  matcher: [
    // すべてのパスに適用（APIルートやアセットを除く）
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};