# Article Quality Checker System - 技術アーキテクチャ設計書

**プロジェクト**: Article Quality Checker System (AQCS)  
**バージョン**: v1.0.0  
**作成日**: 2025年09月06日

## 🏗️ システムアーキテクチャ概要

### アーキテクチャ原則
1. **モジュール分離**: 各チェック機能を独立したモジュールとして実装
2. **拡張性**: 新しいルールやチェッカーを容易に追加可能
3. **高性能**: 大量記事の並列処理に対応
4. **テスタビリティ**: 各コンポーネントの単体テストが容易

## 📦 システム構成

### ディレクトリ構造
```
article-quality-checker/
├── package.json
├── README.md
├── src/
│   ├── index.js                     # エントリーポイント
│   ├── ArticleQualityChecker.js     # メインクラス
│   ├── core/                        # コア機能
│   │   ├── TextAnalyzer.js          # テキスト解析基盤
│   │   ├── RuleEngine.js            # ルール実行エンジン
│   │   ├── ScoreCalculator.js       # スコア算出
│   │   └── ReportGenerator.js       # レポート生成
│   ├── checkers/                    # 品質チェッカー
│   │   ├── BaseChecker.js           # 基底チェッカークラス
│   │   ├── WordCountChecker.js      # 文字数チェック
│   │   ├── PunctuationChecker.js    # 読点チェック
│   │   ├── ExpressionChecker.js     # 表現チェック
│   │   ├── SEOChecker.js            # SEOチェック
│   │   ├── DuplicationChecker.js    # 重複チェック
│   │   └── FormattingChecker.js     # 書式チェック
│   ├── rules/                       # ルール定義
│   │   ├── index.js                 # ルール統合
│   │   ├── basic-rules.json         # 基本ルール
│   │   ├── seo-rules.json           # SEOルール
│   │   ├── expression-patterns.json # 表現パターン
│   │   └── formatting-rules.json    # 書式ルール
│   ├── utils/                       # ユーティリティ
│   │   ├── TextProcessor.js         # テキスト前処理
│   │   ├── CharacterCounter.js      # 文字カウント
│   │   ├── PatternMatcher.js        # パターンマッチング
│   │   └── ValidationHelper.js      # バリデーション支援
│   └── types/                       # 型定義
│       ├── Article.js               # 記事データ型
│       ├── QualityResult.js         # 品質結果型
│       └── Rules.js                 # ルール型
├── tests/                           # テストスイート
│   ├── unit/                        # ユニットテスト
│   ├── integration/                 # 統合テスト
│   ├── fixtures/                    # テストデータ
│   └── helpers/                     # テストヘルパー
├── config/                          # 設定ファイル
│   ├── default.json                 # デフォルト設定
│   ├── development.json             # 開発環境設定
│   └── production.json              # 本番環境設定
├── docs/                            # ドキュメント
│   ├── api/                         # API仕様
│   └── examples/                    # 使用例
└── tools/                           # 開発ツール
    ├── build.js                     # ビルドスクリプト
    └── benchmark.js                 # ベンチマークツール
```

## 🔧 コアコンポーネント設計

### 1. ArticleQualityChecker (メインクラス)

```javascript
class ArticleQualityChecker {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.ruleEngine = new RuleEngine(this.config.rules);
        this.checkers = this._initializeCheckers();
        this.scoreCalculator = new ScoreCalculator(this.config.scoring);
        this.reportGenerator = new ReportGenerator(this.config.reporting);
    }

    /**
     * 記事の品質をチェックする
     * @param {Article} article - 記事データ
     * @returns {QualityResult} - 品質チェック結果
     */
    async checkArticle(article) {
        // 前処理
        const processedArticle = this._preprocessArticle(article);
        
        // 各チェッカーを実行
        const checkResults = await Promise.all(
            this.checkers.map(checker => checker.check(processedArticle))
        );
        
        // 結果を統合
        const consolidatedResult = this._consolidateResults(checkResults);
        
        // スコア算出
        const score = this.scoreCalculator.calculate(consolidatedResult);
        
        // 最終結果
        return {
            article: processedArticle,
            checkResults: consolidatedResult,
            score: score,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * バッチ処理
     * @param {Article[]} articles - 記事配列
     * @returns {QualityResult[]} - 結果配列
     */
    async checkMultipleArticles(articles) {
        return Promise.all(
            articles.map(article => this.checkArticle(article))
        );
    }

    /**
     * レポート生成
     * @param {QualityResult} result - チェック結果
     * @param {string} format - 出力フォーマット
     * @returns {string} - レポート
     */
    generateReport(result, format = 'json') {
        return this.reportGenerator.generate(result, format);
    }
}
```

