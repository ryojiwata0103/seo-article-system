#!/bin/bash

# SEOスラッシュコマンドシステム用MCPサーバーインストールスクリプト
# 実行方法: bash install-mcp-servers.sh [--core-only|--all]

set -e

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ログ関数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# バージョンチェック関数
check_node_version() {
    log_info "Node.jsバージョンをチェック中..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.jsがインストールされていません"
        log_info "Node.js >= 16.0.0をインストールしてください"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | sed 's/v//')
    REQUIRED_VERSION="16.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_error "Node.js バージョン $NODE_VERSION は要件を満たしません"
        log_info "Node.js >= $REQUIRED_VERSION が必要です"
        exit 1
    fi
    
    log_success "Node.js バージョン $NODE_VERSION は要件を満たしています"
}

# npmキャッシュクリア
clear_npm_cache() {
    log_info "npmキャッシュをクリア中..."
    npm cache clean --force 2>/dev/null || true
    log_success "npmキャッシュクリア完了"
}

# MCPサーバーインストール関数
install_mcp_server() {
    local server_name=$1
    local package_name=$2
    local description=$3
    
    log_info "インストール中: $server_name"
    log_info "説明: $description"
    
    if npm list -g "$package_name" &>/dev/null; then
        log_warning "$server_name は既にインストールされています"
        return 0
    fi
    
    if npm install -g "$package_name"; then
        log_success "$server_name インストール完了"
        return 0
    else
        log_error "$server_name インストール失敗"
        return 1
    fi
}

# メイン実行
main() {
    echo "🚀 SEOスラッシュコマンドシステム MCP Setup"
    echo "========================================="
    
    # 引数処理
    INSTALL_MODE="core"
    if [[ "$1" == "--all" ]]; then
        INSTALL_MODE="all"
        log_info "モード: 全てのMCPサーバーをインストール"
    elif [[ "$1" == "--core-only" ]] || [[ -z "$1" ]]; then
        INSTALL_MODE="core"
        log_info "モード: コアMCPサーバーのみインストール"
    else
        log_error "使用方法: $0 [--core-only|--all]"
        exit 1
    fi
    
    echo
    
    # 事前チェック
    check_node_version
    clear_npm_cache
    
    echo
    log_info "MCPサーバーインストール開始..."
    
    # コアMCPサーバー（必須）
    CORE_SERVERS=(
        "serena @serena/mcp-server プロジェクト記憶・セッション永続化・シンボル操作"
        "sequential @sequential-thinking/mcp-server 段階的思考・複雑な分析・品質検証"
    )
    
    # オプショナルMCPサーバー
    OPTIONAL_SERVERS=(
        "context7 @context7/mcp-server 公式ライブラリドキュメント参照・フレームワークパターン"
        "morphllm @morphllm-fast-apply/mcp-server 大量テキスト処理・パターン適用・効率化"
        "magic @magic/21st-component-builder UIコンポーネント生成（記事管理画面用）"
    )
    
    FAILED_SERVERS=()
    
    # コアサーバーインストール
    log_info "=== コアMCPサーバー（必須）==="
    for server_info in "${CORE_SERVERS[@]}"; do
        IFS=' ' read -r name package description <<< "$server_info"
        if ! install_mcp_server "$name" "$package" "$description"; then
            FAILED_SERVERS+=("$name")
        fi
        echo
    done
    
    # オプショナルサーバーインストール
    if [[ "$INSTALL_MODE" == "all" ]]; then
        log_info "=== オプショナルMCPサーバー ==="
        for server_info in "${OPTIONAL_SERVERS[@]}"; do
            IFS=' ' read -r name package description <<< "$server_info"
            if ! install_mcp_server "$name" "$package" "$description"; then
                FAILED_SERVERS+=("$name")
            fi
            echo
        done
    fi
    
    # 結果サマリー
    echo "========================================="
    if [[ ${#FAILED_SERVERS[@]} -eq 0 ]]; then
        log_success "🎉 全てのMCPサーバーインストール完了!"
    else
        log_warning "⚠️  一部のMCPサーバーインストールに失敗:"
        for failed in "${FAILED_SERVERS[@]}"; do
            echo "  - $failed"
        done
    fi
    
    echo
    log_info "📋 次のステップ:"
    echo "  1. Claude Code設定ファイルを更新"
    echo "  2. MCPサーバー設定をClaude Codeに反映"
    echo "  3. /seo:help でコマンド動作確認"
    
    echo
    log_info "📄 設定ファイル場所:"
    echo "  - MCP設定: seo-article-system/config/mcp/claude_config.json"
    echo "  - 統合ガイド: seo-article-system/docs/MCP_INTEGRATION_GUIDE.md"
}

# ヘルプ表示
show_help() {
    cat << EOF
SEOスラッシュコマンドシステム MCP Setup

使用方法:
  $0 [オプション]

オプション:
  --core-only    コア機能のMCPサーバーのみインストール（デフォルト）
  --all          全てのMCPサーバーをインストール
  --help, -h     このヘルプを表示

コアMCPサーバー（必須）:
  - serena: プロジェクト記憶・セッション永続化
  - sequential: 段階的思考・品質検証

オプショナルMCPサーバー:
  - context7: 公式ドキュメント参照
  - morphllm: 大量テキスト処理
  - magic: UI管理画面構築

例:
  $0                # コアのみインストール
  $0 --core-only    # コアのみインストール
  $0 --all         # 全てインストール

EOF
}

# 引数チェック
if [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
    show_help
    exit 0
fi

# メイン実行
main "$@"