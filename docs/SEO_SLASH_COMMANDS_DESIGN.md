# SEOスラッシュコマンドシステム設計書

**バージョン**: v2.0.0  
**作成日**: 2025-09-06  
**対象**: Claude Code統合SEO記事生成システム

## 🎯 設計目標

### 核心機能
- **スラッシュコマンド統合**: Claude Code内で `/seo:` プレフィックスによる直接実行
- **ワークフロー自動化**: 11ステップ記事生成プロセスの完全自動化
- **品質保証**: 46項目バリデーションシステムによる記事品質担保
- **CCF統合**: Claude Config Framework との完全統合による効率化

## 🏗️ システム構成

### アーキテクチャ概要
```
Claude Code Interface
├── /seo: コマンドパーサー
├── SEOCommands クラス (中核制御)
├── ExcelAnalyzer (データ解析)
├── ArticleGenerator (記事生成)
├── ValidationEngine (品質検証)
└── FileSystemManager (ファイル管理)
```

### データフロー
```
Excel入力 → 顧客情報抽出 → ディレクトリ構造生成 → 
キーワード分析 → 記事プロンプト生成 → 品質検証 → 出力
```

## 📋 コマンド仕様

### メインコマンド群

#### `/seo:setup`
**目的**: エクセルファイルからクライアント環境初期化
```bash
/seo:setup [エクセルファイルパス]
```

**処理フロー**:
1. エクセルファイル検証・読み込み
2. 顧客情報（G-ID、企業名、URL）抽出
3. `customers/[G-ID]/` ディレクトリ構造生成
4. 顧客理解プロンプト自動作成
5. キーワード情報JSON化・保存

**出力**:
- 顧客ディレクトリ作成確認
- G-ID表示
- 顧客情報サマリー

#### `/seo:create`
**目的**: 指定コンテンツの記事作成プロンプト生成
```bash
/seo:create [G-ID] [コンテンツ番号]
```

**処理フロー**:
1. 顧客プロンプト読み込み
2. 対象コンテンツのキーワード情報取得
3. 11ステップ記事作成プロンプト生成
4. `output/[G-ID]/content_[番号]/` に保存
5. 実行用プロンプトセット出力

**出力**:
- 段階別プロンプトファイル
- 記事構造テンプレート
- 品質チェック項目

### 支援コマンド群

#### `/seo:validate`
**目的**: 生成記事の品質検証
```bash
/seo:validate [記事ファイルパス]
```

**検証項目**:
- 文字数（3,000文字以上）
- キーワード密度
- 見出し構造
- 読みやすさ指標
- AI感排除度

#### `/seo:customer`
**目的**: 顧客理解プロンプト表示
```bash
/seo:customer [G-ID]
```

#### `/seo:keywords`
**目的**: キーワード情報詳細表示
```bash
/seo:keywords [G-ID] [コンテンツ番号]
```

#### `/seo:rules`
**目的**: 記事作成ルール一覧表示
```bash
/seo:rules
```

#### `/seo:checklist`
**目的**: Find-A品質チェックリスト実行
```bash
/seo:checklist [記事ファイルパス]
```

## 🗂️ ディレクトリ構造

### 標準レイアウト
```
seo-article-system/
├── config/                      # 設定ファイル群
│   ├── rules/                   # ルールセット
│   │   ├── basic_rules.json     # 基本記事ルール
│   │   ├── quality_rules.json   # intention+品質ルール
│   │   └── find_a_checklist.json # Find-Aチェックリスト
│   ├── templates/               # プロンプトテンプレート
│   │   ├── customer_prompt.md   # 顧客理解テンプレート
│   │   ├── article_sections.json # セクション構造
│   │   └── validation_criteria.json # 検証基準
│   └── schemas/                 # データスキーマ
├── customers/                   # 顧客別管理
│   └── [G-ID]/                 # 顧客固有ディレクトリ
│       ├── customer_prompt.md   # 顧客理解プロンプト
│       ├── keywords/            # キーワード情報
│       │   └── content_[番号].json
│       └── articles/            # 過去記事履歴
├── output/                      # 生成物出力
│   └── [G-ID]/                 # 顧客別出力
│       └── content_[番号]/      # コンテンツ別
│           ├── article_prompts.json # 生成プロンプト
│           ├── generated_article.md # 生成記事
│           └── validation_report.json # 品質レポート
├── tools/                       # 実行ツール
│   ├── seo_commands.js          # メインコマンドハンドラー
│   ├── excel_analyzer.js        # エクセル解析
│   ├── article_generator.js     # 記事生成エンジン
│   └── validation_engine.js     # 品質検証エンジン
└── docs/                       # ドキュメント
    ├── SEO_SLASH_COMMANDS_DESIGN.md # 設計書（本文書）
    ├── SEO_BEST_PRACTICES.md   # ベストプラクティス
    └── API_REFERENCE.md         # API仕様書
```

