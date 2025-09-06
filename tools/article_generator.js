const fs = require('fs');
const path = require('path');

/**
 * SEO記事生成エンジン
 * 11ステップワークフローに対応
 */
class ArticleGenerator {
    constructor(projectRoot = '/home/general/seo-article-system') {
        this.projectRoot = projectRoot;
        this.customersDir = path.join(projectRoot, 'customers');
        this.outputDir = path.join(projectRoot, 'output');
        this.templates = this.loadTemplates();
        this.modificationTemplates = this.loadModificationTemplates();
        this.qualityRules = this.loadQualityRules();
    }

    loadTemplates() {
        try {
            const templatesPath = path.join(this.projectRoot, 'config/templates/section_prompts.json');
            return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        } catch (error) {
            console.error('テンプレートの読み込みに失敗:', error.message);
            return {};
        }
    }

    loadModificationTemplates() {
        try {
            const templatesPath = path.join(this.projectRoot, 'config/templates/article_modification_prompts.json');
            return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        } catch (error) {
            console.error('修正テンプレートの読み込みに失敗:', error.message);
            return {};
        }
    }

    loadQualityRules() {
        try {
            const rulesPath = path.join(this.projectRoot, 'config/rules/article_quality_rules.md');
            return fs.readFileSync(rulesPath, 'utf8');
        } catch (error) {
            console.error('品質ルールの読み込みに失敗:', error.message);
            return '';
        }
    }

    /**
     * 記事作成プロンプト群の生成
     * @param {string} gid - G-ID
     * @param {string} contentNumber - コンテンツ番号
     * @param {string} customerPrompt - 顧客理解プロンプト
     * @param {Object} keywordInfo - キーワード情報
     */
    async generateArticlePrompts(gid, contentNumber, customerPrompt, keywordInfo) {
        try {
            console.log(`🎯 記事作成プロンプト群生成: ${gid} - コンテンツ${contentNumber}`);

            const prompts = {
                metadata: {
                    gid,
                    contentNumber,
                    timestamp: new Date().toISOString(),
                    description: 'SEO記事作成用プロンプト集合'
                },
                customerPrompt,
                keywordInfo,
                steps: {}
            };

            // ステップ1: 参考URL収集
            prompts.steps.step1_reference_collection = this.generateReferenceCollectionPrompt(keywordInfo);

            // ステップ2: 顧客理解プロンプト
            prompts.steps.step2_customer_understanding = customerPrompt;

            // ステップ3-7: セクション別記事作成
            if (keywordInfo && keywordInfo.needs_keywords) {
                keywordInfo.needs_keywords.forEach((needsKw, index) => {
                    prompts.steps[`step${index + 3}_section_${index + 1}`] = 
                        this.generateSectionPrompt(needsKw, customerPrompt);
                });
            }

            // ステップ8: まとめセクション  
            prompts.steps.step8_summary_section = this.generateSummaryPrompt(customerPrompt);

            // ステップ9: 導入文作成
            prompts.steps.step9_introduction = this.generateIntroductionPrompt(keywordInfo);

            // ステップ10: タイトル生成
            prompts.steps.step10_title_generation = this.generateTitlePrompt(keywordInfo);

            // ステップ11: メタディスクリプション
            prompts.steps.step11_meta_description = this.generateMetaDescriptionPrompt(keywordInfo);

            console.log(`✅ プロンプト群生成完了: ${Object.keys(prompts.steps).length}ステップ`);
            return prompts;

        } catch (error) {
            console.error('❌ プロンプト群生成エラー:', error.message);
            throw error;
        }
    }

    /**
     * 参考URL収集プロンプト生成
     */
    generateReferenceCollectionPrompt(keywordInfo) {
        const targetKeywords = keywordInfo?.target_keywords || '';
        const needsKeywords = keywordInfo?.needs_keywords?.map(nk => nk.keyword).join(', ') || '';

        return `# ステップ1: 参考URL収集

**目標**: ターゲットキーワードに関連する参考記事を3-6個収集

## 検索キーワード
- **メインキーワード**: ${targetKeywords}
- **関連キーワード**: ${needsKeywords}

## 収集指示
1. 上記キーワードで検索を実行
2. 競合サイトの記事構成・内容を分析
3. 参考になる記事URLとその要点を記録
4. 避けるべき記事パターンも記録

## 期待する収集結果
- 参考記事3-6個のURL
- 各記事の要点・特徴
- 活用できる構成アイデア
- 差別化すべきポイント`;
    }

