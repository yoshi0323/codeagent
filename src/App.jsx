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
        {analysisResult && (
          <div className="analysis-result">
            <h2>システム分析結果</h2>
            <div className="analysis-content">
              {analysisResult.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
        <div className="chat-container">
          <ChatBot />
        </div>
      </div>
    </div>
  );
}

export default App; 