#!/usr/bin/env node

/**
 * Claude Code統合用SEOスラッシュコマンドハンドラー
 * /seo: コマンドプレフィックスでClaude Code内から直接実行
 */

const SEOCommands = require('./seo_commands');
const path = require('path');

class ClaudeCodeSEOIntegration {
    constructor() {
        this.seoCommands = new SEOCommands();
        this.registeredCommands = new Map();
        this.initializeCommands();
    }

    /**
     * スラッシュコマンド登録
     */
    initializeCommands() {
        const commands = {
            'setup': {
                description: 'エクセルファイルからクライアント環境初期化',
                usage: '/seo:setup [エクセルファイルパス]',
                handler: this.handleSetup.bind(this)
            },
            'create': {
                description: '記事作成プロンプト生成',
                usage: '/seo:create [G-ID] [コンテンツ番号]',
                handler: this.handleCreate.bind(this)
            },
            'validate': {
                description: '記事品質検証',
                usage: '/seo:validate [記事ファイルパス]',
                handler: this.handleValidate.bind(this)
            },
            'customer': {
                description: '顧客理解プロンプト表示',
                usage: '/seo:customer [G-ID]',
                handler: this.handleCustomer.bind(this)
            },
            'keywords': {
                description: 'キーワード情報表示',
                usage: '/seo:keywords [G-ID] [コンテンツ番号]',
                handler: this.handleKeywords.bind(this)
            },
            'rules': {
                description: '記事作成ルール一覧',
                usage: '/seo:rules',
                handler: this.handleRules.bind(this)
            },
            'checklist': {
                description: 'Find-A品質チェックリスト実行',
                usage: '/seo:checklist [記事ファイルパス]',
                handler: this.handleChecklist.bind(this)
            },
            'templates': {
                description: 'テンプレート一覧表示',
                usage: '/seo:templates',
                handler: this.handleTemplates.bind(this)
            },
            'help': {
                description: 'ヘルプ表示',
                usage: '/seo:help',
                handler: this.handleHelp.bind(this)
            }
        };

        for (const [command, config] of Object.entries(commands)) {
            this.registeredCommands.set(command, config);
        }
    }

    /**
     * Claude Codeプラグイン登録インターフェース
     */
    static register(claudeCode) {
        const integration = new ClaudeCodeSEOIntegration();
        
        // スラッシュコマンド登録
        claudeCode.registerSlashCommand('seo', (subCommand, args, context) => {
            return integration.handleCommand(subCommand, args, context);
        });
        
        console.log('🚀 SEOスラッシュコマンドが登録されました');
        return integration;
    }

