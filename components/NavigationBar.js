'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // ユーザー情報を取得
  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        console.log('ナビゲーションバー: ユーザー情報を取得中...');
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include' // クッキーを含める
        });
        
        console.log('ナビゲーションバー: レスポンスステータス:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('ナビゲーションバー: 取得したユーザーデータ:', data);
          setUser(data.user);
        } else {
          // 401エラーなどは正常なので、エラーとして扱わない
          console.log('ナビゲーションバー: ユーザー未認証または取得失敗:', response.status);
          setUser(null);
        }
      } catch (error) {
        console.error('ナビゲーションバー: ユーザー情報取得エラー:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [pathname]); // パスが変わったときにも再取得
  
  // ログアウト処理
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      console.log('ナビゲーションバー: ログアウト処理を開始');
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // クッキーを含める
      });
      
      console.log('ナビゲーションバー: ログアウトレスポンスステータス:', response.status);
      
      if (response.ok) {
        console.log('ナビゲーションバー: ログアウト成功');
        // ユーザー情報をクリア
        setUser(null);
        
        // ログインページへリダイレクト
        router.push('/login');
      } else {
        console.error('ナビゲーションバー: ログアウト失敗:', response.status);
        setError('ログアウトに失敗しました');
      }
    } catch (error) {
      console.error('ナビゲーションバー: ログアウトエラー:', error);
      setError(error.message);
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-gray-800">マイアプリ</span>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
              <Link href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                スケジュール帳
              </Link>
              <Link href="/contacts" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/contacts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                アドレス帳
              </Link>
              <Link href="/rooms" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/rooms' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                会議室予約
              </Link>
              <Link href="/certification-holders" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname === '/certification-holders' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                資格保有者一覧
              </Link>
              <Link href="/chat" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${pathname.startsWith('/chat') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                チャット
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoading ? (
              <div className="text-sm text-gray-500">読み込み中...</div>
            ) : error ? (
              <div className="text-sm text-red-500">エラー: {error}</div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-700">
                  <span className="font-medium">{user.username}</span>
                  {user.role === 'admin' && (
                    <span className="ml-1 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">管理者</span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLoggingOut ? '処理中...' : 'ログアウト'}
                </button>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    管理画面
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  ログイン
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 border border-transparent text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}