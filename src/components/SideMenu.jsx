import React, { useState } from 'react';
import { fetchAndMergeMainBranch } from '../utils/gitHubManager';
import { getRAGResponse } from '../utils/rag';
import { embedCode } from '../utils/embedding';
import './SideMenu.css';

const SideMenu = ({ onAnalysisComplete }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');

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
      const analysisPrompt = 'このリポジトリのシステム構造と実装の詳細な分析を行ってください。';
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
システムの全体構造と実行フローを詳細に分析し、以下の点について具体的に説明してください：

1. システムアーキテクチャ
   • 各ディレクトリの役割と責任
   • ファイル間の依存関係
   • 主要なコンポーネントの関係図

2. 実行フロー
   • アプリケーションの起動から終了までの流れ
   • 各コンポーネントの初期化と実行順序
   • データの流れと状態管理の方法

3. 主要コンポーネントの詳細
   • 各ファイルの主要な機能と役割
   • 重要な関数とメソッドの説明
   • コンポーネント間の通信方法

4. 技術スタックと実装の特徴
   • 使用されている主要なライブラリと役割
   • 特筆すべき実装パターンや最適化
   • エラーハンドリングの方法

出力形式：
• 見出しと箇条書きを使用して階層的に整理
• コードブロックは適切な言語指定とインデント
• 図表やダイアグラムは ASCII アートで表現
• ファイルパスは完全なパスで記載

各セクションは改行で区切り、読みやすさを重視してください。
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
コードベースを詳細に分析し、以下の観点から具体的な改善提案を行ってください：

1. コードの品質と保守性
2. パフォーマンスの最適化
3. セキュリティの強化
4. エラーハンドリングの改善

各提案について：
• 問題点の具体的な説明
• 修正前と修正後のコードを明確に提示
• 改善による具体的なメリット
• 実装時の注意点

コードブロックは必ず適切な言語指定とファイルパスを含め、
説明は箇条書きと適切な改行で読みやすく整形してください。
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

    try {
      // ファイルの処理
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        await embedCode(content, file.name);
      }

      // アップロード後に自動で解析を実行
      const analysisPrompt = `
システムの全体構造と実行フローを詳細に分析し、以下の点について具体的に説明してください：

1. システムアーキテクチャ
   • 各ディレクトリの役割と責任
   • ファイル間の依存関係
   • 主要なコンポーネントの関係図

2. 実行フロー
   • アプリケーションの起動から終了までの流れ
   • 各コンポーネントの初期化と実行順序
   • データの流れと状態管理の方法

3. 主要コンポーネントの詳細
   • 各ファイルの主要な機能と役割
   • 重要な関数とメソッドの説明
   • コンポーネント間の通信方法

4. 技術スタックと実装の特徴
   • 使用されている主要なライブラリと役割
   • 特筆すべき実装パターンや最適化
   • エラーハンドリングの方法

出力形式：
• 見出しと箇条書きを使用して階層的に整理
• コードブロックは適切な言語指定とインデント
• 図表やダイアグラムは ASCII アートで表現
• ファイルパスは完全なパスで記載

各セクションは改行で区切り、読みやすさを重視してください。
`;
      const analysisResult = await getRAGResponse(analysisPrompt, '', 'code_analysis');
      onAnalysisComplete(analysisResult);
    } catch (error) {
      console.error('Error processing files:', error);
      alert('ファイルの処理中にエラーが発生しました: ' + error.message);
    } finally {
      setIsLoading(false);
      setCurrentAction('');
    }
  };

  const handleUrlLoad = () => {
    // TODO: URLからの読み込み処理
    console.log('Loading URL:', url);
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
      </div>
    </div>
  );
};

export default SideMenu; 