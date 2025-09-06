# SEO システム MCP設定

このディレクトリには、SEOスラッシュコマンドシステムで使用するMCP（Model Context Protocol）サーバーの設定ファイルが含まれています。

## 📁 ファイル構成

- `claude_config.json` - Claude Code用MCP設定ファイル
- `README.md` - 本ファイル

## 🚀 クイックセットアップ

### 1. 必要なMCPサーバーをインストール

```bash
# SEOシステムのルートディレクトリで実行
bash scripts/install-mcp-servers.sh --core-only
```

### 2. Claude Code設定に統合

```bash
# 設定ファイルをClaude Codeに適用
cp config/mcp/claude_config.json ~/.claude/mcp/seo-config.json
```

### 3. 動作確認

```bash
# SEOコマンドの動作を確認
/seo:help
```

## 🔧 必要なMCPサーバー

### コア機能（必須）
- **Serena MCP**: プロジェクト記憶・セッション永続化
- **Sequential MCP**: 段階的思考・品質検証

### 拡張機能（オプション）
- **Context7 MCP**: 公式ドキュメント参照
- **Morphllm MCP**: 大量テキスト処理
- **Magic MCP**: UI管理画面構築

## 📖 詳細情報

完全な設定・運用ガイドは以下を参照してください：

- [MCP統合ガイド](../docs/MCP_INTEGRATION_GUIDE.md)
- [SEO設計書](../docs/SEO_SLASH_COMMANDS_DESIGN.md)
- [ベストプラクティス](../docs/SEO_BEST_PRACTICES.md)

## ⚠️ 注意事項

- Node.js >= 16.0.0 が必要です
- MCPサーバーのインストールには管理者権限が必要な場合があります
- 初回セットアップ時は `/seo:help` で正常動作を確認してください

---

**更新日**: 2025-09-06  
**バージョン**: v2.0.0