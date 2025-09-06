const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

/**
 * エクセルファイル解析・クライアントディレクトリ生成システム
 * 発注書形式対応（複数企業対応）
 */
class ExcelAnalyzer {
    constructor(projectRoot = '/home/general/seo-article-system') {
        this.projectRoot = projectRoot;
        this.customersDir = path.join(projectRoot, 'customers');
        this.outputDir = path.join(projectRoot, 'output');
        this.templates = this.loadTemplates();
    }

    loadTemplates() {
        try {
            const templatesPath = path.join(this.projectRoot, 'config/templates/section_prompts.json');
            return JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
        } catch (error) {
            console.error('テンプレートの読み込みに失敗:', error.message);
            return {};
        }
    }

    /**
     * エクセルファイルを解析してクライアント情報を抽出
     * @param {string} excelFilePath - エクセルファイルのパス
     * @returns {Object} 解析結果
     */
    analyzeExcel(excelFilePath) {
        try {
            console.log(`📊 エクセルファイル解析開始: ${excelFilePath}`);
            
            const workbook = XLSX.readFile(excelFilePath);
            
            // 各シートの解析
            const customerInfo = this.extractCustomerInfo(workbook);
            const keywordInfo = this.extractKeywordInfo(workbook);
            const articleRules = this.extractArticleRules(workbook);
            
            const result = {
                customerInfo,
                keywordInfo,
                articleRules,
                analysis_timestamp: new Date().toISOString(),
                source_file: excelFilePath
            };

            console.log(`✅ 解析完了 - G-ID: ${customerInfo.gid}, 企業: ${customerInfo.company_name}`);
            return result;

        } catch (error) {
            console.error('❌ エクセル解析エラー:', error.message);
            throw error;
        }
    }

    /**
     * 共有事項シートから顧客情報を抽出
     */
    extractCustomerInfo(workbook) {
        const sheet = workbook.Sheets['共有事項'];
        if (!sheet) throw new Error('「共有事項」シートが見つかりません');

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        const customerInfo = {
            spid: this.findValueByKey(data, 'SPID'),
            gid: this.findValueByKey(data, 'G-ID'),
            order_id: this.findValueByKey(data, '受注ID'),
            company_name: this.extractCompanyName(this.findValueByKey(data, '受注ID')),
            first_person: this.findValueByKey(data, '一人称'),
            target_business: this.findValueByKey(data, 'お客様ビジネスのターゲットは？'),
            service_features: this.findValueByKey(data, 'お客様サービスの特徴'),
            qualifications: this.findValueByKey(data, '資格の有無')
        };

        return customerInfo;
    }

    /**
     * KW情報シートからキーワード情報を抽出
     */
    extractKeywordInfo(workbook) {
        const sheet = workbook.Sheets['KW情報'];
        if (!sheet) throw new Error('「KW情報」シートが見つかりません');

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const keywordInfo = {};
        
        let currentContent = null;
        
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (!row || row.length === 0) continue;
            
            // コンテンツ番号の検出
            if (row[0] && row[0].toString().startsWith('コンテンツ')) {
                currentContent = row[0];
                keywordInfo[currentContent] = {
                    target_keywords: row[2] || '',
                    needs_keywords: [],
                    headlines: []
                };
                continue;
            }
            
            if (currentContent && row[1]) {
                const keywordType = row[1].toString();
                
                if (keywordType.includes('ニーズKW')) {
                    keywordInfo[currentContent].needs_keywords.push({
                        type: keywordType,
                        keyword: row[2] || '',
                        headline: row[3] || ''
                    });
                }
            }
        }
        
