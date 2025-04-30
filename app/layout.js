import './globals.css';
import { NavigationBar } from '../components/NavigationBar';

export const metadata = {
  title: 'スケジュール＆アドレス帳アプリ',
  description: 'シンプルなスケジュール管理とアドレス帳アプリ',
};

export default function RootLayout({ children }) {
  
  return (
    <html lang="ja">
      <body className="bg-gray-100 min-h-screen">
        <NavigationBar />
        <main className="pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}