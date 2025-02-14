import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getRAGResponse } from './utils/rag';
import SideMenu from './components/SideMenu';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // メッセージIDを管理するstate
  const [messageRefs] = useState(new Map());

  // メッセージが追加されたら自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // 履歴を追加する関数を修正
  const addToHistory = (type, title, messageId) => {
    const newHistoryItem = {
      type,
      title: title.length > 30 ? title.substring(0, 30) + '...' : title,
      time: new Date().toLocaleTimeString(),
      timestamp: Date.now(),
      messageId // メッセージIDを追加
    };

    setChatHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
  };

  // 履歴クリック時のハンドラー
  const handleHistoryClick = (messageId) => {
    const messageElement = messageRefs.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 分析完了時のハンドラーを修正
  const handleAnalysisComplete = (result, type = 'コード解析') => {
    const messageId = Date.now().toString();
    const newMessage = {
      id: messageId,
      type: 'system',
      content: result,
      formatted: true
    };
    setMessages(prev => [...prev, newMessage]);
    
    const title = result.split('\n')[0] || '分析結果';
    addToHistory(type, title, messageId);
  };

  // メッセージ送信時のハンドラーを修正
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const messageId = Date.now().toString();
    const userMessage = {
      id: messageId,
      type: 'user',
      content: input
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    addToHistory('質問', currentInput, messageId);

    try {
      const response = await getRAGResponse(
        `あなたは親切なAIアシスタントです。まずは通常の会話を優先し、必要に応じて専門的な回答を提供します。

        応答の優先順位：
        1. 通常の会話（最優先）
            • 挨拶や雑談には、親しみやすい自然な日本語で応答
            • 「こんにちは」「ありがとう」などの一般的な会話
            • ユーザーの気持ちに寄り添った対話

        2. プログラミング関連の質問（ベクトル検索を活用）
            • システム構造の説明
            • コードの改善提案
            • 実装に関する質問
            → これらはベクトル化されたコードベースを参照して回答

        3. 一般的な技術質問
            • プログラミング一般の質問
            • ベストプラクティスの提案
            • 技術選定のアドバイス

        現在の会話：
        ユーザー: ${currentInput}

        応答形式：
        • フレンドリーな日本語で
        • 必要に応じてマークダウンを使用
        • コードが必要な場合：
          \`\`\`言語:ファイルパス
          コード
          \`\`\`
        `,
        currentInput,
        'chat'
      );

      const botMessageId = Date.now().toString();
      const botMessage = {
        id: botMessageId,
        type: 'system',
        content: response,
        formatted: true
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: 'エラーが発生しました。もう一度お試しください。',
        formatted: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <SideMenu 
        onAnalysisComplete={handleAnalysisComplete} 
        chatHistory={chatHistory}
        onHistoryClick={handleHistoryClick}
      />
      <div className="main-content">
        <div className="messages-container">
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={`message ${msg.type}`}
              ref={el => {
                if (el) {
                  messageRefs.set(msg.id, el);
                } else {
                  messageRefs.delete(msg.id);
                }
              }}
            >
              {msg.formatted ? (
                <ReactMarkdown
                  components={MarkdownComponents}
                  className="markdown-content"
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-container">
          <div className="input-wrapper">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                // IME入力中は処理をスキップ
                if (e.isComposing || e.keyCode === 229) {
                  return;
                }
                
                // Shift + Enterで改行、それ以外のEnterで送信
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              onCompositionEnd={(e) => {
                // IME確定時の処理
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              placeholder="メッセージを入力..."
              rows={1}
              disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>
              {isLoading ? '送信中...' : '送信'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;