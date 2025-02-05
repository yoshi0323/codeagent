import React, { useState } from 'react';
import { embedCode } from '../utils/embedding';
import { getRAGResponse } from '../utils/rag';
import { fetchAndMergeMainBranch } from '../utils/gitHubManager';

function FileUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    setIsLoading(true);
    setMessage('ファイルを処理中...');

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const content = await file.text();
        await embedCode(content, file.name);
      }
      setMessage('ファイルの処理が完了しました');
    } catch (error) {
      console.error('Error processing files:', error);
      setMessage('ファイルの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  // システム分析を実行する関数
  const analyzeSystem = async () => {
    try {
      const analysisPrompt = 'このリポジトリのシステム構造と実装の詳細な分析を行ってください。';
      const analysisResult = await getRAGResponse(analysisPrompt, '', 'analysis');
      setAnalysis(analysisResult);
    } catch (error) {
      console.error('Error analyzing system:', error);
      setAnalysis('システム分析中にエラーが発生しました。');
    }
  };

  // チャットでの質問に対する応答
  const handleQuestion = async (question) => {
    try {
      const response = await getRAGResponse(question, '', 'review');
      // 応答の表示処理
    } catch (error) {
      console.error('Error processing question:', error);
    }
  };

  const handleRepoSubmit = async () => {
    if (!repoUrl.trim()) {
      setMessage('リポジトリURLを入力してください');
      return;
    }

    setIsLoading(true);
    setMessage('リポジトリを処理中...');
    setAnalysis('');

    try {
      const urlParts = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlParts) {
        throw new Error('無効なGitHubリポジトリURLです');
      }

      const [, owner, repo] = urlParts;
      
      // mainブランチの内容をマージ
      const result = await fetchAndMergeMainBranch(owner, repo, process.cwd());
      setMessage(result.message);
      
      // システム分析を実行
      await analyzeSystem();
    } catch (error) {
      console.error('Error processing repository:', error);
      setMessage(`リポジトリの処理中にエラーが発生しました: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // GitHubのコンテンツを再帰的に処理する関数
  const processGitHubContents = async (contents, basePath) => {
    for (const item of contents) {
      if (item.type === 'file') {
        const response = await fetch(item.download_url);
        const content = await response.text();
        await embedCode(content, `${basePath}/${item.path}`);
      } else if (item.type === 'dir') {
        const response = await fetch(item.url);
        const dirContents = await response.json();
        await processGitHubContents(dirContents, basePath);
      }
    }
  };

  return (
    <div>
      <h2>プロジェクトの指定</h2>
      <div className="input-section">
        <h3>GitHubリポジトリ</h3>
        <div className="repo-input">
          <input
            type="text"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="GitHubリポジトリのURLを入力"
            disabled={isLoading}
          />
          <button 
            onClick={handleRepoSubmit} 
            disabled={isLoading}
          >
            読み込み
          </button>
        </div>
      </div>

      <div className="input-section">
        <h3>ローカルディレクトリ</h3>
        <input 
          type="file" 
          multiple 
          webkitdirectory="true"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>

      {message && (
        <div className="message">
          <p>{message}</p>
          {isLoading && <div className="loading-spinner" />}
        </div>
      )}

      {analysis && (
        <div className="analysis-result">
          <h3>システム分析結果</h3>
          <div className="analysis-content">
            {analysis.split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .input-section {
          margin: 20px 0;
        }
        .repo-input {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }
        .repo-input input {
          flex: 1;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .repo-input button {
          padding: 8px 16px;
          background-color: #0366d6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .repo-input button:disabled {
          background-color: #ccc;
        }
        .message {
          margin-top: 10px;
          padding: 10px;
          border-radius: 4px;
          background-color: #f6f8fa;
        }
        .loading-spinner {
          margin-top: 10px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #0366d6;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .analysis-result {
          margin-top: 20px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        .analysis-content {
          white-space: pre-wrap;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
        }
        .analysis-content p {
          margin: 8px 0;
        }
      `}</style>
    </div>
  );
}

export default FileUploader; 