## 🔄 実装フェーズ

### Phase 1: 基盤実装 ✅
- [x] エクセル解析エンジン
- [x] 基本ディレクトリ構造
- [x] ルールファイル統合
- [x] 基本コマンドインターフェース

### Phase 2: コアエンジン実装 🚧
- [ ] 11ステップワークフロー自動化
- [ ] 記事プロンプト生成エンジン
- [ ] セクション別記事作成ロジック
- [ ] タイトル・メタディスクリプション生成

### Phase 3: 品質保証実装 ⏳
- [ ] 46項目品質検証システム
- [ ] AI感排除度測定
- [ ] キーワード密度分析
- [ ] 読みやすさ指標計算

### Phase 4: Claude Code統合 ⏳
- [ ] スラッシュコマンド登録
- [ ] CCFモード連携
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化

## 🔧 技術仕様

### 必要依存関係
```json
{
  "node": ">=16.0.0",
  "dependencies": {
    "xlsx": "^0.18.5",
    "fs-extra": "^10.1.0",
    "commander": "^9.4.1",
    "chalk": "^4.1.2",
    "inquirer": "^8.2.5"
  }
}
```

### Claude Code統合インターフェース
```javascript
// Claude Code Plugin Interface
class SEOSlashCommands {
    static register(claudeCode) {
        claudeCode.registerSlashCommand('seo', this.handleSEOCommand);
    }
    
    static async handleSEOCommand(subCommand, args, context) {
        const seoCommands = new SEOCommands();
        return await seoCommands.execute(subCommand, args, context);
    }
}
```

### エラーハンドリング戦略
- **ファイル不存在**: 適切なエラーメッセージと復旧提案
- **データ形式エラー**: スキーマ検証とフォーマット修正提案
- **権限エラー**: アクセス権限確認と解決手順提示
- **リソース不足**: メモリ・ディスク容量チェックと最適化提案

## 🎯 品質保証

### 記事品質基準
- **文字数**: 3,000文字以上（メタ情報含む）
- **キーワード密度**: 1-3%の適切な範囲
- **可読性**: 中学生レベルでの理解可能性
- **AI感排除**: 人間らしい自然な文章表現
- **SEO最適化**: タイトル・見出し・メタ情報の完全最適化

### 検証プロセス
1. **構造検証**: 見出し構造・セクション配置の適切性
2. **内容検証**: 情報の正確性・有益性・独自性
3. **表現検証**: 文章の自然性・読みやすさ
4. **SEO検証**: キーワード配置・メタ情報最適化
5. **総合判定**: 46項目チェックリストによる包括評価

## 🚀 使用例

### 基本的な実行フロー
```bash
# 1. プロジェクト初期化
/seo:setup "/path/to/your_company_発注書.xlsx"

# 2. 記事作成プロンプト生成
/seo:create G0016374 01

# 3. 生成された記事の品質検証
/seo:validate "/path/to/seo-article-system/output/G0016374/content_01/generated_article.md"

# 4. Find-A品質チェックリスト実行
/seo:checklist "/path/to/seo-article-system/output/G0016374/content_01/generated_article.md"
```

### 期待される出力品質
- **プロフェッショナル品質**: 人間のライターが作成したレベル
- **SEO最適化**: 検索エンジンでの上位表示を狙える品質
- **読者価値**: E-E-A-T（経験・専門性・権威性・信頼性）対応
- **ブランド整合性**: 顧客企業のトーン・マナーに完全準拠

---

**作成者**: Claude (SEO Article Generation System)  
**レビュー**: 要テクニカルレビュー  
**承認**: 要最終承認