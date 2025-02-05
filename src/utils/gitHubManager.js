const axios = require('axios');
const { embedCode } = require('./embedding');

async function fetchAndMergeMainBranch(owner, repo, currentPath) {
  try {
    // mainブランチの最新コミットのSHAを取得
    const branchResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches/main`
    );
    const mainSHA = branchResponse.data.commit.sha;

    // mainブランチのツリーを取得
    const treeResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${mainSHA}?recursive=1`
    );

    // 既存のファイルを保持しながら、新しいファイルをマージ
    for (const item of treeResponse.data.tree) {
      if (item.type === 'blob') { // ファイルの場合
        try {
          const fileResponse = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}`,
            { 
              headers: { 
                'Accept': 'application/vnd.github.v3.raw',
                'Content-Type': 'application/json'
              },
              responseType: 'text'  // レスポンスを文字列として取得
            }
          );
          
          // レスポンスが文字列であることを確認
          const content = typeof fileResponse.data === 'string' 
            ? fileResponse.data 
            : JSON.stringify(fileResponse.data);
          
          // ファイルの内容をEmbedding
          await embedCode(content, `${owner}/${repo}/${item.path}`);
        } catch (fileError) {
          console.warn(`Warning: Failed to process file ${item.path}:`, fileError.message);
          continue; // 個別のファイルの失敗を無視して続行
        }
      }
    }

    return {
      success: true,
      message: 'mainブランチの内容を正常にマージしました'
    };
  } catch (error) {
    console.error('Error merging main branch:', error);
    throw new Error('mainブランチのマージに失敗しました: ' + error.message);
  }
}

module.exports = { fetchAndMergeMainBranch }; 