const ArticleGenerator = require('./article_generator');
const fs = require('fs');
const path = require('path');

/**
 * SEO記事修正ツール
 * 実際の記事作成プロセスから学んだ修正手法を適用
 */
class ArticleModifier extends ArticleGenerator {
    constructor(projectRoot = '/home/general/seo-article-system') {
        super(projectRoot);
    }

    /**
     * 記事ファイルから内容を読み込み
     * @param {string} articlePath - 記事ファイルのパス
     */
    loadArticleContent(articlePath) {
        if (!fs.existsSync(articlePath)) {
            throw new Error(`記事ファイルが見つかりません: ${articlePath}`);
        }
        return fs.readFileSync(articlePath, 'utf8');
    }

    /**
     * 記事修正ワークフロー実行
     * @param {string} gid - G-ID
     * @param {string} contentNumber - コンテンツ番号
     * @param {string} articlePath - 修正対象記事のパス
     * @param {string} modificationType - 修正タイプ
     */
    async modifyArticle(gid, contentNumber, articlePath, modificationType = 'ai_expression_elimination') {
        try {
            console.log(`🔧 記事修正ワークフロー開始: ${gid} - コンテンツ${contentNumber}`);
            
            // 記事内容の読み込み
            const articleContent = this.loadArticleContent(articlePath);
            console.log(`📖 記事内容読み込み完了: ${articlePath}`);
            
            // 修正プロンプトの生成
            const outputPath = await this.generateModificationPrompts(
                gid, contentNumber, articleContent, modificationType
            );
            
            // 修正ガイドの生成
            const modificationGuide = this.generateModificationGuide(
                gid, contentNumber, articlePath, modificationType
            );
            
            await this.savePrompt(
                path.join(outputPath, '..'), 
                'modification_guide.md', 
                modificationGuide
            );
            
            console.log('🎯 記事修正ワークフロー完了!');
            console.log(`📁 修正プロンプト: ${outputPath}`);
            console.log('\\n次のステップ:');
            console.log('1. 生成された修正プロンプトを確認');
            console.log('2. 修正プロンプトを実行して記事を改善');
            console.log('3. 品質検証プロンプトで最終チェック');
            
            return outputPath;
            
        } catch (error) {
            console.error('❌ 記事修正ワークフローエラー:', error.message);
            throw error;
        }
    }

    /**
     * 修正ガイドの生成
     */
    generateModificationGuide(gid, contentNumber, articlePath, modificationType) {
        const modificationTypes = {
            ai_expression_elimination: 'AI表現排除・自然文化',
            content_strategy_adjustment: 'コンテンツ戦略調整',
            service_specific_positioning: 'サービス特化ポジショニング',
            quality_validation: '品質検証・最終チェック',
            all: '包括的記事修正'
        };

        const selectedType = modificationTypes[modificationType] || modificationType;

        return `# 記事修正ガイド - ${selectedType}

## 📋 修正対象記事
- **G-ID**: ${gid}
- **コンテンツ**: ${contentNumber}
- **元記事**: ${articlePath}
- **修正タイプ**: ${selectedType}

## 🎯 修正の目的

### AI表現排除・自然文化
- AIっぽい定型表現の完全排除
- 自然で読みやすい人間らしい文章への変換
- 文末表現の多様化と語彙の豊富化

### コンテンツ戦略調整
- 一般的なツールの複雑さを示してからサービスの簡易性を対比
- 過度な売り込みを避けた事実ベースの差別化
- 読者の課題解決を優先した構成

### サービス特化ポジショニング
- サービス固有の価値（AI×プロ人材融合）を強調
- 具体的実績数値の効果的配置
- タイトル・メタの最適化検討

### 品質検証・最終チェック
- 46項目の包括的品質チェック
- 表現・内容・技術面での最終検証
- SEO最適化と読みやすさの確認

## 📝 修正プロセス

### ステップ1: 該当修正プロンプトの実行
修正タイプに応じたプロンプトファイルを実行：
- \`ai_expression_elimination.md\`: AI表現排除
- \`content_strategy_adjustment.md\`: 戦略調整
- \`service_specific_positioning.md\`: サービス特化
- \`quality_validation.md\`: 品質検証

### ステップ2: セクション別修正（大幅修正の場合）
1. 導入文の修正
2. 各セクション（1-4）の個別修正
3. まとめセクションの修正

### ステップ3: 最終検証
- 修正後の記事に品質検証プロンプトを適用
- 46項目チェックリストで総合確認
- 必要に応じて追加修正

## 🔍 重点チェックポイント

### 表現面
- [ ] 波線（～）の完全排除
- [ ] AIっぽい定型表現の排除
- [ ] 文末表現の多様化
- [ ] 自然で親しみやすい表現

### 内容面
- [ ] 他社誘導表現の排除
- [ ] サービス特徴の自然な訴求
- [ ] 読者課題への適切対応
- [ ] 論理的で整合性のある構成

### 技術面
- [ ] SEOキーワードの適切配置
- [ ] 文字数要件の達成
- [ ] 見出し構造の最適化
- [ ] メタ情報の最適化

## 📊 修正効果の測定

### 改善指標
- 自然な表現への変換率
- AI感の排除度合い
- 読みやすさの向上
- サービス訴求の効果性

### 品質基準
- 人間が書いたような自然な文章
- 読者の課題に寄り添った内容
- 適切なサービス誘導
- SEO要件の満足

---

**修正日**: ${new Date().toISOString().split('T')[0]}
**対象**: ${gid} コンテンツ${contentNumber}
**修正タイプ**: ${selectedType}`;
    }
}

// CLIインターフェース
if (require.main === module) {
    const modifier = new ArticleModifier();
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
        console.log('使用方法: node article_modifier.js [G-ID] [コンテンツ番号] [記事ファイルパス] [修正タイプ（省略可）]');
        console.log('');
        console.log('修正タイプ:');
        console.log('  ai_expression_elimination  - AI表現排除・自然文化（デフォルト）');
        console.log('  content_strategy_adjustment - コンテンツ戦略調整');
        console.log('  service_specific_positioning - サービス特化ポジショニング');
        console.log('  quality_validation - 品質検証・最終チェック');
        console.log('  all - 全修正プロンプト生成');
        console.log('');
        console.log('例: node article_modifier.js G1234567 01 /path/to/article.md ai_expression_elimination');
        process.exit(1);
    }

    const [gid, contentNumber, articlePath, modificationType = 'ai_expression_elimination'] = args;
    
    modifier.modifyArticle(gid, contentNumber, articlePath, modificationType)
        .then(outputPath => {
            console.log('🎉 記事修正プロンプト生成完了!');
            console.log(`📁 出力ディレクトリ: ${outputPath}`);
        })
        .catch(error => {
            console.error('❌ エラー:', error.message);
            process.exit(1);
        });
}

module.exports = ArticleModifier;