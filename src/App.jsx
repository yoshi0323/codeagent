import React from 'react';
import FileUploader from './components/FileUploader';
import SideMenu from './components/SideMenu';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <SideMenu />
      <div className="main-content">
        <div className="analysis-result">
          <FileUploader />
        </div>
        <div className="chat-container">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}

export default App; 