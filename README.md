# Schedule App

Next.jsで構築されたスケジュール管理アプリケーションです。

## 機能

- ユーザー認証（登録、ログイン、ログアウト）
- スケジュール管理
- 会議室予約
- 連絡先管理
- 証明書管理
- チャット機能
- 管理者機能

## 技術スタック

- **フロントエンド**: React, Next.js, Tailwind CSS
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite
- **認証**: JWT, bcryptjs

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# 管理者ユーザーの作成
npm run create-admin
```

## 認証情報

デフォルトの管理者アカウント：
- ユーザー名: admin
- パスワード: admin123

## プロジェクト構造

- `/app` - Next.jsのアプリケーションルート
- `/components` - Reactコンポーネント
- `/lib` - ユーティリティ関数、データベース操作
- `/scripts` - 管理者ユーザー作成スクリプトなど

詳細な認証機能については [README_AUTH.md](./README_AUTH.md) を参照してください。
