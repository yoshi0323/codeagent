import React from 'react';
import FileUploader from './components/FileUploader';
import SideMenu from './components/SideMenu';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <h1>コード解析アプリ</h1>
      <SideMenu>
        <FileUploader />
      </SideMenu>
      <ChatBot />
    </div>
  );
}

export default App; 