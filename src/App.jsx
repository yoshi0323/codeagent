import React, { useState } from 'react';
import FileUploader from './components/FileUploader';
import SideMenu from './components/SideMenu';
import ChatBot from './components/ChatBot';
import './App.css';

function App() {
  const [analysisResult, setAnalysisResult] = useState('');

  return (
    <div className="app-container">
      <SideMenu onAnalysisComplete={setAnalysisResult} />
      <div className="main-content">
        <div className="analysis-result">
          <h2>システム分析結果</h2>
          <div className="analysis-content">
            {analysisResult ? (
              analysisResult.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))
            ) : (
              <p>解析結果がここに表示されます</p>
            )}
          </div>
        </div>
        <div className="chat-section">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}

export default App;