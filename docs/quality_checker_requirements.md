# 記事品質自動チェックシステム 要件定義書

**プロジェクト名**: Article Quality Checker System (AQCS)  
**バージョン**: v1.0.0  
**作成日**: 2025年09月06日  
**対象システム**: SEO記事作成システム統合モジュール

## 🎯 システム概要

### 目的
AI判定に依存しない客観的・一貫性のある記事品質チェックシステムの構築

### ゴール
- 記事品質の機械的・定量的評価
- リアルタイム品質フィードバック
- コスト効率的な大量記事検証
- 品質基準の標準化・自動化

## 📋 機能要件

### **Phase 1: 基本品質チェック機能**

#### 1.1 文字数検証機能
**機能ID**: F001
```javascript
// 要求仕様
validateWordCount(content, rules) {
    return {
        totalCount: number,           // 全体文字数
        sectionCounts: object,        // セクション別文字数
        validation: {
            overall: boolean,         // 全体基準クリア
            introduction: boolean,    // 導入文基準クリア
            sections: array,         // 各セクション基準
            summary: boolean         // まとめ基準クリア
        },
        violations: array            // 違反詳細
    };
}
```

**検証基準**:
- 記事全体: 3,000-3,500文字
- 導入文: 280-320文字（300±20）
- セクション1-3: 750-950文字（850±100）
- まとめ: 380-420文字（400±20）
- タイトル: 35文字以内
- メタディスクリプション: 90-120文字

#### 1.2 読点数検証機能
**機能ID**: F002
```javascript
validatePunctuation(sentences) {
    return {
        sentenceAnalysis: [{
            sentence: string,
            commaCount: number,
            valid: boolean,
            position: number         // 文書内位置
        }],
        summary: {
            totalSentences: number,
            violationCount: number,
            maxCommas: number,
            averageCommas: number
        }
    };
}
```

**検証基準**:
- 一文の読点数: 3個以内
- 連続長文の検出: 4文連続で読点3個の文章を警告

#### 1.3 禁止表現検出機能
**機能ID**: F003
```javascript
detectProhibitedExpressions(text) {
    return {
        tildeViolations: {           // 波線検出
            count: number,
            positions: array
        },
        aiExpressions: [{            // AI表現検出
            expression: string,
            count: number,
            positions: array
        }],
        competitorReferences: [{     // 他社誘導検出
            phrase: string,
            context: string,
            severity: string         // high/medium/low
        }]
    };
}
```

**検出パターン**:
- 波線: 「～」「〜」
- AI表現: 「〜ではないでしょうか」「〜のが特徴です」等
- 他社誘導: 「複数業者に相談」「他社と比較」等

#### 1.4 文末表現多様性チェック
**機能ID**: F004
```javascript
analyzeEndingVariety(sentences) {
    return {
        endingPatterns: object,      // 文末パターンの分布
        consecutiveCount: number,    // 最大連続数
        varietyScore: number,        // 多様性スコア（0-100）
        violations: array           // 3連続以上の箇所
    };
}
```

### **Phase 2: 高度品質分析機能**

#### 2.1 SEOキーワード分析機能
**機能ID**: F005
```javascript
analyzeSEOKeywords(content, targetKeywords, needsKeywords) {
    return {
        keywordUsage: [{
            keyword: string,
            count: number,
            density: number,         // 密度%
            positions: array,        // 出現位置
            inTitle: boolean,        // タイトル含有
            inHeaders: boolean       // 見出し含有
        }],
        overallDensity: number,      // 総キーワード密度
        missingKeywords: array,      // 未使用キーワード
        seoScore: number            // SEOスコア（0-100）
    };
}
```

#### 2.2 重複表現検出機能
**機能ID**: F006
```javascript
detectDuplication(content) {
    return {
        repeatedPhrases: [{
            phrase: string,
            count: number,
            positions: array,
            severity: string
        }],
        sectionSimilarity: [{        // セクション間類似度
            section1: string,
            section2: string,
            similarity: number       // 0-100%
        }],
        redundancyScore: number      // 冗長度スコア
    };
}
```

#### 2.3 記号・表記統一チェック
**機能ID**: F007
```javascript
validateFormatting(content) {
    return {
        characterTypes: {
            fullWidthNumbers: array,    // 全角数字検出
            halfWidthSymbols: array,    // 半角記号検出
            environmentDependent: array  // 機種依存文字
        },
        bracketConsistency: boolean,    // 括弧統一性
        quotationConsistency: boolean,  // 引用符統一性
        formattingScore: number         // 表記統一スコア
    };
}
```

### **Phase 3: 統合品質評価機能**

#### 3.1 総合品質スコア算出
**機能ID**: F008
```javascript
calculateQualityScore(allChecks) {
    return {
        overallScore: number,        // 総合スコア（0-100）
        categoryScores: {
            structure: number,       // 構造品質
            expression: number,      // 表現品質
            seo: number,            // SEO品質
            consistency: number      // 一貫性品質
        },
        passedChecks: number,
        totalChecks: number,
        qualityGrade: string,        // S/A/B/C/D
        recommendations: array       // 改善提案
    };
}
```

#### 3.2 品質レポート生成機能
**機能ID**: F009
```javascript
generateQualityReport(article, scores) {
    return {
        summary: object,             // 品質サマリー
        detailedFindings: array,     // 詳細発見事項
        violationsByPriority: {
            critical: array,         // 重大違反
            warning: array,          // 警告
            suggestion: array        // 改善提案
        },
        improvementPlan: array,      // 改善計画
        exportFormats: ['json', 'html', 'pdf']
    };
}
```

## 🛠️ 技術仕様

