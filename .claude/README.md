# Claude Code Commands for SEO System

このディレクトリには、SEOスラッシュコマンドシステム用のClaude Codeコマンドが含まれています。

## インストール方法

```bash
# SEOシステムをクローン
git clone https://github.com/ryojiwata0103/seo-article-system.git
cd seo-article-system

# Claude Codeコマンドディレクトリにコマンドをコピー
cp -r .claude/commands/seo ~/.claude/commands/
```

## 利用可能コマンド

- `~/.claude/commands/seo/setup` - システム初期化
- `~/.claude/commands/seo/create` - 記事作成プロンプト生成
- `~/.claude/commands/seo/validate` - 記事品質検証
- `~/.claude/commands/seo/customer` - 顧客情報表示
- `~/.claude/commands/seo/keywords` - キーワード情報表示
- `~/.claude/commands/seo/help` - ヘルプ表示

## 使用例

```bash
# ヘルプを表示
~/.claude/commands/seo/help

# システムセットアップ
~/.claude/commands/seo/setup "/path/to/発注書.xlsx"

# 記事作成
~/.claude/commands/seo/create G0016374 01
```

## Claude Code統合

これらのコマンドは、Claude Code内で直接実行することを想定して作成されています。
各コマンドはSEOシステムのプロジェクトルートを自動検出し、適切なモジュールをロードします。