        return keywordInfo;
    }

    /**
     * 記事ルールシートからルール情報を抽出
     */
    extractArticleRules(workbook) {
        const sheet = workbook.Sheets['記事ルール'];
        if (!sheet) return {};

        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const rules = {};

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row && row[0]) {
                rules[row[0]] = {
                    word_count: row[1] || '',
                    kw_rules: row[2] || '',
                    points: row[4] || ''
                };
            }
        }

        return rules;
    }

    /**
     * クライアント用ディレクトリ構造を生成
     */
    async createClientDirectory(analysisResult) {
        const { customerInfo, keywordInfo } = analysisResult;
        const gid = customerInfo.gid;
        
        if (!gid) throw new Error('G-IDが取得できません');

        const clientDir = path.join(this.customersDir, gid);
        const clientOutputDir = path.join(this.outputDir, gid);

        // ディレクトリ作成
        await this.ensureDirectoryExists(clientDir);
        await this.ensureDirectoryExists(clientOutputDir);
        await this.ensureDirectoryExists(path.join(clientDir, 'keywords'));
        await this.ensureDirectoryExists(path.join(clientDir, 'references'));

        // 顧客プロンプトの生成と保存
        const customerPrompt = this.generateCustomerPrompt(customerInfo);
        fs.writeFileSync(path.join(clientDir, 'customer_prompt.md'), customerPrompt);

        // キーワード情報の保存
        for (const [contentKey, contentData] of Object.entries(keywordInfo)) {
            const keywordFile = path.join(clientDir, 'keywords', `${contentKey.toLowerCase().replace(/\s+/g, '_')}.json`);
            fs.writeFileSync(keywordFile, JSON.stringify(contentData, null, 2));
        }

        // 解析結果の保存
        const analysisFile = path.join(clientDir, 'analysis_result.json');
        fs.writeFileSync(analysisFile, JSON.stringify(analysisResult, null, 2));

        console.log(`✅ クライアントディレクトリ生成完了: ${clientDir}`);
        return clientDir;
    }

    /**
     * 顧客プロンプトの生成
     */
    generateCustomerPrompt(customerInfo) {
        const companyName = customerInfo.company_name || '企業名未設定';
        const serviceName = customerInfo.first_person || 'サービス名未設定';
        
        return `# ${companyName} - 顧客理解プロンプト

**G-ID**: ${customerInfo.gid}  
**企業名**: ${companyName}  
**サービス**: ${serviceName}  
**一人称**: ${customerInfo.first_person}

## 企業概要

### ターゲット顧客
${customerInfo.target_business}

### サービス特徴
${customerInfo.service_features}

## 記事作成時の重要ポイント

### 1. 課題への共感
ターゲット顧客の課題に寄り添った内容作成

### 2. サービス価値訴求
${serviceName}の特徴を自然に織り込み

### 3. 実用性の強調
すぐに使える実装レベルの情報提供

### 4. 自社誘導の自然な表現
競合他社への誘導を避け、${serviceName}への自然な誘導

## 文章トーン

### 基調
- **専門的かつ親しみやすい**
- **課題解決志向**  
- **実用性重視**

### 避けるべきトーン
- 押し売り感のある表現
- 過度に技術的すぎる説明
- 他社を批判するような比較表現

---

**作成日**: ${new Date().toISOString().split('T')[0]}  
**対象**: ${customerInfo.gid} ${companyName}  
**サービス**: ${serviceName}`;
    }

    // ヘルパーメソッド
    findValueByKey(data, key) {
        for (const row of data) {
            if (row && row[0] === key && row[1]) {
                return row[1];
            }
        }
        return '';
    }

    extractCompanyName(orderId) {
        if (typeof orderId === 'string' && orderId.includes('_')) {
            const parts = orderId.split('_');
            return parts[parts.length - 1] || '';
        }
        return '';
    }

    async ensureDirectoryExists(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    }
}

// CLIインターフェース
if (require.main === module) {
    const analyzer = new ExcelAnalyzer();
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('使用方法: node excel_analyzer.js [エクセルファイルパス]');
        process.exit(1);
    }

    const excelPath = args[0];
    
    const result = analyzer.analyzeExcel(excelPath);
    analyzer.createClientDirectory(result)
        .then(clientDir => {
            console.log('🎉 セットアップ完了!');
            console.log(`📁 クライアントディレクトリ: ${clientDir}`);
        })
        .catch(error => {
            console.error('❌ エラー:', error.message);
            process.exit(1);
        });
}

module.exports = ExcelAnalyzer;