    /**
     * セクションプロンプト生成
     */
    generateSectionPrompt(needsKw, customerPrompt) {
        const headline = needsKw.headline || needsKw.keyword;
        const keyword = needsKw.keyword || '';

        return `# セクション作成: ${headline}

**目標**: ${keyword}について800-900文字の詳細セクションを作成

## 顧客情報
${customerPrompt}

## セクション要件
- **見出し**: ${headline}
- **キーワード**: ${keyword}
- **文字数**: 800-900文字
- **トーン**: 実用的で読者目線

## 執筆ガイドライン
1. **導入**: 読者の課題や疑問から開始
2. **具体例**: 実用的な例・手順を提供
3. **ポイント**: 要点を3-5個に整理
4. **サービス誘導**: 自然な形で自社サービスに言及

## 注意事項
- AI感のある定型表現は避ける
- 波線（〜）は使用禁止
- 競合他社名は記載禁止
- 読者にとって実用的な内容に集中`;
    }

    /**
     * 記事作成メイン処理
     * @param {string} gid - G-ID (例: G1234567)
     * @param {string} contentNumber - コンテンツ番号 (例: "01")
     */
    async createArticle(gid, contentNumber) {
        try {
            console.log(`🚀 記事作成開始: ${gid} - コンテンツ${contentNumber}`);

            // ステップ1-4: データ準備
            const clientData = await this.loadClientData(gid);
            const contentData = await this.loadContentData(gid, contentNumber);
            
            // 出力ディレクトリの準備
            const outputPath = await this.prepareOutputDirectory(gid, contentNumber);

            // ステップ5: 参考URL収集プロンプト生成
            const referencePrompt = this.generateReferencePrompt(contentData);
            await this.savePrompt(outputPath, 'reference_collection.md', referencePrompt);
            console.log('📚 ステップ5: 参考URL収集プロンプト生成完了');

            // ステップ6-8: セクション作成プロンプト生成  
            const sectionPrompts = this.generateSectionPrompts(contentData, clientData);
            for (let i = 0; i < sectionPrompts.length; i++) {
                await this.savePrompt(outputPath, `section_${i + 1}.md`, sectionPrompts[i]);
            }
            console.log('✍️ ステップ6-8: セクション作成プロンプト生成完了');

            // ステップ9: まとめセクションプロンプト生成
            const summaryPrompt = this.generateSummaryPrompt(clientData);
            await this.savePrompt(outputPath, 'summary_section.md', summaryPrompt);
            console.log('📝 ステップ9: まとめセクションプロンプト生成完了');

            // ステップ10: 導入文プロンプト生成
            const introPrompt = this.generateIntroductionPrompt();
            await this.savePrompt(outputPath, 'introduction.md', introPrompt);
            console.log('🎯 ステップ10: 導入文プロンプト生成完了');

            // ステップ11: タイトル・メタディスクリプションプロンプト生成
            const titlePrompt = this.generateTitlePrompt();
            const metaPrompt = this.generateMetaDescriptionPrompt();
            await this.savePrompt(outputPath, 'title_generation.md', titlePrompt);
            await this.savePrompt(outputPath, 'meta_description.md', metaPrompt);
            console.log('🏆 ステップ11: タイトル・メタ情報プロンプト生成完了');

            // 記事作成ガイドの生成
            const articleGuide = this.generateArticleCreationGuide(gid, contentNumber, clientData, contentData);
            await this.savePrompt(outputPath, 'article_creation_guide.md', articleGuide);

            console.log(`✅ 記事作成プロンプト群生成完了: ${outputPath}`);
            return outputPath;

        } catch (error) {
            console.error('❌ 記事作成エラー:', error.message);
            throw error;
        }
    }

    /**
     * クライアントデータの読み込み
     */
    async loadClientData(gid) {
        const clientDir = path.join(this.customersDir, gid);
        const analysisPath = path.join(clientDir, 'analysis_result.json');
        
        if (!fs.existsSync(analysisPath)) {
            throw new Error(`クライアントデータが見つかりません: ${gid}`);
        }

        return JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
    }

    /**
     * コンテンツデータの読み込み
     */
    async loadContentData(gid, contentNumber) {
        const clientDir = path.join(this.customersDir, gid);
        const keywordsDir = path.join(clientDir, 'keywords');
        
        // コンテンツ番号に対応するキーワードファイルを検索
        const files = fs.readdirSync(keywordsDir);
        const contentFile = files.find(file => file.includes(contentNumber) || file.includes(`コンテンツ${contentNumber}`));
        
        if (!contentFile) {
            throw new Error(`コンテンツ${contentNumber}のデータが見つかりません`);
        }

        const contentPath = path.join(keywordsDir, contentFile);
        return JSON.parse(fs.readFileSync(contentPath, 'utf8'));
    }

    /**
     * 出力ディレクトリの準備
     */
    async prepareOutputDirectory(gid, contentNumber) {
        const outputPath = path.join(this.outputDir, gid, `content_${contentNumber}`);
        
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        return outputPath;
    }

