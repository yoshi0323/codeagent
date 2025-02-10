import React, { useState } from 'react';
import { fetchAndMergeMainBranch } from '../utils/gitHubManager';
import { getRAGResponse } from '../utils/rag';
import { embedCode } from '../utils/embedding';
import './SideMenu.css';

const SideMenu = ({ onAnalysisComplete, chatHistory = [] }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const [progress, setProgress] = useState(0);

  const handleRepoSubmit = async () => {
    if (!repoUrl.trim()) {
      alert('リポジトリURLを入力してください');
      return;
    }

    setIsLoading(true);
    setCurrentAction('repo');

    try {
      const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlParts) {
        throw new Error('無効なGitHubリポジトリURLです');
      }

      const [, owner, repo] = urlParts;
      
      // mainブランチの内容をマージ
      await fetchAndMergeMainBranch(owner, repo, process.cwd());
      
      // システム分析を実行
      const analysisPrompt = `
# リポジトリ分析

以下の形式で分析結果を出力してください：

## 1. リポジトリ概要
• リポジトリ名: ${repo}
• オーナー: ${owner}
• 主要な機能と目的

## 2. プロジェクト構造
\`\`\`plaintext:directory-structure
root/
  ├── src/
  │   ├── components/
  │   ├── utils/
  │   └── ...
  ├── public/
  └── package.json
\`\`\`

## 3. 主要なファイル
各ファイルの役割と重要な実装：

### コアコンポーネント
\`\`\`javascript:src/components/MainComponent.jsx
// 重要なコンポーネントの実装例
import React from 'react';

function MainComponent() {
  // 実装の詳細
}
\`\`\`

### ユーティリティ関数
\`\`\`javascript:src/utils/helpers.js
// 重要なユーティリティ関数
export function helper() {
  // 実装の詳細
}
\`\`\`

## 4. 依存関係
• 主要なパッケージとバージョン
• 開発環境の設定

## 5. 実装の特徴
• アーキテクチャパターン
• コーディング規約
• 特筆すべき実装方法

注意：
• コードブロックは必ずバッククォート3つで囲む
• 言語指定とファイルパスを必ず記載
• ファイル構造は tree 形式で表示
• 重要なコードは実際の実装を表示
`;

      const analysisResult = await getRAGResponse(analysisPrompt, '', 'analysis');
      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const handleCodeAnalysis = async () => {
    setIsLoading(true);
    setCurrentAction('analysis');
    try {
      const analysisPrompt = `
# コード解析

以下の形式で解析結果を出力してください：

1. 各セクションは見出し（##）を使用
2. コードは必ずコードブロックで表示
3. 説明は簡潔で分かりやすく

## システム構造
• プロジェクトの概要
• 主要なファイルとその役割
• 依存関係の説明

## 主要コンポーネント
各コンポーネントについて：
\`\`\`javascript:src/components/ComponentName.jsx
// 重要なコードブロック
\`\`\`

## データフロー
• 処理の流れを説明
• 重要な関数の実装例：
\`\`\`javascript:src/utils/example.js
function example() {
  // 実装の例
}
\`\`\`

注意：
• コードブロックは必ずバッククォート3つで囲む
• 言語指定とファイルパスを必ず記載
• シンタックスハイライトが適用されるように正しく記述
`;
      const analysisResult = await getRAGResponse(analysisPrompt, '', 'code_analysis');
      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const handleSuggestImprovements = async () => {
    setIsLoading(true);
    setCurrentAction('improvement');
    try {
      const improvementPrompt = `
# 改善提案

各提案は以下の形式で記述してください：

## 1. 改善点の概要
• 問題点の説明
• 改善による効果

## 2. 具体的な修正案
【現在のコード】
\`\`\`javascript:src/components/Target.jsx
// 現在の実装
\`\`\`

【改善後のコード】
\`\`\`javascript:src/components/Target.jsx
// 改善された実装
\`\`\`

## 3. 実装手順
1. 修正手順の詳細
2. 注意点や考慮事項

注意：
• コードの変更は必ずコードブロックで表示
• ファイルパスと言語を明記
• 変更前後の違いを明確に
`;
      const improvementResult = await getRAGResponse(improvementPrompt, '', 'improvement');
      onAnalysisComplete(improvementResult);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setCurrentAction('upload');
    setProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        await embedCode(content, file.name);
        setProgress(((i + 1) / files.length) * 100);
      }

      // ファイル処理後の分析プロンプト
      const uploadAnalysisPrompt = `
# プロジェクト分析

以下の形式で分析結果を出力してください：

## 1. プロジェクト概要
• 目的と主要機能
• 技術スタックの説明

## 2. ファイル構造
\`\`\`plaintext:project-structure
src/
  ├── components/
  │   ├── Component1.jsx
  │   └── Component2.jsx
  └── utils/
      └── helpers.js
\`\`\`

## 3. 主要コンポーネント
各コンポーネントの説明と実装例：
\`\`\`javascript:src/components/Example.jsx
// コードブロック
\`\`\`

注意：
• コードは必ずコードブロックで表示
• ファイル構造は tree 形式で表示
• 重要な実装は具体的なコードで説明
`;

      const analysisResult = await getRAGResponse(uploadAnalysisPrompt, '', 'code_analysis');
      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('ファイルの処理中にエラーが発生しました: ' + error.message);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
      setProgress(0);
    }
  };

  return (
    <div className="side-menu">
      <div className="menu-content">
        <div className="url-input-section">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHubのURLを入力"
            disabled={isLoading}
          />
          <button 
            onClick={handleRepoSubmit}
            disabled={isLoading}
            className={`menu-button ${isLoading && currentAction === 'repo' ? 'loading' : ''}`}
          >
            {isLoading && currentAction === 'repo' ? 'リポジトリを読み込み中...' : 'リポジトリを読み込む'}
          </button>
        </div>

        <div className="file-upload-section">
          <label className={`upload-button ${isLoading && currentAction === 'upload' ? 'loading' : ''}`}>
            <input
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              onChange={handleFileUpload}
              disabled={isLoading}
              style={{ display: 'none' }}
            />
            {isLoading && currentAction === 'upload' ? 'ファイルを処理中...' : 'プロジェクトをアップロード'}
          </label>
        </div>

        <div className="analysis-buttons">
          <button 
            onClick={handleCodeAnalysis}
            disabled={isLoading}
            className={`menu-button analysis-button ${isLoading && currentAction === 'analysis' ? 'loading' : ''}`}
          >
            {isLoading && currentAction === 'analysis' ? 'コード解析中...' : 'コード解析'}
          </button>
          <button 
            onClick={handleSuggestImprovements}
            disabled={isLoading}
            className={`menu-button improvement-button ${isLoading && currentAction === 'improvement' ? 'loading' : ''}`}
          >
            {isLoading && currentAction === 'improvement' ? '修正案を生成中...' : '修正提案'}
          </button>
        </div>

        <div className="history-section">
          <h3>履歴</h3>
          <div className="history-list">
            {chatHistory.map((item, index) => (
              <div key={index} className="history-item">
                <span className="history-type">{item.type}：</span>
                <span className="history-title">{item.title}</span>
                <span className="history-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideMenu; 