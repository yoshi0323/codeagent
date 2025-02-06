import React, { useState } from 'react';
import './SideMenu.css';

const SideMenu = () => {
  const [url, setUrl] = useState('');

  const handleFileUpload = (event) => {
    // TODO: ファイルアップロード処理
  };

  const handleAnalyze = () => {
    // TODO: コード解析処理
  };

  const handleSuggest = () => {
    // TODO: 修正提案処理
  };

  const handleUrlLoad = () => {
    // TODO: URLからの読み込み処理
    console.log('Loading URL:', url);
  };

  return (
    <div className="side-menu">
      <div className="menu-content">
        <div className="url-input-section">
          <input
            type="text"
            placeholder="GitHubのURLを入力"
            className="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={handleUrlLoad} className="menu-button">
            URLを読み込む
          </button>
        </div>
        
        <div className="button-section">
          <label className="upload-button">
            <input
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            ファイルをアップロード
          </label>

          <button onClick={handleAnalyze} className="menu-button">
            コード解析
          </button>

          <button onClick={handleSuggest} className="menu-button">
            修正提案
          </button>
        </div>
      </div>
    </div>
  );
};

export default SideMenu; 