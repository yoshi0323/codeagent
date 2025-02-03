# コード解析アプリ

このアプリケーションは、GitHubリポジトリやローカルプロジェクトのコードを解析し、
EmbeddingおよびRetrieval-Augmented Generation (RAG) を用いて、
LLMでプロジェクトの構成や変更提案をチャットボット形式で提供します。

## 主な機能
- GitHubリポジトリまたはローカルディレクトリの指定・読み込み
- コード解析およびEmbedding処理
- RAGによる関連情報の取得とLLMでの回答生成
- チャットボット形式のUIでユーザーと対話

## 使用技術
- Electron: デスクトップアプリケーション
- React: フロントエンドUI
- Node.js: バックエンドロジック
- OpenAI API 等: コードEmbedding／LLM（必要に応じて追加）

## セットアップ
1. 依存関係をインストール: `npm install`
2. 開発モードで起動（Electron使用）: `npm start`
3. ビルド（必要に応じて）: `npm run build` 