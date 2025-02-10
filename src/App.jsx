import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import FileUploader from './components/FileUploader';
import SideMenu from './components/SideMenu';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  const [analysisResult, setAnalysisResult] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  // カスタムコードブロックコンポーネント
  const CodeBlock = ({ language, value, filename }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="code-block-wrapper">
        <div className="code-block-header">
          <span className="language-label">{filename || language}</span>
          <button className="copy-button" onClick={handleCopy}>
            {copied ? 'コピーしました！' : 'コピー'}
          </button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: '1em',
            backgroundColor: '#1e1e1e'
          }}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    );
  };

  // マークダウンコンポーネントの設定
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)(?::(.+))?/.exec(className || '');
      const language = match ? match[1] : '';
      const filename = match ? match[2] : '';

      return !inline && match ? (
        <CodeBlock
          language={language}
          value={String(children).replace(/\n$/, '')}
          filename={filename}
          {...props}
        />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  // 履歴を追加する関数
  const addToHistory = (type, title) => {
    const newHistoryItem = {
      type,
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now()
    };

    setChatHistory(prev => [newHistoryItem, ...prev].slice(0, 50)); // 最新50件を保持
  };

  // 分析完了時のハンドラー
  const handleAnalysisComplete = (result, type = 'コード解析') => {
    setAnalysisResult(result);
    // 最初の行をタイトルとして使用
    const title = result.split('\n')[0] || '分析結果';
    addToHistory(type, title);
  };

  return (
    <div className="app-container">
      <SideMenu 
        onAnalysisComplete={handleAnalysisComplete} 
        chatHistory={chatHistory}
      />
      <div className="main-content">
        {analysisResult && (
          <div className="analysis-result">
            <h2>システム分析結果</h2>
            <div className="analysis-content">
              <ReactMarkdown
                components={MarkdownComponents}
                className="markdown-content"
              >
                {analysisResult}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <div className="chat-container">
          <ChatBot onNewMessage={(msg) => {
            if (msg.sender === 'user') {
              addToHistory('質問', msg.text);
            }
          }} />
        </div>
      </div>
    </div>
  );
}

export default App; 