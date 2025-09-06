# SEOスラッシュコマンドシステム MCP統合ガイド

**バージョン**: v2.0.0  
**作成日**: 2025-09-06  
**対象**: システム管理者・開発者・運用担当者

## 🎯 概要

SEOスラッシュコマンドシステムはMCP（Model Context Protocol）サーバーとの統合により、高度な記事生成・品質管理機能を提供します。本ガイドでは、必要なMCPサーバーの設定、インストール、運用方法を詳細に説明します。

## 📋 必要なMCPサーバー

### 🔴 コア機能（必須）

#### 1. Serena MCP
**パッケージ**: `@serena/mcp-server`  
**用途**: プロジェクト記憶・セッション永続化・シンボル操作

**主な機能**:
- 記事作成進行状況の記憶・復元
- 顧客プロンプトの永続化保存
- 品質チェック結果の履歴管理
- プロジェクト全体のコンテキスト管理
- セッション間でのデータ継承

**使用コマンド**:
- `/seo:setup` - 顧客情報の永続化
- `/seo:create` - 記事作成状況の記憶
- `/seo:validate` - 品質チェック履歴の保存
- `/seo:customer` - 顧客データの取得
- `/seo:keywords` - キーワード情報の管理

#### 2. Sequential MCP
**パッケージ**: `@sequential-thinking/mcp-server`  
**用途**: 段階的思考・複雑な分析・品質検証

**主な機能**:
- 11ステップワークフローの体系的実行
- 記事品質の段階的分析・評価
- 複雑な記事構造の論理的組み立て
- 仮説検証による品質向上
- 多段階品質チェックの実行

**使用コマンド**:
- `/seo:create` - 段階的記事構造の設計
- `/seo:validate` - 多層品質分析の実行
- `/seo:checklist` - 46項目チェックの体系的実行

### 🟡 拡張機能（推奨）

#### 3. Context7 MCP
**パッケージ**: `@context7/mcp-server`  
**用途**: 公式ライブラリドキュメント参照・フレームワークパターン

**主な機能**:
- 業界標準・ベストプラクティスの参照
- 技術的内容の正確性確保
- 公式ドキュメントからの正確な引用
- 専門用語の適切な使用

**使用コマンド**:
- `/seo:create` - 技術的根拠の参照
- 記事作成時の業界標準情報取得

#### 4. Morphllm MCP
**パッケージ**: `@morphllm-fast-apply/mcp-server`  
**用途**: 大量テキスト処理・パターン適用・効率化

**主な機能**:
- 記事テンプレートの一括適用
- 複数記事の統一フォーマット適用
- 大量テキストの効率的編集
- パターンベースの記事修正

**使用シーン**:
- 複数記事の一括処理
- 統一フォーマットの適用
- 大規模記事修正

#### 5. Magic MCP
**パッケージ**: `@magic/21st-component-builder`  
**用途**: UIコンポーネント生成（記事管理画面用）

**主な機能**:
- 記事管理ダッシュボードUI
- 品質チェック結果の可視化
- 顧客別記事一覧表示
- プロンプト生成フォーム

**使用シーン**:
- システム管理画面の構築
- 記事管理UIの作成

## 🚀 インストール手順

### 自動インストール（推奨）

```bash
# リポジトリルートで実行
cd /home/general/seo-article-system

# コア機能のみインストール
bash scripts/install-mcp-servers.sh --core-only

# 全機能インストール
bash scripts/install-mcp-servers.sh --all
```

### 手動インストール

```bash
# Node.js バージョン確認（16.0.0以上が必要）
node -v

# コアMCPサーバー（必須）
npm install -g @serena/mcp-server
npm install -g @sequential-thinking/mcp-server

# オプショナルMCPサーバー
npm install -g @context7/mcp-server
npm install -g @morphllm-fast-apply/mcp-server
npm install -g @magic/21st-component-builder
```

## ⚙️ Claude Code設定

### 1. 設定ファイルの配置

**方法1: 自動設定**
```bash
# SEOシステム設定をClaude Codeに統合
cp seo-article-system/config/mcp/claude_config.json ~/.claude/mcp/
```

**方法2: 手動設定**
Claude Code設定ファイル（`~/.claude/config.json`）に以下を追加:

```json
{
  "mcpServers": {
    "serena": {
      "command": "npx",
      "args": ["-y", "@serena/mcp-server"],
      "env": {}
    },
    "sequential": {
      "command": "npx", 
      "args": ["-y", "@sequential-thinking/mcp-server"],
      "env": {}
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "env": {}
    }
  }
}
```

### 2. 設定検証

```bash
# MCPサーバー接続確認
claude-code --check-mcp

# SEOコマンド動作確認
/seo:help
```

## 🔄 ワークフロー別MCP使用パターン

### Phase 1: データ準備
```
/seo:setup [エクセルファイル]
├── Serena MCP → 顧客情報の永続化
└── ファイルシステム → ディレクトリ構造作成
```

### Phase 2: コンテンツ構造化
```
/seo:create [G-ID] [番号]
├── Serena MCP → 顧客・キーワード情報取得
├── Context7 MCP → 業界標準パターン参照
└── Sequential MCP → 段階的プロンプト生成
```

### Phase 3: 記事作成
```
記事作成プロセス（手動 + MCP支援）
├── Sequential MCP → 11ステップ実行支援
├── Context7 MCP → 技術的根拠の提供
└── Serena MCP → 進行状況の記録
```