    /**
     * 参考URL収集プロンプトの生成
     */
    generateReferencePrompt(contentData) {
        const template = this.templates.reference_url_collection?.template || '';
        
        const targetKeywords = contentData.target_keywords || '';
        const needsKeywords = contentData.needs_keywords?.map(nk => 
            `${nk.type}: ${nk.keyword}`
        ).join('\\n') || '';

        return template
            .replace('{target_keywords}', `ターゲットKW: ${targetKeywords}`)
            .replace('{needs_keywords}', needsKeywords);
    }

    /**
     * セクション作成プロンプトの生成
     */
    generateSectionPrompts(contentData, clientData) {
        const template = this.templates.section_creation?.template || '';
        const targetAudience = clientData.customerInfo?.target_business || '';

        const prompts = [];
        
        if (contentData.needs_keywords) {
            contentData.needs_keywords.forEach((needsKw, index) => {
                const sectionPrompt = template
                    .replace('{section_title}', needsKw.headline)
                    .replace('{target_audience}', targetAudience);
                
                prompts.push(`# セクション${index + 1}: ${needsKw.type}\\n\\n${sectionPrompt}`);
            });
        }

        return prompts;
    }

    /**
     * まとめセクションプロンプトの生成
     */
    generateSummaryPrompt(clientData) {
        const template = this.templates.summary_section?.template || '';
        const companyName = clientData.customerInfo?.first_person || 'サービス名';

        return template.replace('{company_name}', companyName);
    }

    /**
     * 導入文プロンプトの生成
     */
    generateIntroductionPrompt() {
        return this.templates.introduction?.template || '';
    }

    /**
     * タイトル生成プロンプトの生成
     */
    generateTitlePrompt() {
        return this.templates.title_generation?.template || '';
    }

    /**
     * メタディスクリプションプロンプトの生成
     */
    generateMetaDescriptionPrompt() {
        return this.templates.meta_description?.template || '';
    }

    /**
     * 記事作成ガイドの生成
     */
    generateArticleCreationGuide(gid, contentNumber, clientData, contentData) {
        const customerInfo = clientData.customerInfo;
        const companyName = customerInfo?.company_name || '企業名未設定';
        const serviceName = customerInfo?.first_person || 'サービス名未設定';

        return `# ${companyName} - コンテンツ${contentNumber} 記事作成ガイド

## 📋 記事概要
- **G-ID**: ${gid}
- **企業名**: ${companyName}  
- **サービス**: ${serviceName}
- **コンテンツ番号**: ${contentNumber}

## 🎯 キーワード情報
### ターゲットキーワード（必須使用）
${contentData.target_keywords}

### ニーズキーワード
${contentData.needs_keywords?.map(nk => `- ${nk.type}: ${nk.keyword} (見出し案: ${nk.headline})`).join('\\n') || ''}

## 📝 記事作成手順

### ステップ1: 参考URL収集
\`reference_collection.md\` のプロンプトを実行して、参考記事を3-6個収集

### ステップ2-4: セクション作成  
各セクションプロンプトを順次実行:
${contentData.needs_keywords?.map((nk, i) => `- \`section_${i + 1}.md\`: ${nk.headline}`).join('\\n') || ''}