    /**
     * メインコマンドハンドラー
     */
    async handleCommand(subCommand, args = [], context = {}) {
        try {
            // 入力検証
            if (!subCommand) {
                return await this.handleHelp();
            }

            const commandConfig = this.registeredCommands.get(subCommand);
            if (!commandConfig) {
                return {
                    success: false,
                    error: `❌ 未知のコマンド: ${subCommand}`,
                    suggestion: 'ヘルプを表示するには /seo:help を実行してください'
                };
            }

            // CCF統合ログ
            this.logCCFExecution(subCommand, args, context);

            // コマンド実行
            const result = await commandConfig.handler(args, context);
            
            // 実行結果のClaude Code整形
            return this.formatClaudeCodeResponse(result, subCommand);

        } catch (error) {
            console.error('❌ SEOコマンド実行エラー:', error.message);
            return {
                success: false,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    /**
     * /seo:setup ハンドラー
     */
    async handleSetup(args, context) {
        if (args.length < 1) {
            return {
                success: false,
                error: '❌ エクセルファイルパスが必要です',
                usage: '/seo:setup [エクセルファイルパス]'
            };
        }

        const excelPath = this.resolvePath(args[0]);
        const result = await this.seoCommands.setup(excelPath);
        
        if (result.success) {
            return {
                ...result,
                message: '✅ SEOシステム初期化完了',
                nextSteps: [
                    `記事を作成するには: /seo:create ${result.gid} 01`,
                    `顧客情報を確認するには: /seo:customer ${result.gid}`
                ]
            };
        }
        
        return result;
    }

    /**
     * /seo:create ハンドラー
     */
    async handleCreate(args, context) {
        if (args.length < 2) {
            return {
                success: false,
                error: '❌ G-IDとコンテンツ番号が必要です',
                usage: '/seo:create [G-ID] [コンテンツ番号]'
            };
        }

        const [gid, contentNumber] = args;
        const result = await this.seoCommands.create(gid, contentNumber);
        
        if (result.success) {
            return {
                ...result,
                message: `✅ 記事作成プロンプト生成完了 (${gid} - コンテンツ${contentNumber})`,
                promptSteps: this.extractPromptSteps(result.prompts),
                nextSteps: [
                    '各プロンプトを順番に実行して記事を作成',
                    `記事完成後: /seo:validate [記事パス]`
                ]
            };
        }
        
        return result;
    }

    /**
     * /seo:validate ハンドラー
     */
    async handleValidate(args, context) {
        if (args.length < 1) {
            return {
                success: false,
                error: '❌ 記事ファイルパスが必要です',
                usage: '/seo:validate [記事ファイルパス]'
            };
        }

        const articlePath = this.resolvePath(args[0]);
        const result = await this.seoCommands.validate(articlePath);
        
        if (result.success) {
            return {
                ...result,
                message: '📊 記事品質検証完了',
                qualityScore: this.calculateQualityScore(result.validationResult),
                recommendations: this.generateRecommendations(result.validationResult)
            };
        }
        
        return result;
    }

    /**
     * /seo:customer ハンドラー
     */
    async handleCustomer(args, context) {
        if (args.length < 1) {
            return {
                success: false,
                error: '❌ G-IDが必要です',
                usage: '/seo:customer [G-ID]'
            };
        }

        return await this.seoCommands.customer(args[0]);
    }

    /**
     * /seo:keywords ハンドラー
     */
    async handleKeywords(args, context) {
        if (args.length < 2) {
            return {
                success: false,
                error: '❌ G-IDとコンテンツ番号が必要です',
                usage: '/seo:keywords [G-ID] [コンテンツ番号]'
            };
        }

        return await this.seoCommands.keywords(args[0], args[1]);
    }

    /**
     * /seo:rules ハンドラー
     */
    async handleRules(args, context) {
        try {
            const rulesPath = path.join(this.seoCommands.projectRoot, 'config', 'rules');
            const rules = {
                basic: require(path.join(rulesPath, 'basic_rules.json')),
                quality: require(path.join(rulesPath, 'quality_rules.json')),
                checklist: require(path.join(rulesPath, 'checklist.json'))
            };

            return {
                success: true,
                message: '📋 SEO記事作成ルール',
                rules: rules,
                summary: {
                    basicRules: Object.keys(rules.basic).length,
                    qualityRules: Object.keys(rules.quality).length,
                    checklistItems: rules.checklist.items ? rules.checklist.items.length : 0
                }
            };

        } catch (error) {
            return {
                success: false,
                error: `ルールファイル読み込みエラー: ${error.message}`
            };
        }
    }

    /**
     * /seo:checklist ハンドラー
     */
    async handleChecklist(args, context) {
        if (args.length < 1) {
            return {
                success: false,
                error: '❌ 記事ファイルパスが必要です',
                usage: '/seo:checklist [記事ファイルパス]'
            };
        }

        // Find-Aチェックリスト実装（今後拡張）
        const articlePath = this.resolvePath(args[0]);
        return {
            success: true,
            message: '📋 Find-Aチェックリスト実行',
            note: '46項目チェックリストは実装予定です',
            articlePath: articlePath
        };
    }

    /**
     * /seo:templates ハンドラー
     */
    async handleTemplates(args, context) {
        try {
            const templatesPath = path.join(this.seoCommands.projectRoot, 'config', 'templates');
            const fs = require('fs');
            
            if (!fs.existsSync(templatesPath)) {
                return {
                    success: false,
                    error: 'テンプレートディレクトリが見つかりません'
                };
            }

            const templates = fs.readdirSync(templatesPath);
            
            return {
                success: true,
                message: '📄 利用可能テンプレート',
                templates: templates.map(template => ({
                    name: template,
                    path: path.join(templatesPath, template),
                    type: path.extname(template)
                }))
            };

        } catch (error) {
            return {
                success: false,
                error: `テンプレート読み込みエラー: ${error.message}`
            };
        }
    }

    /**
     * /seo:help ハンドラー
     */
    async handleHelp(args, context) {
        const commandList = Array.from(this.registeredCommands.entries())
            .map(([command, config]) => `${config.usage} - ${config.description}`)
            .join('\n');

        return {
            success: true,
            message: '📖 SEOスラッシュコマンドヘルプ',
            commands: Array.from(this.registeredCommands.entries()),
            usage: `
🚀 SEO記事システム - 利用可能コマンド:

${commandList}

📝 基本的な使用フロー:
1. /seo:setup [エクセルファイル] - システム初期化
2. /seo:create [G-ID] [番号] - 記事作成開始  
3. /seo:validate [記事パス] - 品質チェック
4. /seo:checklist [記事パス] - 最終検証

💡 ヒント:
- パスは絶対パスまたは相対パスで指定可能
- エラー時は詳細なメッセージを確認してください
- 不明な点があれば /seo:help を再実行
            `
        };
    }

    // ユーティリティメソッド群

    /**
     * パス解決
     */
    resolvePath(inputPath) {
        if (path.isAbsolute(inputPath)) {
            return inputPath;
        }
        return path.resolve(process.cwd(), inputPath);
    }

    /**
     * CCF実行ログ
     */
    logCCFExecution(subCommand, args, context) {
        if (process.env.CCF_DEBUG) {
            console.log(`[CCF-SEO] Command: ${subCommand}, Args: ${JSON.stringify(args)}`);
        }
    }

    /**
     * Claude Code用レスポンス整形
     */
    formatClaudeCodeResponse(result, command) {
        return {
            ...result,
            claudeCode: {
                command: `/seo:${command}`,
                timestamp: new Date().toISOString(),
                version: '2.0.0'
            }
        };
    }

    /**
     * プロンプトステップ抽出
     */
    extractPromptSteps(prompts) {
        if (!prompts || !prompts.steps) return [];
        return prompts.steps.map((step, index) => ({
            step: index + 1,
            title: step.title || `ステップ${index + 1}`,
            description: step.description
        }));
    }

    /**
     * 品質スコア計算
     */
    calculateQualityScore(validationResult) {
        let score = 0;
        let maxScore = 0;
        
        // 基本的なスコアリング（今後拡張）
        if (validationResult.wordCount >= 3000) {
            score += 25;
        }
        maxScore += 25;
        
        if (validationResult.hasTitle) {
            score += 25;
        }
        maxScore += 25;
        
        if (validationResult.hasConcusion) {
            score += 25;
        }
        maxScore += 25;
        
        // その他項目のスコアリング
        maxScore += 25;
        score += 15; // 暫定スコア
        
        return {
            score: score,
            maxScore: maxScore,
            percentage: Math.round((score / maxScore) * 100)
        };
    }

    /**
     * 改善提案生成
     */
    generateRecommendations(validationResult) {
        const recommendations = [];
        
        if (validationResult.wordCount < 3000) {
            recommendations.push('📝 文字数を3,000文字以上に増やしてください');
        }
        
        if (!validationResult.hasTitle) {
            recommendations.push('📑 適切な見出し構造を追加してください');
        }
        
        if (!validationResult.hasConcusion) {
            recommendations.push('📄 まとめセクションを追加してください');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('✅ 基本品質要件を満たしています');
        }
        
        return recommendations;
    }
}

// CLIインターフェース
if (require.main === module) {
    const integration = new ClaudeCodeSEOIntegration();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        integration.handleHelp().then(result => {
            console.log(result.usage);
        });
        process.exit(0);
    }

    const subCommand = args[0];
    const commandArgs = args.slice(1);

    integration.handleCommand(subCommand, commandArgs, {})
        .then(result => {
            if (result.success) {
                console.log(result.message || '✅ 実行完了');
                if (result.nextSteps) {
                    console.log('\n📋 次のステップ:');
                    result.nextSteps.forEach(step => console.log(`  - ${step}`));
                }
            } else {
                console.error(result.error || '❌ 実行失敗');
                if (result.usage) {
                    console.log(`使用法: ${result.usage}`);
                }
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ 予期しないエラー:', error.message);
            process.exit(1);
        });
}

module.exports = ClaudeCodeSEOIntegration;