import React from 'react';

function FileUploader() {
  // TODO: ファイル選択ダイアログやGitHubリポジトリURL入力機能を実装する
  return (
    <div>
      <h2>プロジェクトの指定</h2>
      <p>GitHubリポジトリのURLまたはローカルディレクトリを指定してください。</p>
      <input type="text" placeholder="リポジトリのURLを入力" />
      <button>読み込み</button>
    </div>
  );
}

export default FileUploader; 