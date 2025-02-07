const { callGeminiAPI } = require('./geminiAPI');
const { findSimilarCode } = require('./embedding');

// TODO: Retrieval-Augmented Generation (RAG) ロジックを実装する
async function getRAGResponse(question, context = '', type = 'analysis') {
  try {
    const similarSnippets = findSimilarCode(question);
    
    // コンテキストを構築（ファイルタイプごとに整理）
    const snippetsByType = similarSnippets.reduce((acc, snippet) => {
      const ext = snippet.path.split('.').pop();
      if (!acc[ext]) acc[ext] = [];
      acc[ext].push(snippet);
      return acc;
    }, {});

    // 言語/タイプごとにフォーマットされたコンテキストを作成
    const contextPrompt = Object.entries(snippetsByType)
      .map(([type, snippets]) => `
=== ${type.toUpperCase()} ファイル ===

${snippets.map(snippet => `
ファイル: ${snippet.path}

\`\`\`${type}
${snippet.content}
\`\`\`
`).join('\n\n')}
`).join('\n\n');

    // プロンプトタイプに応じてテンプレートを選択
    const promptTemplate = type === 'analysis' ? 
      `
あなたは上級ソフトウェアアーキテクトとして、このシステムの包括的な分析を行ってください。
コードを詳細に解析し、システムの全体像を明確に説明してください。

=== コードベース ===

${contextPrompt}

質問: ${question}

以下の形式で回答を提供してください：

**1. システム概要**

**• システムの目的と主な機能**
（具体的な機能と目的を列挙）

**• 全体アーキテクチャの説明**
（システム構成図やアーキテクチャ図を含む）

**• 主要なコンポーネントとその役割**
（各コンポーネントの詳細な説明）

**• 使用している技術スタックと選定理由**
（各技術の具体的な用途と選定理由）

**2. システム構造**

**• ディレクトリ構造と各ディレクトリの役割**
（完全なディレクトリツリーと説明）

**• 重要なファイルとその機能**
（キーとなるファイルの詳細な説明）

**• データフローの説明**
（システム内のデータの流れを図示）

**• コンポーネント間の相互作用**
（コンポーネント間の関係性と通信方法）

**3. 技術的特徴**

**• 採用している設計パターン**
（具体的なパターンとその実装箇所）

**• 特筆すべき実装方法**
（ユニークな実装や最適化手法）

**• パフォーマンスに関する考慮事項**
（性能最適化のポイント）

**• セキュリティに関する実装**
（セキュリティ対策の詳細）
` :
      `
あなたは上級ソフトウェアエンジニアとして、このコードの詳細なレビューと改善提案を行ってください。
コードを深く解析し、具体的な改善点を示してください。

=== コードベース ===

${contextPrompt}

質問: ${question}

**1. 改善が必要な箇所**

**ファイルパス：**
（対象ファイルの完全パス）

**問題点：**
• 
• 

**改善が必要な理由：**
• 
• 

**2. 改善提案**

**【修正1】**
変更前：
\`\`\`
（現在のコード）
\`\`\`

変更後：
\`\`\`
（修正後のコード）
\`\`\`

**改善点：**
• 
• 

**【修正2】**
（同様のフォーマットで追加の修正を記載）

**3. 実装上の注意点**
• 
• 

**4. 追加の推奨事項**
• 
• 

**5. テスト方針**
• 
• 
`;

    const apiResponse = await callGeminiAPI(promptTemplate);
    
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