# SEOスラッシュコマンドシステム API仕様書

**バージョン**: v2.0.0  
**作成日**: 2025-09-06  
**対象**: 開発者・システム統合担当者

## 📋 概要

SEOスラッシュコマンドシステムのAPIインターフェース仕様を定義します。Claude Code統合、外部システム連携、カスタマイズ実装の参考資料として活用してください。

## 🔌 Claude Code統合API

### スラッシュコマンド登録
```javascript
// Claude Code Plugin Interface
class SEOSlashCommands {
    static register(claudeCode) {
        const integration = new ClaudeCodeSEOIntegration();
        claudeCode.registerSlashCommand('seo', integration.handleCommand.bind(integration));
        return integration;
    }
}
```

### コマンドハンドラー インターフェース
```javascript
async handleCommand(subCommand, args = [], context = {})
```

**パラメータ**:
- `subCommand` (string): 実行するサブコマンド
- `args` (Array<string>): コマンド引数
- `context` (Object): 実行コンテキスト

**戻り値**:
```typescript
interface CommandResult {
    success: boolean;
    message?: string;
    error?: string;
    data?: any;
    claudeCode?: {
        command: string;
        timestamp: string;
        version: string;
    };
}
```

## 📝 コマンドAPI詳細

### `/seo:setup`

**目的**: エクセルファイルからクライアント環境初期化

**API署名**:
```javascript
async handleSetup(args, context)
```

**パラメータ**:
- `args[0]` (string): エクセルファイルの絶対パス

**戻り値**:
```typescript
interface SetupResult extends CommandResult {
    gid?: string;
    clientDir?: string;
    customerInfo?: {
        company: string;
        industry: string;
        website: string;
    };
    nextSteps?: string[];
}
```

**実行例**:
```bash
/seo:setup "/home/general/G0016374_jinius株式会社様_発注書.xlsx"
```

**成功レスポンス**:
```json
{
    "success": true,
    "message": "✅ SEOシステム初期化完了",
    "gid": "G0016374",
    "clientDir": "/home/general/seo-article-system/customers/G0016374",
    "customerInfo": {
        "company": "jinius株式会社",
        "industry": "人材・採用",
        "website": "https://example.com"
    },
    "nextSteps": [
        "記事を作成するには: /seo:create G0016374 01",
        "顧客情報を確認するには: /seo:customer G0016374"
    ]
}
```

### `/seo:create`

**目的**: 記事作成プロンプト生成

**API署名**:
```javascript
async handleCreate(args, context)
```

**パラメータ**:
- `args[0]` (string): G-ID
- `args[1]` (string): コンテンツ番号

**戻り値**:
```typescript
interface CreateResult extends CommandResult {
    prompts?: {
        steps: Array<{
            step: number;
            title: string;
            description: string;
            prompt: string;
        }>;
    };
    outputDir?: string;
    promptsPath?: string;
    promptSteps?: Array<{
        step: number;
        title: string;
        description: string;
    }>;
}
```

### `/seo:validate`

**目的**: 記事品質検証

**API署名**:
```javascript
async handleValidate(args, context)
```

**パラメータ**:
- `args[0]` (string): 記事ファイルの絶対パス

**戻り値**:
```typescript
interface ValidateResult extends CommandResult {
    validationResult?: {
        wordCount: number;
        hasTitle: boolean;
        hasIntroduction: boolean;
        hasConclusion: boolean;
        keywordDensity: string | number;
        readability: string | number;
    };
    qualityScore?: {
        score: number;
        maxScore: number;
        percentage: number;
    };
    recommendations?: string[];
}
```

### `/seo:customer`

**目的**: 顧客理解プロンプト表示

**API署名**:
```javascript
async handleCustomer(args, context)
```

**パラメータ**:
- `args[0]` (string): G-ID

**戻り値**:
```typescript
interface CustomerResult extends CommandResult {
    customerPrompt?: string;
}
```

### `/seo:keywords`

**目的**: キーワード情報表示

**API署名**:
```javascript
async handleKeywords(args, context)
```

**パラメータ**:
- `args[0]` (string): G-ID
- `args[1]` (string): コンテンツ番号