### Phase 4: 品質保証
```
/seo:validate [記事パス]
├── Sequential MCP → 段階的品質分析
├── Serena MCP → 結果の履歴保存
└── レポート生成

/seo:checklist [記事パス]
├── Sequential MCP → 46項目体系的検証
└── Serena MCP → チェック結果保存
```

## 🎛️ 設定カスタマイズ

### 環境変数設定
```bash
# SEOシステム固有の設定
export SEO_SYSTEM_ROOT="/home/general/seo-article-system"
export SEO_MCP_LOG_LEVEL="info"
export SEO_CACHE_ENABLED="true"

# MCP固有の設定
export SERENA_PROJECT_PATH="$SEO_SYSTEM_ROOT"
export SEQUENTIAL_MAX_STEPS="20"
export CONTEXT7_API_TIMEOUT="30000"
```

### プロジェクト固有設定
```json
// seo-article-system/.seo/config.json
{
  "mcpSettings": {
    "serena": {
      "memoryPath": "./customers/{gid}/memories/",
      "sessionTimeout": 3600000,
      "autoSave": true
    },
    "sequential": {
      "maxDepth": 15,
      "parallelThinking": true,
      "validationMode": "strict"
    },
    "context7": {
      "cacheDocuments": true,
      "preferOfficialSources": true
    }
  }
}
```

## 🔧 トラブルシューティング

### よくある問題と解決策

#### 1. MCPサーバー接続エラー
**症状**: `/seo:` コマンドでMCP関連エラーが発生

**診断手順**:
```bash
# MCPサーバーの状態確認
npm list -g | grep -E "(serena|sequential|context7)"

# Claude Code MCP設定確認
claude-code --list-mcp

# 個別MCPサーバーテスト
npx @serena/mcp-server --test
npx @sequential-thinking/mcp-server --test
```

**解決策**:
```bash
# MCPサーバー再インストール
npm uninstall -g @serena/mcp-server
npm install -g @serena/mcp-server

# Claude Code設定リフレッシュ
claude-code --reload-mcp
```

#### 2. Serena MCP メモリエラー
**症状**: 顧客情報や進行状況が保存されない

**解決策**:
```bash
# Serenaワークスペース初期化
cd /home/general/seo-article-system
serena init

# 権限確認
chmod -R 755 customers/
chmod -R 755 output/

# メモリファイル確認
ls -la customers/*/memories/
```

#### 3. Sequential MCP タイムアウト
**症状**: 複雑な分析でタイムアウトエラー

**解決策**:
```bash
# 環境変数でタイムアウト延長
export SEQUENTIAL_TIMEOUT=60000

# 設定ファイルでステップ数制限
echo '{"maxSteps": 10}' > ~/.sequential/config.json
```

### パフォーマンス最適化

#### MCPサーバーキャッシュ設定
```bash
# Serenaキャッシュ設定
export SERENA_CACHE_SIZE="100MB"
export SERENA_CACHE_TTL="3600"

# Context7キャッシュ設定
export CONTEXT7_CACHE_ENABLED="true"
export CONTEXT7_CACHE_DURATION="7200"
```

#### メモリ使用量最適化
```json
// ~/.claude/mcp-performance.json
{
  "serena": {
    "memoryLimit": "256MB",
    "gcInterval": 30000
  },
  "sequential": {
    "maxConcurrentSteps": 3,
    "stepMemoryLimit": "128MB"
  }
}
```

## 📊 監視・ログ

### ログ設定
```bash
# MCPサーバーログレベル設定
export MCP_LOG_LEVEL="info"
export SEO_SYSTEM_DEBUG="false"

# ログファイル場所
tail -f ~/.claude/logs/mcp-serena.log
tail -f ~/.claude/logs/mcp-sequential.log
```

### メトリクス監視
```bash
# システム使用状況
/seo:status

# MCPサーバー統計
claude-code --mcp-stats
```

## 🔄 アップデート手順

### MCPサーバーアップデート
```bash
# 現在のバージョン確認
npm list -g @serena/mcp-server
npm list -g @sequential-thinking/mcp-server

# アップデート実行
npm update -g @serena/mcp-server
npm update -g @sequential-thinking/mcp-server

# 設定互換性確認
/seo:help
```

### 設定移行
```bash
# バックアップ作成
cp ~/.claude/config.json ~/.claude/config.json.backup

# 新設定の適用
bash seo-article-system/scripts/update-mcp-config.sh

# 動作確認
/seo:validate --test-mode
```

## 📚 関連資料

### ドキュメント
- [SEO設計書](./SEO_SLASH_COMMANDS_DESIGN.md)
- [ベストプラクティス](./SEO_BEST_PRACTICES.md)
- [API仕様書](./API_REFERENCE.md)

### 設定ファイル
- [Claude Code設定](../config/mcp/claude_config.json)
- [インストールスクリプト](../scripts/install-mcp-servers.sh)

### サポート
- **システム管理**: `/seo:help`
- **デバッグモード**: `export SEO_DEBUG=true`
- **ログ監視**: `tail -f ~/.claude/logs/seo-system.log`

---

**作成者**: Claude (SEO Article Generation System)  
**更新頻度**: MCPサーバー更新時・システム変更時  
**サポート**: システム管理者への連絡推奨