### ステップ5: まとめセクション
\`summary_section.md\` のプロンプトでまとめを作成

### ステップ6: 導入文
\`introduction.md\` のプロンプトで導入文を作成

### ステップ7-8: タイトル・メタ情報
- \`title_generation.md\`: 5パターンのタイトル生成
- \`meta_description.md\`: メタディスクリプション作成

## 🎨 品質基準

### 記事仕様
- **本文**: 3,000文字以上（タイトル・メタ除く）
- **タイトル**: 35文字以内 + 一人称定型
- **メタディスクリプション**: 90-120文字
- **セクション**: 各800-900文字

### 品質要件
- AI感完全排除（自然な人間らしい文章）
- SEO最適化（キーワード適切配置）
- ${serviceName}への自然な誘導
- 競合他社への誘導排除

## 📋 最終チェック項目

### 表現チェック
- [ ] AIっぽい定型表現の排除
- [ ] 文末表現の多様化
- [ ] 波線（～）の使用禁止
- [ ] ですます調の統一

### 内容チェック  
- [ ] ターゲットキーワード全使用
- [ ] 具体的なサービス名称排除
- [ ] 企業情報の自然な組み込み
- [ ] 読者目線でのわかりやすさ

## 🔧 追加リソース

### 顧客理解プロンプト
\`../customer_prompt.md\` を参照して企業・サービス理解を深める

### 品質ルール
\`../../config/rules/article_quality_rules.md\` で詳細な品質基準を確認

---

**作成日**: ${new Date().toISOString().split('T')[0]}  
**G-ID**: ${gid}  
**コンテンツ**: ${contentNumber}`;
    }

    /**
     * 記事修正プロンプト生成
     * @param {string} gid - G-ID
     * @param {string} contentNumber - コンテンツ番号
     * @param {string} articleContent - 修正対象の記事内容
     * @param {string} modificationType - 修正タイプ（ai_expression_elimination, content_strategy_adjustment, etc.）
     */
    async generateModificationPrompts(gid, contentNumber, articleContent, modificationType = 'ai_expression_elimination') {
        try {
            console.log(`🔧 記事修正プロンプト生成開始: ${gid} - コンテンツ${contentNumber}`);

            // クライアントデータの読み込み
            const clientData = await this.loadClientData(gid);
            const contentData = await this.loadContentData(gid, contentNumber);
            
            // 出力ディレクトリの準備
            const outputPath = path.join(this.outputDir, gid, `content_${contentNumber}`, 'modification');
            if (!fs.existsSync(outputPath)) {
                fs.mkdirSync(outputPath, { recursive: true });
            }

            const serviceName = clientData.customerInfo?.first_person || 'サービス名';
            
            // 各種修正プロンプトの生成
            const modificationPrompts = {
                ai_expression_elimination: this.generateAIExpressionEliminationPrompt(
                    articleContent, serviceName, '800-900'
                ),
                content_strategy_adjustment: this.generateContentStrategyPrompt(
                    articleContent, serviceName
                ),
                service_specific_positioning: this.generateServicePositioningPrompt(
                    articleContent, serviceName
                ),
                quality_validation: this.generateQualityValidationPrompt(
                    articleContent
                )
            };

            // 指定された修正プロンプトまたは全部を保存
            if (modificationType === 'all') {
                for (const [type, prompt] of Object.entries(modificationPrompts)) {
                    await this.savePrompt(outputPath, `${type}.md`, prompt);
                    console.log(`✅ ${type} プロンプト生成完了`);
                }
            } else {
                const prompt = modificationPrompts[modificationType];
                if (prompt) {
                    await this.savePrompt(outputPath, `${modificationType}.md`, prompt);
                    console.log(`✅ ${modificationType} プロンプト生成完了`);
                } else {
                    throw new Error(`未対応の修正タイプ: ${modificationType}`);
                }
            }

            console.log(`🎯 記事修正プロンプト生成完了: ${outputPath}`);
            return outputPath;

        } catch (error) {
            console.error('❌ 記事修正プロンプト生成エラー:', error.message);
            throw error;
        }
    }

    /**
     * AI表現排除プロンプトの生成
     */
    generateAIExpressionEliminationPrompt(articleContent, serviceName, wordCount) {
        const template = this.modificationTemplates.ai_expression_elimination?.template || '';
        return template
            .replace('{article_content}', articleContent)
            .replace('{service_name}', serviceName)
            .replace('{word_count}', wordCount);
    }

    /**
     * コンテンツ戦略調整プロンプトの生成
     */
    generateContentStrategyPrompt(articleContent, serviceName) {
        const template = this.modificationTemplates.content_strategy_adjustment?.template || '';
        return template
            .replace('{article_content}', articleContent)
            .replace('{service_name}', serviceName);
    }

    /**
     * サービス特化ポジショニングプロンプトの生成
     */
    generateServicePositioningPrompt(articleContent, serviceName) {
        const template = this.modificationTemplates.service_specific_positioning?.template || '';
        return template
            .replace('{article_content}', articleContent)
            .replace('{service_name}', serviceName);
    }

    /**
     * 品質検証プロンプトの生成
     */
    generateQualityValidationPrompt(articleContent) {
        const template = this.modificationTemplates.quality_validation?.template || '';
        return template.replace('{article_content}', articleContent);
    }

    /**
     * プロンプトファイルの保存
     */
    async savePrompt(outputPath, filename, content) {
        const filePath = path.join(outputPath, filename);
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

// CLIインターフェース
if (require.main === module) {
    const generator = new ArticleGenerator();
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
        console.log('使用方法: node article_generator.js [G-ID] [コンテンツ番号]');
        console.log('例: node article_generator.js G1234567 01');
        process.exit(1);
    }

    const [gid, contentNumber] = args;
    
    generator.createArticle(gid, contentNumber)
        .then(outputPath => {
            console.log('🎉 記事作成プロンプト生成完了!');
            console.log(`📁 出力ディレクトリ: ${outputPath}`);
            console.log('\\n次のステップ:');
            console.log('1. reference_collection.md のプロンプトを実行');
            console.log('2. 各section_*.md を順次実行');
            console.log('3. その他のプロンプトで記事を完成');
        })
        .catch(error => {
            console.error('❌ エラー:', error.message);
            process.exit(1);
        });
}

module.exports = ArticleGenerator;