### 2. BaseChecker (チェッカー基底クラス)

```javascript
class BaseChecker {
    constructor(rules, config = {}) {
        this.rules = rules;
        this.config = config;
        this.name = this.constructor.name;
    }

    /**
     * チェック実行（サブクラスで実装）
     * @param {ProcessedArticle} article - 前処理済み記事
     * @returns {CheckResult} - チェック結果
     */
    async check(article) {
        throw new Error('check method must be implemented by subclass');
    }

    /**
     * 結果フォーマット統一
     * @param {boolean} valid - バリデーション結果
     * @param {object} details - 詳細情報
     * @param {string[]} violations - 違反項目
     * @returns {CheckResult} - 標準化された結果
     */
    _formatResult(valid, details, violations = []) {
        return {
            checker: this.name,
            valid: valid,
            details: details,
            violations: violations,
            timestamp: new Date().toISOString()
        };
    }
}
```

### 3. WordCountChecker (文字数チェッカー)

```javascript
class WordCountChecker extends BaseChecker {
    constructor(rules, config) {
        super(rules, config);
        this.characterCounter = new CharacterCounter();
    }

    async check(article) {
        const results = {
            total: this._checkTotalCount(article),
            introduction: this._checkIntroduction(article.introduction),
            sections: this._checkSections(article.sections),
            summary: this._checkSummary(article.summary),
            title: this._checkTitle(article.metadata.title),
            metaDescription: this._checkMetaDescription(article.metadata.metaDescription)
        };

        const allValid = Object.values(results).every(r => r.valid);
        const violations = Object.values(results)
            .filter(r => !r.valid)
            .map(r => r.violation);

        return this._formatResult(allValid, results, violations);
    }

    _checkTotalCount(article) {
        const totalText = [
            article.introduction,
            ...article.sections.map(s => s.content),
            article.summary
        ].join('');
        
        const count = this.characterCounter.count(totalText);
        const rule = this.rules.wordCount.overall;
        
        return {
            count: count,
            rule: rule,
            valid: count >= rule.min,
            violation: count < rule.min ? `文字数不足: ${count}/${rule.min}文字` : null
        };
    }

    _checkSections(sections) {
        return sections.map((section, index) => {
            const count = this.characterCounter.count(section.content);
            const rule = this.rules.wordCount.section;
            const valid = count >= rule.min && count <= rule.max;
            
            return {
                index: index,
                title: section.title,
                count: count,
                rule: rule,
                valid: valid,
                violation: !valid ? 
                    `セクション${index + 1}文字数エラー: ${count}文字 (${rule.min}-${rule.max})` : 
                    null
            };
        });
    }
}
```

### 4. PunctuationChecker (読点チェッカー)

