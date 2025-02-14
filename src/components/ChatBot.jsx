import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getRAGResponse } from '../utils/rag';
import './ChatBot.css';

function ChatBot({ onNewMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef(null);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    onNewMessage?.(userMessage);
    setIsLoading(true);
    setProgress(0);

    try {
      // 質問の種類を判断
      const isGeneralConversation = input.match(/こんにちは|おはよう|こんばんは|ありがとう|お疲れ様/);
      const isCodeQuestion = input.match(/コード|実装|機能|ファイル|ディレクトリ|プロジェクト/);

      let response;
      
      if (isGeneralConversation) {
        // 一般的な会話の場合
        response = handleGeneralConversation(input);
      } else if (isCodeQuestion) {
        // コードに関する質問の場合
        const chatPrompt = `
質問に対して、アップロードされたコードベースを参照して回答してください。

質問：
${input}

回答方針：
• ベクトル検索を使用して関連コードを参照
• 実際のファイルパスとコードブロックを含めて説明
• 具体的な実装の詳細を提供

回答形式：
1. 見出しから始める（例：「改善提案：」「コード解析：」など）
2. 説明は簡潔で分かりやすく記述
3. コードブロックは必ず以下の形式で記述：
   \`\`\`javascript:ファイルパス
   // コード
   \`\`\`
4. 変更前後のコードを示す場合：
   【変更前】
   \`\`\`javascript:ファイルパス
   // 変更前のコード
   \`\`\`
   
   【変更後】
   \`\`\`javascript:ファイルパス
   // 変更後のコード
   \`\`\`

5. 箇条書きは「•」を使用
6. 各セクション間は空行で区切る

注意：
• コードブロックの開始と終了は必ず\`\`\`で囲む
• 言語指定とファイルパスは必ず記載
• マークダウン形式を正しく使用
`;
        response = await getRAGResponse(chatPrompt, input, 'chat');
      } else {
        // その他の技術的な質問の場合
        const chatPrompt = `
あなたは親切なAIアシスタントとして、技術的な質問に回答してください。

質問：
${input}

回答方針：
• 一般的なベストプラクティスに基づいて回答
• 具体的な実装例や手順を提示
• 技術選定の根拠を説明

回答形式：
• 説明は簡潔で分かりやすく
• 必要に応じて例やコードを提示
• 段階的な説明を心がける
`;
        response = await getRAGResponse(chatPrompt, input, 'general');
      }

      setProgress(100);

      // 応答を整形して表示
      const formattedResponse = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n');

      setMessages(prev => [...prev, { 
        text: formattedResponse, 
        sender: 'ai',
        formatted: true
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: '申し訳ありません。エラーが発生しました。', 
        sender: 'system' 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
      setProgress(0);
    }
  };

  // 一般的な会話の応答を処理する関数
  const handleGeneralConversation = (input) => {
    // 基本的な挨拶パターン（サンプル）
    const greetingPatterns = {
      こんにちは: ['こんにちは！', '何かお手伝いできることはありますか？', 'ご質問がありましたらどうぞ。'],
      おはよう: ['おはようございます！', '今日も一日頑張りましょう。', 'どのようなお手伝いが必要ですか？'],
      こんばんは: ['こんばんは。', 'お疲れ様です。', '何かお困りのことはありますか？'],
      ありがとう: ['どういたしまして！', 'お役に立てて嬉しいです。', '他に何かお手伝いできることはありますか？'],
      'お疲れ様': ['お疲れ様です！', '今日も一日お疲れ様でした。', 'どのようなサポートが必要ですか？']
    };

    // 入力文字列から挨拶パターンを検出
    for (const [key, responses] of Object.entries(greetingPatterns)) {
      if (input.toLowerCase().includes(key)) {
        // ランダムに応答を選択して、より自然な会話を実現
        return responses[Math.floor(Math.random() * responses.length)];
      }
    }

    // 一般的な会話の場合（挨拶パターンに該当しない場合）
    const generalPrompt = `
あなたは親切なAIアシスタントとして、以下の入力に自然な会話で応答してください。

入力：${input}

応答の方針：
• フレンドリーで自然な口調を維持
• 文脈に応じた適切な応答
• 必要に応じて質問の意図を確認
• 技術的な内容は含めない

応答は1-2文程度で簡潔に返してください。
`;

    // 一般的な会話用のモデルを使用
    return getRAGResponse(generalPrompt, input, 'conversation');
  };

  // カスタムコードブロックコンポーネントの定義
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

  return (
    <div className="chat-container">
      <h2>チャットボット</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.formatted ? (
              <ReactMarkdown
                components={MarkdownComponents}
                className="markdown-content"
              >
                {msg.text}
              </ReactMarkdown>
            ) : (
              <p className="formatted-message">{msg.text}</p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message system">
            <div className="loading-indicator">応答を生成中...</div>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="質問を入力してください..."
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading}>
          送信
        </button>
      </div>
      {isLoading && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
      )}
    </div>
  );
}

export default ChatBot; 