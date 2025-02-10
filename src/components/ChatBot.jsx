import React, { useState } from 'react';
import { getRAGResponse } from '../utils/rag';
import './ChatBot.css';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setIsLoading(true);

    try {
      const chatPrompt = `
アップロードされたプロジェクトのコードベースに基づいて、以下の質問に具体的に回答してください。
回答は必ずベクトル化された既存のコードファイルの内容のみを参照してください。

質問：
${input}

回答の要件：
1. プロジェクト内の実際のコードと実装に基づいた正確な情報のみを提供
2. 該当するコードがある場合は、必ず実際のファイルパスとコードブロックを含める
3. 存在しない機能や実装については、「その機能は実装されていません」と明確に伝える
4. 不確かな情報は含めない

回答形式：
• 説明は簡潔で分かりやすく
• コードブロックは以下の形式で表示：
\`\`\`言語:実際のファイルパス
実際のコード
\`\`\`
• 必要に応じて箇条書きや見出しを使用
• 長い回答は適切に段落分け

ベクトル検索で関連性の高いコードのみを参照し、それに基づいて回答してください。
`;

      const response = await getRAGResponse(chatPrompt, input, 'chat');
      
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
        text: '申し訳ありません。アップロードされたコードベースからの情報取得に失敗しました。', 
        sender: 'system' 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="chat-container">
      <h2>チャットボット</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.formatted ? (
              <pre className="formatted-message">
                {msg.text}
              </pre>
            ) : (
              <p>{msg.text}</p>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message system">
            <div className="loading-indicator">応答を生成中...</div>
          </div>
        )}
      </div>
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          disabled={isLoading}
          placeholder="メッセージを入力..."
        />
        <button onClick={handleSend} disabled={isLoading}>
          送信
        </button>
      </div>
    </div>
  );
}

export default ChatBot; 