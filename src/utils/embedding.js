const axios = require('axios');

// ブラウザ実行だとファイル操作はできないため、ログはコンソール出力に変更
function logToConsole(message) {
  console.log(`[embedding.js] ${message}`);
}

// インメモリストレージ (ページをリロードすると消える点に注意)
const embeddingStore = new Map();

/**
 * コードをベクトル化して保存する関数
 * @param {string} fileContent - ファイル内容
 * @param {string} filePath    - ファイルパスなど識別用の文字列
 */
export async function embedCode(fileContent, filePath) {
  try {
    // 簡易的なベクトル化（単語ごとにcharCodeAt合計）
    const simpleVector = fileContent.split(/\s+/).map((word) =>
      Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    // Weaviateにデータを送信（例: ローカルでWeaviateサーバーが動いている前提）
    // ブラウザから http://localhost:8080 へアクセスする場合、CORS設定が必要になることがあります。
    await axios.post('http://localhost:8080/v1/objects', {
      class: 'Document',
      properties: {
        content: fileContent,
        vector: simpleVector,
      },
    });

    // ベクトルとメタデータを保存
    embeddingStore.set(filePath, {
      vector: simpleVector,
      content: fileContent,
      path: filePath,
    });

    logToConsole(`ファイル: ${filePath} のベクトル化成功: ${JSON.stringify(simpleVector)}`);
    return simpleVector;
  } catch (error) {
    logToConsole(`ファイル: ${filePath} のベクトル化に失敗: ${error.message}`);
    console.error('Error in embedCode:', error);
    throw error;
  }
}

/**
 * コサイン類似度を計算する関数
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

/**
 * 類似コードを検索する関数
 * @param {string} query
 * @param {number} [topK=3]
 * @returns {{ path: string, content: string, similarity: number }[]}
 */
export function findSimilarCode(query, topK = 3) {
  try {
    // クエリをベクトル化
    const queryVector = query.split(/\s+/).map((word) =>
      Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    // 全ストア内コードとの類似度を計算
    const similarities = Array.from(embeddingStore.entries()).map(([p, data]) => ({
      path: p,
      content: data.content,
      similarity: cosineSimilarity(queryVector, data.vector),
    }));

    // 類似度降順にソートして上位K件を返す
    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, topK);
  } catch (error) {
    console.error('Error in findSimilarCode:', error);
    throw error;
  }
}

/**
 * ストアをクリアする関数
 */
export function clearEmbeddingStore() {
  embeddingStore.clear();
  logToConsole('embeddingStore cleared');
}
