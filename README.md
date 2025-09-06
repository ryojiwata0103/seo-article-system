# SEO スラッシュコマンドシステム

Claude Code統合 SEO記事自動生成・品質管理システム

## 🎯 システム概要

Claude Code内で `/seo:` コマンドを使用してSEO記事の作成から品質管理まで完全自動化するシステムです。
エクセル発注書から高品質記事まで、11ステップワークフローと46項目品質検証により、人間らしい自然な記事を生成します。

## 🚀 主要機能

### ✅ **スラッシュコマンドシステム**
```bash
/seo:setup    # エクセルファイルからシステム初期化
/seo:create   # 記事作成プロンプト生成
/seo:validate # 記事品質検証
/seo:customer # 顧客情報表示
/seo:keywords # キーワード情報表示
/seo:rules    # ルール一覧表示
/seo:checklist # 品質チェックリスト
/seo:templates # テンプレート一覧
/seo:help     # ヘルプ表示
```

### 🤖 **MCP統合機能**
- **Serena MCP**: プロジェクト記憶・セッション永続化
- **Sequential MCP**: 段階的思考・品質検証
- **Context7 MCP**: 公式ドキュメント参照
- **Morphllm MCP**: 大量テキスト処理
- **Magic MCP**: UI管理画面構築

### 🎨 **品質保証システム**
- **11ステップワークフロー**: 体系的記事作成プロセス
- **46項目品質チェック**: Find-A準拠の包括的検証
- **AI感完全排除**: 人間らしい自然な文章生成
- **SEO最適化**: キーワード配置・メタ情報自動最適化

## 📁 ディレクトリ構造

```
seo-article-system/
├── tools/                                  # 実行ツール
│   ├── seo_commands.js                     # メインコマンドハンドラー
│   ├── claude_code_integration.js          # Claude Code統合
│   ├── excel_analyzer.js                   # Excel解析エンジン
│   ├── article_generator.js                # 記事生成エンジン  
│   └── article_modifier.js                 # 記事修正ツール
├── config/                                 # 設定ファイル
│   ├── mcp/                               # MCP設定ファイル
│   │   ├── claude_config.json             # Claude Code MCP設定
│   │   └── README.md                      # MCP設定ガイド
│   ├── rules/                             # ルールファイル
│   └── templates/                         # テンプレート
├── scripts/                               # 自動化スクリプト
│   └── install-mcp-servers.sh            # MCPサーバー自動インストール
├── docs/                                  # システム文書
│   ├── SEO_SLASH_COMMANDS_DESIGN.md      # スラッシュコマンド設計書
│   ├── SEO_BEST_PRACTICES.md             # 運用ベストプラクティス
│   ├── API_REFERENCE.md                  # 開発者向けAPI仕様
│   └── MCP_INTEGRATION_GUIDE.md          # MCP統合ガイド
├── customers/                             # 顧客データ保存
├── output/                               # 記事出力先
└── orders/                               # 発注書管理
```

## 🛠️ 使用方法

### 📋 事前準備（初回のみ）

#### 1. MCPサーバーのインストール
```bash
# コア機能のみインストール（推奨）
bash scripts/install-mcp-servers.sh --core-only

# または全機能インストール
bash scripts/install-mcp-servers.sh --all
```

#### 2. Claude Code設定
```bash
# MCP設定をClaude Codeに適用
cp config/mcp/claude_config.json ~/.claude/mcp/seo-config.json

# 動作確認
/seo:help
```

### 🚀 スラッシュコマンドでの記事作成

```bash
# 1. システム初期化
/seo:setup "/path/to/your_company_発注書.xlsx"

# 2. 記事作成プロンプト生成
/seo:create G0016374 01

# 3. 記事品質チェック
/seo:validate "/path/to/generated_article.md"

# 4. 最終品質確認
/seo:checklist "/path/to/generated_article.md"
```

### 📊 品質管理フロー

```
Phase 1: データ準備
├── /seo:setup → 顧客情報抽出・ディレクトリ生成
└── /seo:customer → 顧客理解プロンプト確認

Phase 2: コンテンツ構造化  
├── /seo:keywords → キーワード構造確認
└── /seo:create → 段階的プロンプト生成

Phase 3: 記事作成
├── 11ステッププロンプト実行 → 記事生成
└── セクション別品質確認

Phase 4: 品質保証
├── /seo:validate → 基本品質チェック
└── /seo:checklist → 46項目包括検証
```

## 🔧 技術仕様

### 必要環境
- **Node.js**: >= 16.0.0
- **Claude Code**: 最新版
- **MCP対応**: Serena・Sequential（必須）

### 必要なMCPサーバー

#### コア機能（必須）
- **Serena MCP**: `@serena/mcp-server`
- **Sequential MCP**: `@sequential-thinking/mcp-server`

#### 拡張機能（推奨）
- **Context7 MCP**: `@context7/mcp-server`
- **Morphllm MCP**: `@morphllm-fast-apply/mcp-server` 
- **Magic MCP**: `@magic/21st-component-builder`

### 記事品質基準
- **文字数**: 3,000文字以上
- **キーワード密度**: 1-3%の適切範囲
- **可読性**: 中学生レベル理解可能
- **AI感排除**: 完全な人間らしい文章
- **E-E-A-T対応**: 専門性・権威性・信頼性確保

## 📖 ドキュメント

### システム仕様
- [設計書](docs/SEO_SLASH_COMMANDS_DESIGN.md) - システム全体設計
- [API仕様書](docs/API_REFERENCE.md) - 開発者向け詳細仕様

### 運用ガイド  
- [ベストプラクティス](docs/SEO_BEST_PRACTICES.md) - 効率的運用方法
- [MCP統合ガイド](docs/MCP_INTEGRATION_GUIDE.md) - MCP設定・運用

## 🚨 トラブルシューティング

### よくある問題

#### MCPサーバー接続エラー
```bash
# MCPサーバー状態確認
npm list -g | grep -E "(serena|sequential|context7)"

# Claude Code MCP設定確認  
claude-code --list-mcp

# 個別テスト
npx @serena/mcp-server --test
```

#### コマンドが認識されない
```bash
# Claude Code設定確認
/seo:help

# MCP設定リロード
claude-code --reload-mcp

# 設定ファイル再適用
cp config/mcp/claude_config.json ~/.claude/mcp/seo-config.json
```

## 🤝 開発・貢献

### 開発セットアップ
```bash
git clone https://github.com/ryojiwata0103/seo-article-system.git
cd seo-article-system
bash scripts/install-mcp-servers.sh --all
```

### コード品質
- ESLint準拠のコーディング標準
- 包括的エラーハンドリング
- 詳細ログ・デバッグ機能
- 自動テスト（計画中）

## 📄 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。

## 📞 サポート

- **問題報告**: GitHub Issues
- **機能要望**: GitHub Discussions  
- **ドキュメント**: [docs/](docs/) ディレクトリ

---

**バージョン**: v2.0.0  
**最終更新**: 2025-09-06  
**メンテナンス**: ryojiwata0103