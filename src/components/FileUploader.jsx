import React, { useState } from 'react';
// embedCode() 内で Weaviate への POST 処理を行う想定
import { embedCode } from '../utils/embedding';

function FileUploader() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  /**
   * ファイル選択時のハンドラー
   */
  const handleFileUpload = async (event) => {
    const files = event.target.files;
    setIsLoading(true);
    setMessage('ファイルを処理中...');

    try {
      // 選択されたすべてのファイルを処理
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // ファイルのテキスト内容を取得
        const content = await file.text();

        // 1. コメント除去（行コメント // とブロックコメント /* ... */）
        const cleanedContent = removeComments(content);

        // 2. チャンク分割 (例: 10000文字ごと)
        const chunks = splitIntoChunks(cleanedContent, 10000);

        // 3. 各チャンクをWeaviateに送信
        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunkText = chunks[chunkIndex];
          // embedCode() 内でベクトル化＆WeaviateへのPOSTを行う
          await embedCode(chunkText, `${file.name}__chunk${chunkIndex}`);
        }
      }
      setMessage('ファイルの処理が完了しました');
    } catch (error) {
      console.error('Error processing files:', error);
      setMessage('ファイルの処理中にエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * テキストをチャンク分割する関数
   * @param {string} text - 分割対象の文字列
   * @param {number} chunkSize - 1チャンクあたりの最大文字数
   * @returns {string[]} 分割後の文字列配列
   */
  const splitIntoChunks = (text, chunkSize) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  };

  /**
   * 簡易的にコメントを除去する関数
   *  - 行コメント "//..."
   *  - ブロックコメント "/* ... *\/"
   *  文字列リテラル内の "//" や "/*" は考慮しない単純実装なので注意
   */
  const removeComments = (codeText) => {
    // 行コメントを削除
    // ^//.* -> 行頭の // から行末まで
    // ブロックコメントを削除
    // /\/\*[\s\S]*?\*\//gm -> /* から */ までを貪欲でないマッチ
    return codeText
      .replace(/\/\/.*$/gm, '')           // 行コメント
      .replace(/\/\*[\s\S]*?\*\//gm, ''); // ブロックコメント
  };

  return (
    <div>
      <h3>ローカルファイルアップロード</h3>
      <input
        type="file"
        multiple
        onChange={handleFileUpload}
      />
      <div style={{ marginTop: '1rem' }}>
        {isLoading ? <p>{message}</p> : <p>{message}</p>}
      </div>
    </div>
  );
}

export default FileUploader;