```javascript
class PunctuationChecker extends BaseChecker {
    async check(article) {
        const fullText = this._extractFullText(article);
        const sentences = this._splitIntoSentences(fullText);
        
        const analysis = sentences.map((sentence, index) => {
            const commaCount = this._countCommas(sentence);
            const valid = commaCount <= this.rules.punctuation.maxCommasPerSentence;
            
            return {
                index: index,
                sentence: sentence.substring(0, 50) + '...', // プレビュー用
                commaCount: commaCount,
                valid: valid,
                position: this._findSentencePosition(fullText, sentence)
            };
        });

        const violations = analysis
            .filter(a => !a.valid)
            .map(a => `文${a.index + 1}: 読点${a.commaCount}個 (上限3個)`);

        // 連続長文チェック
        const consecutiveViolations = this._checkConsecutiveLongSentences(analysis);
        
        const allValid = violations.length === 0 && consecutiveViolations.length === 0;

        return this._formatResult(allValid, {
            sentenceAnalysis: analysis,
            summary: {
                totalSentences: sentences.length,
                violationCount: violations.length,
                consecutiveIssues: consecutiveViolations.length
            }
        }, [...violations, ...consecutiveViolations]);
    }

    _countCommas(sentence) {
        return (sentence.match(/、/g) || []).length;
    }

    _splitIntoSentences(text) {
        return text.split(/[。！？]/).filter(s => s.trim().length > 0);
    }

    _checkConsecutiveLongSentences(analysis) {
        const violations = [];
        let consecutiveCount = 0;
        
        for (let i = 0; i < analysis.length; i++) {
            if (analysis[i].commaCount === this.rules.punctuation.maxCommasPerSentence) {
                consecutiveCount++;
                if (consecutiveCount >= this.rules.punctuation.consecutiveLongSentenceLimit) {
                    violations.push(`連続長文: 文${i - consecutiveCount + 2}-${i + 1}`);
                }
            } else {
                consecutiveCount = 0;
            }
        }
        
        return violations;
    }
}
```

### 5. ExpressionChecker (表現チェッカー)

```javascript
class ExpressionChecker extends BaseChecker {
    constructor(rules, config) {
        super(rules, config);
        this.patternMatcher = new PatternMatcher();
    }

    async check(article) {
        const fullText = this._extractFullText(article);
        
        const results = {
            tildes: this._checkTildes(fullText),
            aiExpressions: this._checkAIExpressions(fullText),
            competitorReferences: this._checkCompetitorReferences(fullText),
            endingVariety: this._checkEndingVariety(fullText)
        };

        const allViolations = [
            ...results.tildes.violations,
            ...results.aiExpressions.violations,
            ...results.competitorReferences.violations,
            ...results.endingVariety.violations
        ];

        const allValid = allViolations.length === 0;

        return this._formatResult(allValid, results, allViolations);
    }

    _checkTildes(text) {
        const pattern = /[〜～]/g;
        const matches = [...text.matchAll(pattern)];
        
        return {
            count: matches.length,
            valid: matches.length === 0,
            violations: matches.length > 0 ? [`波線使用: ${matches.length}箇所`] : [],
            positions: matches.map(m => m.index)
        };
    }

    _checkAIExpressions(text) {
        const violations = [];
        const detectedExpressions = [];
        
        this.rules.expressions.prohibited.forEach(expression => {
            const regex = new RegExp(expression, 'g');
            const matches = [...text.matchAll(regex)];
            
            if (matches.length > 0) {
                violations.push(`AI表現「${expression}」: ${matches.length}箇所`);
                detectedExpressions.push({
                    expression: expression,
                    count: matches.length,
                    positions: matches.map(m => m.index)
                });
            }
        });

        return {
            detectedExpressions: detectedExpressions,
            valid: violations.length === 0,
            violations: violations
        };
    }

    _checkEndingVariety(text) {
        const sentences = text.split(/[。！？]/).filter(s => s.trim().length > 0);
        const endings = sentences.map(s => this._extractEnding(s.trim()));
        
        // 連続同一文末の検出
        let maxConsecutive = 0;
        let currentConsecutive = 1;
        let violations = [];
        
        for (let i = 1; i < endings.length; i++) {
            if (endings[i] === endings[i - 1]) {
                currentConsecutive++;
                if (currentConsecutive >= 3) {
                    violations.push(`文末表現「${endings[i]}」が${currentConsecutive}連続`);
                }
            } else {
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
                currentConsecutive = 1;
            }
        }
        
        // 多様性スコア算出
        const uniqueEndings = new Set(endings);
        const varietyScore = Math.round((uniqueEndings.size / endings.length) * 100);
        
        return {
            varietyScore: varietyScore,
            maxConsecutive: Math.max(maxConsecutive, currentConsecutive),
            valid: violations.length === 0,
            violations: violations,
            endingDistribution: this._calculateEndingDistribution(endings)
        };
    }

    _extractEnding(sentence) {
        // 文末パターンの抽出ロジック
        const patterns = [
            /です$/,
            /ます$/,
            /でした$/,
            /ました$/,
            /である$/,
            /だ$/
        ];
        
        for (const pattern of patterns) {
            if (pattern.test(sentence)) {
                return sentence.match(pattern)[0];
            }
        }
        
        return 'その他';
    }
}
```

