# 推奨コマンド

## 記事作成ワークフロー

### 1. 顧客情報セットアップ
```bash
# Excel発注書から顧客情報を解析
node tools/excel_analyzer.js path/to/order.xlsx
```

### 2. 記事作成プロンプト生成
```bash
# G-IDとコンテンツ番号を指定して記事作成プロンプトを生成
node tools/article_generator.js G1234567 01
```

### 3. 既存記事修正・品質向上
```bash
# AI表現排除・自然文化
node tools/article_modifier.js G1234567 01 /path/to/article.md ai_expression_elimination

# コンテンツ戦略調整
node tools/article_modifier.js G1234567 01 /path/to/article.md content_strategy_adjustment

# サービス特化ポジショニング
node tools/article_modifier.js G1234567 01 /path/to/article.md service_specific_positioning

# 46項目品質検証
node tools/article_modifier.js G1234567 01 /path/to/article.md quality_validation

# 全修正プロンプト一括生成
node tools/article_modifier.js G1234567 01 /path/to/article.md all
```

## パッケージ管理
```bash
# 依存関係インストール
npm install

# パッケージ更新
npm update
```

## Git操作
```bash
# 現在の状態確認
git status
git branch

# 変更をステージング
git add .

# コミット
git commit -m "メッセージ"

# プッシュ
git push origin feature/branch-name
```

## ファイル操作
```bash
# ディレクトリ内容確認
ls -la

# ファイル検索
find . -name "*.js"

# テキスト検索
grep -r "keyword" .

# ファイル内容確認
cat file.md
```

## テスト実行
```bash
# テスト実行（現在は未実装）
npm test
```

## システム確認
```bash
# Node.jsバージョン確認
node --version

# npm バージョン確認
npm --version

# インストール済みパッケージ確認
npm list
```