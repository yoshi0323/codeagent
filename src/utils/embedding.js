// インメモリストレージとしてMap型を使用
const embeddingStore = new Map();

// コードをベクトル化して保存する関数
async function embedCode(fileContent, filePath) {
  try {
    // 簡易的なベクトル化（実際のプロダクションでは適切なEmbeddingモデルを使用）
    const simpleVector = fileContent.split(/\s+/).map(word => {
      // 単語をシンプルな数値ベクトルに変換
      return Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    });

    // ベクトルとメタデータを保存
    embeddingStore.set(filePath, {
      vector: simpleVector,
      content: fileContent,
      path: filePath
    });

    return simpleVector;
  } catch (error) {
    console.error('Error in embedCode:', error);
    throw error;
  }
}

// コサイン類似度を計算する関数
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const normB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (normA * normB);
}

// 類似コードを検索する関数
function findSimilarCode(query, topK = 3) {
  try {
    // クエリをベクトル化
    const queryVector = query.split(/\s+/).map(word => 
      Array.from(word).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    );

    // 全てのベクトルとの類似度を計算
    const similarities = Array.from(embeddingStore.entries()).map(([path, data]) => ({
      path,
      content: data.content,
      similarity: cosineSimilarity(queryVector, data.vector)
    }));

    // 類似度でソートして上位K件を返す
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    console.error('Error in findSimilarCode:', error);
    throw error;
  }
}

// ストアをクリアする関数
function clearEmbeddingStore() {
  embeddingStore.clear();
}

module.exports = { 
  embedCode, 
  findSimilarCode, 
  clearEmbeddingStore 
}; 