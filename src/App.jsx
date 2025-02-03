import React from 'react';
import FileUploader from './components/FileUploader';
import ChatBot from './components/ChatBot';

function App() {
  return (
    <div>
      <h1>コード解析アプリ</h1>
      <FileUploader />
      <ChatBot />
    </div>
  );
}

export default App; 