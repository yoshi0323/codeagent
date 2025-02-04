const { callGeminiAPI } = require('./geminiAPI');

// TODO: Retrieval-Augmented Generation (RAG) ロジックを実装する
async function getRAGResponse(question, embeddingData) {
  try {
    // Gemini APIを呼び出す
    const apiResponse = await callGeminiAPI(question);
    
    if (!apiResponse) {
      throw new Error('APIからの応答が空です');
    }
    
    return apiResponse;
  } catch (error) {
    console.error('Error in RAG processing:', error);
    if (error.response) {
      // APIからのエラーレスポンス
      return `APIエラー: ${error.response.data.error.message || '不明なエラー'}`;
    } else if (error.request) {
      // リクエストは作成されたがレスポンスを受け取れなかった
      return 'ネットワークエラー: APIに接続できません';
    } else {
      // リクエストの作成時にエラーが発生
      return `エラー: ${error.message}`;
    }
  }
}

module.exports = { getRAGResponse }; 