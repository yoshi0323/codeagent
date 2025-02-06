import React, { useState } from 'react';
import { getRAGResponse } from '../utils/rag';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;

    setMessages(prev => [...prev, { text: input, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await getRAGResponse(input);
      setMessages(prev => [...prev, { text: response, sender: 'ai' }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        text: error.message || 'エラーが発生しました。しばらく待ってから再度お試しください。', 
        sender: 'system' 
      }]);
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  return (
    <div className="chatbot-container">
      <h2>チャットボット</h2>
      <div className="chat-content">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && <div className="message system">応答を生成中...</div>}
        </div>
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