## 📊 パフォーマンス最適化

### 並列処理戦略
```javascript
class ParallelProcessor {
    constructor(maxConcurrency = 5) {
        this.maxConcurrency = maxConcurrency;
    }

    async processArticles(articles, processor) {
        const chunks = this._chunkArray(articles, this.maxConcurrency);
        const results = [];
        
        for (const chunk of chunks) {
            const chunkResults = await Promise.all(
                chunk.map(article => processor(article))
            );
            results.push(...chunkResults);
        }
        
        return results;
    }

    _chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}
```

### メモリ効率化
```javascript
class MemoryOptimizer {
    constructor() {
        this.cache = new Map();
        this.maxCacheSize = 1000;
    }

    memoize(fn, keyGenerator) {
        return (...args) => {
            const key = keyGenerator(...args);
            
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }
            
            const result = fn(...args);
            
            if (this.cache.size >= this.maxCacheSize) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            
            this.cache.set(key, result);
            return result;
        };
    }
}
```

## 🧪 テスト戦略

### ユニットテスト構造
```javascript
// tests/unit/checkers/WordCountChecker.test.js
describe('WordCountChecker', () => {
    let checker;
    let mockRules;

    beforeEach(() => {
        mockRules = {
            wordCount: {
                overall: { min: 3000 },
                section: { min: 750, max: 950 }
            }
        };
        checker = new WordCountChecker(mockRules);
    });

    describe('check method', () => {
        test('should pass valid article', async () => {
            const article = createMockArticle({
                totalCharacters: 3500,
                sectionCharacters: [800, 850, 900]
            });

            const result = await checker.check(article);
            
            expect(result.valid).toBe(true);
            expect(result.violations).toHaveLength(0);
        });

        test('should detect insufficient total characters', async () => {
            const article = createMockArticle({
                totalCharacters: 2500
            });

            const result = await checker.check(article);
            
            expect(result.valid).toBe(false);
            expect(result.violations).toContain(
                expect.stringContaining('文字数不足')
            );
        });
    });
});
```

### 統合テスト
```javascript
// tests/integration/ArticleQualityChecker.test.js
describe('ArticleQualityChecker Integration', () => {
    let qualityChecker;

    beforeEach(() => {
        qualityChecker = new ArticleQualityChecker({
            rules: loadTestRules(),
            config: loadTestConfig()
        });
    });

    test('should process complete article workflow', async () => {
        const article = loadTestArticle('sample-article.json');
        
        const result = await qualityChecker.checkArticle(article);
        
        expect(result).toHaveProperty('score');
        expect(result.score.overallScore).toBeGreaterThan(0);
        expect(result.checkResults).toHaveLength(6); // 全チェッカー数
        
        // レポート生成テスト
        const report = qualityChecker.generateReport(result, 'json');
        expect(JSON.parse(report)).toMatchObject({
            summary: expect.any(Object),
            detailedFindings: expect.any(Array)
        });
    });
});
```

---

この技術アーキテクチャにより、スケーラブルで保守性の高い記事品質チェックシステムを構築できます。