**戻り値**:
```typescript
interface KeywordsResult extends CommandResult {
    keywordInfo?: {
        mainKeyword: string;
        subKeywords: string[];
        searchIntent: string;
        targetAudience: string;
        contentStructure: {
            title: string;
            sections: Array<{
                heading: string;
                keywords: string[];
                wordCount: number;
            }>;
        };
    };
}
```

### `/seo:rules`

**目的**: 記事作成ルール一覧表示

**API署名**:
```javascript
async handleRules(args, context)
```

**戻り値**:
```typescript
interface RulesResult extends CommandResult {
    rules?: {
        basic: Object;
        quality: Object;
        checklist: Object;
    };
    summary?: {
        basicRules: number;
        qualityRules: number;
        checklistItems: number;
    };
}
```

### `/seo:checklist`

**目的**: Find-A品質チェックリスト実行

**API署名**:
```javascript
async handleChecklist(args, context)
```

**パラメータ**:
- `args[0]` (string): 記事ファイルの絶対パス

**戻り値**:
```typescript
interface ChecklistResult extends CommandResult {
    checklistResult?: {
        totalItems: number;
        passedItems: number;
        failedItems: number;
        warningItems: number;
        details: Array<{
            item: string;
            status: 'pass' | 'fail' | 'warning';
            description: string;
            recommendation?: string;
        }>;
    };
    articlePath?: string;
}
```

### `/seo:templates`

**目的**: テンプレート一覧表示

**API署名**:
```javascript
async handleTemplates(args, context)
```

**戻り値**:
```typescript
interface TemplatesResult extends CommandResult {
    templates?: Array<{
        name: string;
        path: string;
        type: string;
        description?: string;
    }>;
}
```

### `/seo:help`

**目的**: ヘルプ情報表示

**API署名**:
```javascript
async handleHelp(args, context)
```

**戻り値**:
```typescript
interface HelpResult extends CommandResult {
    commands?: Array<[string, {
        usage: string;
        description: string;
    }]>;
    usage?: string;
}
```

## 🔧 内部API

### SEOCommands クラス

**ベースクラス**:
```javascript
class SEOCommands {
    constructor() {
        this.projectRoot = '/home/general/seo-article-system';
        this.analyzer = new ExcelAnalyzer(this.projectRoot);
        this.generator = new ArticleGenerator(this.projectRoot);
    }
}
```

**主要メソッド**:
- `setup(excelPath)`: クライアント環境初期化
- `create(gid, contentNumber)`: 記事プロンプト生成
- `validate(articlePath)`: 記事品質検証
- `customer(gid)`: 顧客プロンプト取得
- `keywords(gid, contentNumber)`: キーワード情報取得

### ExcelAnalyzer クラス

**目的**: エクセルファイル解析・データ抽出

```javascript
class ExcelAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.rulesCache = new Map();
    }
    
    analyzeExcel(excelPath) {
        // エクセルファイル解析ロジック
    }
    
    createClientDirectory(analysisResult) {
        // クライアントディレクトリ生成
    }
    
    extractCustomerInfo(worksheet) {
        // 顧客情報抽出
    }
    
    extractKeywordInfo(worksheet) {
        // キーワード情報抽出
    }
}
```

### ArticleGenerator クラス

**目的**: 記事生成プロンプト作成

```javascript
class ArticleGenerator {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.templateCache = new Map();
    }
    
    generateArticlePrompts(gid, contentNumber, customerPrompt, keywordInfo) {
        // 11ステップ記事生成プロンプト作成
    }
    
    createSectionPrompts(keywordInfo) {
        // セクション別プロンプト生成
    }
    
    generateTitlePrompts(keywordInfo) {
        // タイトル候補プロンプト生成
    }
    
    generateMetaDescriptionPrompt(keywordInfo) {
        // メタディスクリプションプロンプト生成
    }
}
```

## 📊 データ構造定義

### 顧客情報スキーマ
```typescript
interface CustomerInfo {
    gid: string;
    company: string;
    industry: string;
    website: string;
    contactPerson?: string;
    targetAudience: string;
    brandVoice: {
        tone: string;
        style: string;
        vocabulary: string;
    };
}
```

### キーワード情報スキーマ
```typescript
interface KeywordInfo {
    contentId: string;
    mainKeyword: string;
    subKeywords: string[];
    searchIntent: 'informational' | 'commercial' | 'navigational' | 'transactional';
    targetAudience: string;
    contentStructure: {
        title: string;
        sections: Array<{
            heading: string;
            keywords: string[];
            wordCount: number;
            purpose: string;
        }>;
    };
    seoRequirements: {
        minWordCount: number;
        keywordDensity: {
            min: number;
            max: number;
        };
        headingStructure: string[];
    };
}
```

