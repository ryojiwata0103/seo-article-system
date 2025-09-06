# コードベース構造

## ディレクトリ構成
```
seo-article-system/
├── README.md                              # プロジェクト概要
├── package.json                           # Node.js設定
├── config/                                # 設定ファイル
│   ├── rules/
│   │   └── article_quality_rules.md      # 品質ルール（232行）
│   └── templates/
│       ├── section_prompts.json          # セクションプロンプト
│       ├── article_modification_prompts.json # 修正プロンプト
│       └── final_article_format.md       # 記事フォーマット
├── tools/                                 # メインツール
│   ├── excel_analyzer.js                 # Excel解析エンジン
│   ├── article_generator.js              # 記事生成エンジン  
│   └── article_modifier.js               # 記事修正ツール
├── customers/                             # 顧客データ保存
├── output/                                # 記事出力先
└── docs/                                  # システム文書
    ├── integration_summary.md            # 統合完了レポート
    └── project_completion.md             # 開発完了レポート
```

## 主要ファイルの役割
- **tools/excel_analyzer.js**: 発注書Excelを解析し顧客情報を抽出
- **tools/article_generator.js**: 11ステップで記事作成プロンプトを生成
- **tools/article_modifier.js**: 既存記事を修正・品質向上
- **config/rules/article_quality_rules.md**: 記事品質ルールの定義
- **config/templates/**: 各種プロンプトテンプレート保存

## 出力ディレクトリ構造
```
output/[G-ID]/content_[番号]/
├── article_creation_guide.md        # 記事作成総合ガイド
├── reference_collection.md          # 参考URL収集プロンプト
├── section_1.md                    # セクション1プロンプト
├── section_2.md                    # セクション2プロンプト
├── section_3.md                    # セクション3プロンプト
├── summary_section.md              # まとめセクションプロンプト
├── introduction.md                 # 導入文プロンプト
├── title_generation.md             # タイトル生成プロンプト
└── meta_description.md             # メタディスクリプションプロンプト
```

## 顧客データ構造
```
customers/[G-ID]/
├── customer_prompt.md              # 顧客理解プロンプト
├── keywords/                       # キーワード情報
└── articles/                       # 生成記事保存
```