# コード解析アプリ

このアプリケーションは、GitHubリポジトリやローカルプロジェクトのコードを解析し、EmbeddingおよびRetrieval-Augmented Generation (RAG) を用いて、LLMでプロジェクトの構成や変更提案をチャットボット形式で提供します。

## 主な機能
- GitHubリポジトリまたはローカルディレクトリの指定・読み込み
- コード解析およびEmbedding処理
- RAGによる関連情報の取得とLLMでの回答生成
- チャットボット形式のUIでユーザーと対話

## 使用技術
- **Electron**: デスクトップアプリケーション
- **React**: フロントエンドUI
- **Node.js**: バックエンドロジック
- **OpenAI API**: コードEmbedding／LLM（必要に応じて追加）
- **Docker**: Weaviateを実行するためのコンテナ化技術

## 必要なパッケージとライブラリ
以下のパッケージをインストールする必要があります。これらは`package.json`に記載されています。

### 依存関係
- `axios`: HTTPリクエストを行うためのライブラリ
- `buffer`: バッファ操作のためのライブラリ
- `crypto-browserify`: ブラウザ環境での暗号化機能
- `dotenv`: 環境変数を管理するためのライブラリ
- `electron`: デスクトップアプリケーションを作成するためのフレームワーク
- `os-browserify`: Node.jsの`os`モジュールのブラウザ版
- `process`: プロセス情報を扱うためのライブラリ
- `react`: ユーザーインターフェースを構築するためのライブラリ
- `react-dom`: ReactコンポーネントをDOMにレンダリングするためのライブラリ
- `stream-browserify`: ストリーム操作のためのライブラリ
- `vm-browserify`: ブラウザ環境でのVM機能

### 開発依存関係
- `@babel/core`: Babelのコアライブラリ
- `@babel/preset-env`: 最新のJavaScript機能をサポートするためのプリセット
- `@babel/preset-react`: ReactのJSXをサポートするためのプリセット
- `babel-loader`: BabelをWebpackで使用するためのローダー
- `css-loader`: CSSをモジュールとして扱うためのローダー
- `dotenv-webpack`: Webpackで環境変数を使用するためのプラグイン
- `style-loader`: CSSをDOMに追加するためのローダー
- `webpack`: モジュールバンドラー
- `webpack-cli`: Webpackのコマンドラインインターフェース

## セットアップ手順
1. **Node.jsのインストール**: Node.jsがインストールされていない場合は、[Node.jsの公式サイト](https://nodejs.org/)からインストールしてください。

2. **Dockerのインストール**: Dockerがインストールされていない場合は、[Dockerの公式サイト](https://www.docker.com/)からインストールしてください。

3. **リポジトリのクローン**: プロジェクトのリポジトリをクローンします。
   ```bash
   git clone <リポジトリのURL>
   cd <プロジェクト名>
   ```

4. **依存関係のインストール**: 以下のコマンドを実行して、必要なパッケージをインストールします。
   ```bash
   npm install
   ```

5. **Weaviateの起動**: Dockerを使用してWeaviateを起動します。
   ```bash
   docker-compose up -d
   ```

6. **開発モードでの起動**: アプリケーションを開発モードで起動します。
   ```bash
   npm start
   ```

7. **ビルド（必要に応じて）**: アプリケーションをビルドする場合は、以下のコマンドを実行します。
   ```bash
   npm run build
   ```

## 環境変数の設定
- `.env`ファイルをプロジェクトのルートに作成し、必要な環境変数（例: `GEMINI_API_KEY`）を設定します。

## ライセンス
このプロジェクトはMITライセンスの下で提供されています。