### 記事品質検証結果スキーマ
```typescript
interface ValidationResult {
    basic: {
        wordCount: number;
        hasTitle: boolean;
        hasIntroduction: boolean;
        hasConclusion: boolean;
        headingStructure: string[];
    };
    seo: {
        keywordDensity: { [keyword: string]: number };
        titleOptimization: boolean;
        metaDescription: boolean;
        internalLinks: number;
    };
    content: {
        readabilityScore: number;
        uniqueness: number;
        accuracy: number;
        helpfulness: number;
    };
    brand: {
        toneConsistency: number;
        brandAlignment: number;
        competitorMentions: string[];
    };
}
```

## 🔨 拡張API

### カスタムバリデーター追加
```javascript
class CustomValidator {
    constructor(validationRules) {
        this.rules = validationRules;
    }
    
    validate(article, context) {
        // カスタム検証ロジック
        return {
            isValid: boolean,
            errors: string[],
            warnings: string[],
            score: number
        };
    }
    
    registerRule(ruleName, ruleFunction) {
        // カスタムルール登録
    }
}

// 使用例
const customValidator = new CustomValidator({
    minimumExamples: (article) => {
        const examples = article.match(/例：|例えば|具体的には/g);
        return examples && examples.length >= 2;
    }
});
```

### プラグインシステム
```javascript
class SEOPlugin {
    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.hooks = new Map();
    }
    
    registerHook(event, callback) {
        if (!this.hooks.has(event)) {
            this.hooks.set(event, []);
        }
        this.hooks.get(event).push(callback);
    }
    
    executeHooks(event, data) {
        const hooks = this.hooks.get(event) || [];
        return hooks.reduce((result, hook) => hook(result), data);
    }
}

// プラグイン例: 競合他社言及チェック
class CompetitorMentionPlugin extends SEOPlugin {
    constructor(competitorList) {
        super('CompetitorMention', '1.0.0');
        this.competitors = competitorList;
        
        this.registerHook('validate', this.checkCompetitorMentions.bind(this));
    }
    
    checkCompetitorMentions(article) {
        const mentions = [];
        this.competitors.forEach(competitor => {
            if (article.includes(competitor)) {
                mentions.push(competitor);
            }
        });
        
        return {
            ...article,
            competitorMentions: mentions
        };
    }
}
```

## 🚀 使用例

### 基本的な統合例
```javascript
const claudeCode = require('claude-code-sdk');
const SEOSlashCommands = require('./seo-article-system/tools/claude_code_integration');

// Claude Codeプラグイン登録
const seoIntegration = SEOSlashCommands.register(claudeCode);

// 事前設定
await seoIntegration.handleCommand('setup', ['/path/to/excel/file.xlsx']);

// 記事作成フロー
const createResult = await seoIntegration.handleCommand('create', ['G0016374', '01']);
console.log('記事作成プロンプト:', createResult.prompts);

// 品質検証フロー  
const validateResult = await seoIntegration.handleCommand('validate', ['/path/to/article.md']);
console.log('品質スコア:', validateResult.qualityScore);
```

### 外部システム統合例
```javascript
// REST APIラッパー例
class SEOSystemAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.seoCommands = new SEOCommands();
    }
    
    async post(endpoint, data) {
        const [command, ...args] = endpoint.split('/').filter(x => x);
        
        switch (command) {
            case 'setup':
                return await this.seoCommands.setup(data.excelPath);
            case 'create':
                return await this.seoCommands.create(data.gid, data.contentNumber);
            case 'validate':
                return await this.seoCommands.validate(data.articlePath);
            default:
                throw new Error(`Unknown endpoint: ${endpoint}`);
        }
    }
}

// 使用例
const api = new SEOSystemAPI('http://localhost:3000/api/seo');
const result = await api.post('/create', { 
    gid: 'G0016374', 
    contentNumber: '01' 
});
```

---

**作成者**: Claude (SEO Article Generation System)  
**レビュー**: APIバージョン管理・下位互換性の検討が必要  
**更新頻度**: システムアップデート時に即座に更新