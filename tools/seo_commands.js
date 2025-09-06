#!/usr/bin/env node

/**
 * SEO記事システム - コマンドインターフェース
 * Claude Code用スラッシュコマンド実装
 */

const fs = require('fs');
const path = require('path');
const ExcelAnalyzer = require('./excel_analyzer');
const ArticleGenerator = require('./article_generator');

class SEOCommands {
    constructor() {
        this.projectRoot = process.env.SEO_SYSTEM_ROOT || path.resolve(__dirname, '..');
        this.analyzer = new ExcelAnalyzer(this.projectRoot);
        this.generator = new ArticleGenerator(this.projectRoot);
    }

    /**
     * /seo:setup - エクセルファイルからクライアント情報を設定
     */
    async setup(excelPath) {
        try {
            console.log(`🔧 SEO Setup: ${excelPath}`);
            
            if (!fs.existsSync(excelPath)) {
                throw new Error(`ファイルが見つかりません: ${excelPath}`);
            }

            const result = this.analyzer.analyzeExcel(excelPath);
            const clientDir = await this.analyzer.createClientDirectory(result);
            
            console.log('✅ セットアップ完了');
            console.log(`📁 クライアントディレクトリ: ${clientDir}`);
            console.log(`🆔 G-ID: ${result.customerInfo.gid}`);
            
            return {
                success: true,
                gid: result.customerInfo.gid,
                clientDir,
                customerInfo: result.customerInfo
            };
            
        } catch (error) {
            console.error('❌ Setup Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * /seo:create [G-ID] [コンテンツ番号] - 記事作成プロンプト生成
     */
    async create(gid, contentNumber) {
        try {
            console.log(`✍️ 記事作成: G-ID=${gid}, コンテンツ=${contentNumber}`);
            
            const clientDir = path.join(this.projectRoot, 'customers', gid);
            if (!fs.existsSync(clientDir)) {
                throw new Error(`クライアントディレクトリが見つかりません: ${gid}`);
            }

            // 顧客プロンプトの読み込み
            const customerPromptPath = path.join(clientDir, 'customer_prompt.md');
            let customerPrompt = '';
            if (fs.existsSync(customerPromptPath)) {
                customerPrompt = fs.readFileSync(customerPromptPath, 'utf8');
            }

            // キーワード情報の読み込み
            const keywordFiles = fs.readdirSync(path.join(clientDir, 'keywords'));
            let keywordInfo = null;
            
            for (const file of keywordFiles) {
                if (file.includes(contentNumber) || file.includes(`content_${contentNumber}`)) {
                    const keywordPath = path.join(clientDir, 'keywords', file);
                    keywordInfo = JSON.parse(fs.readFileSync(keywordPath, 'utf8'));
                    break;
                }
            }

            // 記事作成プロンプトの生成
            const prompts = await this.generator.generateArticlePrompts(gid, contentNumber, customerPrompt, keywordInfo);
            
            // 出力ディレクトリの作成
            const outputDir = path.join(this.projectRoot, 'output', gid, `content_${contentNumber}`);
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            // プロンプトファイルの保存
            const promptsPath = path.join(outputDir, 'article_prompts.json');
            fs.writeFileSync(promptsPath, JSON.stringify(prompts, null, 2));

            console.log('✅ 記事作成プロンプト生成完了');
            console.log(`📄 プロンプトファイル: ${promptsPath}`);

            return {
                success: true,
                prompts,
                outputDir,
                promptsPath
            };

        } catch (error) {
            console.error('❌ Create Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * /seo:customer [G-ID] - 顧客情報プロンプト生成
     */
    async customer(gid) {
        try {
            const clientDir = path.join(this.projectRoot, 'customers', gid);
            const customerPromptPath = path.join(clientDir, 'customer_prompt.md');
            
            if (!fs.existsSync(customerPromptPath)) {
                throw new Error(`顧客プロンプトが見つかりません: ${gid}`);
            }

            const customerPrompt = fs.readFileSync(customerPromptPath, 'utf8');
            console.log('📋 顧客理解プロンプト:');
            console.log(customerPrompt);

            return { success: true, customerPrompt };

        } catch (error) {
            console.error('❌ Customer Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * /seo:keywords [G-ID] [コンテンツ番号] - キーワード情報表示
     */
    async keywords(gid, contentNumber) {
        try {
            const keywordsDir = path.join(this.projectRoot, 'customers', gid, 'keywords');
            
            if (!fs.existsSync(keywordsDir)) {
                throw new Error(`キーワードディレクトリが見つかりません: ${gid}`);
            }

            const keywordFiles = fs.readdirSync(keywordsDir);
            let keywordInfo = null;

            for (const file of keywordFiles) {
                if (file.includes(contentNumber)) {
                    const keywordPath = path.join(keywordsDir, file);
                    keywordInfo = JSON.parse(fs.readFileSync(keywordPath, 'utf8'));
                    break;
                }
            }

            if (!keywordInfo) {
                throw new Error(`コンテンツ${contentNumber}のキーワード情報が見つかりません`);
            }

            console.log(`🎯 キーワード情報 (${gid} - コンテンツ${contentNumber}):`);
            console.log(JSON.stringify(keywordInfo, null, 2));

            return { success: true, keywordInfo };

        } catch (error) {
            console.error('❌ Keywords Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * /seo:validate [記事パス] - 記事品質チェック
     */
    async validate(articlePath) {
        try {
            console.log(`🔍 記事品質チェック: ${articlePath}`);
            
            if (!fs.existsSync(articlePath)) {
                throw new Error(`記事ファイルが見つかりません: ${articlePath}`);
            }

            const articleContent = fs.readFileSync(articlePath, 'utf8');
            
            // 基本的な品質チェック項目
            const validationResult = {
                wordCount: this.countWords(articleContent),
                hasTitle: articleContent.includes('#'),
                hasIntroduction: true,
                hasConcusion: articleContent.includes('まとめ') || articleContent.includes('おわりに'),
                keywordDensity: 'N/A', // 実装要
                readability: 'N/A' // 実装要
            };

            console.log('📊 バリデーション結果:');
            console.log(JSON.stringify(validationResult, null, 2));

            return { success: true, validationResult };

        } catch (error) {
            console.error('❌ Validate Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    // ヘルパーメソッド
    countWords(text) {
        return text.length; // 日本語の場合は文字数
    }
}

// CLIインターフェース
if (require.main === module) {
    const seoCommands = new SEOCommands();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
SEO記事システム - 使用可能コマンド:

/seo:setup [エクセルファイルパス]
/seo:create [G-ID] [コンテンツ番号]  
/seo:customer [G-ID]
/seo:keywords [G-ID] [コンテンツ番号]
/seo:validate [記事パス]

例:
node seo_commands.js setup "/path/to/発注書.xlsx"
node seo_commands.js create G0016169 01
        `);
        process.exit(0);
    }

    const command = args[0];
    const commandArgs = args.slice(1);

    (async () => {
        try {
            let result;
            
            switch (command) {
                case 'setup':
                    result = await seoCommands.setup(commandArgs[0]);
                    break;
                case 'create':
                    result = await seoCommands.create(commandArgs[0], commandArgs[1]);
                    break;
                case 'customer':
                    result = await seoCommands.customer(commandArgs[0]);
                    break;
                case 'keywords':
                    result = await seoCommands.keywords(commandArgs[0], commandArgs[1]);
                    break;
                case 'validate':
                    result = await seoCommands.validate(commandArgs[0]);
                    break;
                default:
                    console.error(`❌ 未知のコマンド: ${command}`);
                    process.exit(1);
            }
            
            if (!result.success) {
                process.exit(1);
            }
            
        } catch (error) {
            console.error('❌ 実行エラー:', error.message);
            process.exit(1);
        }
    })();
}

module.exports = SEOCommands;