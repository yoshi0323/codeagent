require('dotenv').config();
const axios = require('axios');

// 環境変数は直接アクセス
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function callGeminiAPI(query) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEYが設定されていません');
  }

  try {
    const response = await axios({
      method: 'post',
      url: GEMINI_API_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        contents: [{
          parts: [{
            text: query
          }]
        }]
      },
      params: {
        key: GEMINI_API_KEY
      }
    });

    // レスポンスから適切なテキストを抽出
    const generatedText = response.data.candidates[0].content.parts[0].text;
    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = { callGeminiAPI }; 