### **システムアーキテクチャ**

#### コアモジュール構成
```
article-quality-checker/
├── src/
│   ├── core/                    # コア機能
│   │   ├── TextAnalyzer.js      # 文章解析エンジン
│   │   ├── RuleEngine.js        # ルール適用エンジン
│   │   └── ScoreCalculator.js   # スコア算出エンジン
│   ├── checkers/                # 個別チェッカー
│   │   ├── WordCountChecker.js
│   │   ├── PunctuationChecker.js
│   │   ├── ExpressionChecker.js
│   │   └── SEOChecker.js
│   ├── rules/                   # ルール定義
│   │   ├── basic-rules.json
│   │   ├── seo-rules.json
│   │   └── expression-patterns.json
│   └── utils/                   # ユーティリティ
│       ├── TextProcessor.js
│       └── ReportGenerator.js
├── tests/                       # テストスイート
├── config/                      # 設定ファイル
└── docs/                        # ドキュメント
```

#### 技術スタック
- **Runtime**: Node.js 18+
- **言語**: JavaScript (ES2022)
- **テスト**: Jest
- **文書**: JSDoc
- **品質管理**: ESLint + Prettier
- **CI/CD**: GitHub Actions

### **データ形式**

#### 入力データ仕様
```javascript
const articleInput = {
    gid: "G1234567",
    contentId: "01",
    metadata: {
        title: string,
        metaDescription: string,
        targetKeywords: array,
        needsKeywords: array
    },
    content: {
        introduction: string,
        sections: [{
            title: string,
            content: string,
            order: number
        }],
        summary: string
    }
};
```

#### 設定データ仕様
```javascript
const qualityRules = {
    wordCount: {
        overall: { min: 3000, max: null },
        introduction: { min: 280, max: 320 },
        section: { min: 750, max: 950 },
        summary: { min: 380, max: 420 }
    },
    punctuation: {
        maxCommasPerSentence: 3,
        consecutiveLongSentenceLimit: 4
    },
    expressions: {
        prohibited: array,
        aiExpressions: array,
        competitorReferences: array
    },
    seo: {
        keywordDensity: { min: 1, max: 2 },
        titleKeywordRequired: true
    }
};
```

## 🚀 実装フェーズ

### **Phase 1: MVP実装（2-3週間）**
**優先度: 最高**

#### Week 1: 基盤構築
- [ ] プロジェクト構造作成
- [ ] TextAnalyzer基盤実装
- [ ] 文字数チェッカー実装
- [ ] 基本テスト作成

#### Week 2: コア機能実装
- [ ] 読点数チェッカー実装
- [ ] 禁止表現検出実装
- [ ] 文末表現分析実装
- [ ] RuleEngine統合

#### Week 3: 統合・テスト
- [ ] 品質スコア算出実装
- [ ] CLI インターフェース作成
- [ ] 統合テスト実装
- [ ] 基本ドキュメント作成

### **Phase 2: 機能拡張（3-4週間）**
**優先度: 高**

#### Week 4-5: SEO機能
- [ ] SEOキーワード分析実装
- [ ] キーワード密度計算
- [ ] SEOスコア算出

#### Week 6-7: 高度分析
- [ ] 重複表現検出実装
- [ ] 記号・表記統一チェック
- [ ] レポート生成機能

### **Phase 3: システム統合（2-3週間）**
**優先度: 中**

#### Week 8-9: 統合開発
- [ ] 既存システムとの連携
- [ ] リアルタイムチェック機能
- [ ] Web UI実装

#### Week 10: 最終調整
- [ ] パフォーマンス最適化
- [ ] 本格運用準備
- [ ] 運用ドキュメント整備

## 📊 成功指標

### **品質指標**
- 機械的チェック精度: 99%以上
- AI判定との一致率: 95%以上
- 処理速度: 3,500文字記事を1秒以内
- 偽陽性率: 5%以下

### **運用指標**
- システム可用性: 99.9%
- レスポンス時間: 平均500ms以下
- 同時処理件数: 100件以上
- メモリ使用量: 記事1件あたり10MB以下

### **ビジネス指標**
- 品質チェック工数: 90%削減
- API コスト: 80%削減
- 記事品質一貫性: 95%向上
- クライアント満足度: 現状維持以上

## 💰 開発リソース見積もり

### **開発工数**
- **Phase 1 (MVP)**: 120-160時間
- **Phase 2 (機能拡張)**: 160-200時間
- **Phase 3 (統合)**: 80-120時間
- **総計**: 360-480時間

### **技術的リスク**

#### 高リスク
- 日本語テキスト解析の精度
- 大量データ処理時のパフォーマンス

#### 中リスク
- 既存システムとの統合複雑性
- ルール変更への対応柔軟性

#### 低リスク
- 基本的な文字数・記号カウント機能

### **リスク対策**
1. **プロトタイプによる事前検証**
2. **段階的リリース戦略**
3. **包括的テストスイート**
4. **パフォーマンス監視システム**

## 🎯 期待効果

### **短期効果（Phase 1完了時）**
- 基本品質チェックの自動化
- 人的工数の50%削減
- 品質判定の一貫性向上

### **中期効果（Phase 2完了時）**
- 包括的品質管理の実現
- SEO最適化の自動化
- 記事作成効率の大幅向上

### **長期効果（Phase 3完了時）**
- リアルタイム品質フィードバック
- 大規模記事生産への対応
- 品質データの蓄積・分析基盤

---

**要件定義責任者**: Claude Code Development Team  
**承認予定日**: 2025年09月06日  
**開発開始予定**: 要件承認後即座  
**MVP提供予定**: 2025年09月末