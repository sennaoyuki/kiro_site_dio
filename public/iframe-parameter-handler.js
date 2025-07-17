/**
 * パラメータベースのiframeメッセージハンドラー
 * parameter_noベースのデータをiframeコンポーネントに配信
 */
class IframeParameterHandler {
    constructor() {
        this.iframes = new Map();
        this.currentParameterNo = null;
        this.parameterData = null;
        this.isInitialized = false;
    }

    /**
     * 初期化
     */
    init() {
        // 全てのiframeを収集
        this.collectIframes();
        
        // メッセージリスナーの設定
        this.setupMessageListener();
        
        // パラメータ変更の監視
        this.observeParameterChanges();
        
        this.isInitialized = true;
        console.log('✅ IframeParameterHandler初期化完了');
    }

    /**
     * iframeの収集
     */
    collectIframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src || iframe.getAttribute('data-src');
            if (src) {
                const key = this.getIframeKey(src);
                this.iframes.set(key, iframe);
            }
        });
        console.log(`📋 ${this.iframes.size}個のiframeを検出`);
    }

    /**
     * iframeのキーを取得
     */
    getIframeKey(src) {
        const url = new URL(src, window.location.href);
        return url.pathname.split('/').pop().replace('.html', '');
    }

    /**
     * メッセージリスナーの設定
     */
    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // セキュリティチェック
            if (!this.isValidOrigin(event.origin)) {
                return;
            }

            const data = event.data;
            if (!data || typeof data !== 'object') {
                return;
            }

            // メッセージタイプに応じた処理
            switch (data.type) {
                case 'requestParameterData':
                    this.handleParameterDataRequest(event);
                    break;
                case 'parameterNavigation':
                    this.handleParameterNavigation(data);
                    break;
                case 'debugParameter':
                    this.handleDebugRequest(data);
                    break;
            }
        });
    }

    /**
     * オリジンの検証
     */
    isValidOrigin(origin) {
        // 同一オリジン
        if (origin === window.location.origin) return true;
        
        // ローカルファイル
        if (origin === 'file://') return true;
        
        // Vercel環境
        if (origin.includes('vercel.app') || origin.includes('vercel.sh')) return true;
        
        // 開発環境
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
        
        return false;
    }

    /**
     * パラメータデータリクエストの処理
     */
    handleParameterDataRequest(event) {
        if (!this.parameterData) {
            console.warn('⚠️ パラメータデータが利用できません');
            return;
        }

        // リクエスト元のiframeにデータを送信
        event.source.postMessage({
            type: 'parameterDataResponse',
            parameterNo: this.currentParameterNo,
            data: this.parameterData,
            timestamp: Date.now()
        }, event.origin);
    }

    /**
     * パラメータベースのナビゲーション処理
     */
    handleParameterNavigation(data) {
        if (data.parameterNo && window.rankingSyncSystem) {
            // パラメータモードに切り替え
            window.rankingSyncSystem.switchToParameterMode(data.parameterNo);
        }
    }

    /**
     * デバッグリクエストの処理
     */
    handleDebugRequest(data) {
        console.log('🐛 Parameter Debug:', {
            currentParameterNo: this.currentParameterNo,
            hasData: !!this.parameterData,
            iframeCount: this.iframes.size
        });
    }

    /**
     * パラメータ変更の監視
     */
    observeParameterChanges() {
        // ランキングシステムから通知を受ける
        if (window.rankingSyncSystem && window.rankingSyncSystem.parameterHandler) {
            window.rankingSyncSystem.parameterHandler.addChangeListener((newParameterNo) => {
                this.updateParameter(newParameterNo);
            });
        }

        // URLパラメータの変更を監視
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const parameterNo = urlParams.get('parameter_no');
            if (parameterNo) {
                this.updateParameter(parameterNo);
            }
        });
    }

    /**
     * パラメータの更新
     */
    updateParameter(parameterNo) {
        this.currentParameterNo = parameterNo;
        
        // ランキングシステムからデータを取得
        if (window.rankingSyncSystem && window.rankingSyncSystem.parameterRankingEngine) {
            this.parameterData = window.rankingSyncSystem.parameterRankingEngine.generateRankingForParameter(parameterNo);
            this.broadcastParameterUpdate();
        }
    }

    /**
     * 全iframeにパラメータ更新を配信
     */
    broadcastParameterUpdate() {
        if (!this.parameterData) return;

        console.log(`📢 パラメータ ${this.currentParameterNo} の更新を全iframeに配信`);

        this.iframes.forEach((iframe, key) => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'parameterChanged',
                    parameterNo: this.currentParameterNo,
                    data: this.parameterData,
                    timestamp: Date.now()
                }, '*');
            } catch (error) {
                console.error(`❌ iframe ${key} への配信に失敗:`, error);
            }
        });
    }

    /**
     * 特定のiframeにデータを送信
     */
    sendDataToIframe(iframeKey, data) {
        const iframe = this.iframes.get(iframeKey);
        if (!iframe) {
            console.warn(`⚠️ iframe ${iframeKey} が見つかりません`);
            return;
        }

        try {
            iframe.contentWindow.postMessage({
                type: 'parameterData',
                ...data,
                timestamp: Date.now()
            }, '*');
        } catch (error) {
            console.error(`❌ iframe ${iframeKey} へのデータ送信に失敗:`, error);
        }
    }

    /**
     * iframeのURLにパラメータを追加
     */
    updateIframeUrls(parameterNo) {
        this.iframes.forEach((iframe, key) => {
            const currentSrc = iframe.src;
            if (!currentSrc) return;

            try {
                const url = new URL(currentSrc);
                url.searchParams.set('parameter_no', parameterNo);
                iframe.src = url.toString();
            } catch (error) {
                console.error(`❌ iframe ${key} のURL更新に失敗:`, error);
            }
        });
    }

    /**
     * デバッグ情報を出力
     */
    debug() {
        console.log('🔍 IframeParameterHandler Debug Info:');
        console.log('- Current Parameter:', this.currentParameterNo);
        console.log('- Has Data:', !!this.parameterData);
        console.log('- Iframes:', Array.from(this.iframes.keys()));
        if (this.parameterData) {
            console.log('- Clinics:', this.parameterData.clinics.map(c => c.clinic_name));
        }
    }
}

// グローバルスコープにエクスポート
window.iframeParameterHandler = new IframeParameterHandler();

// DOMContentLoaded後に初期化
document.addEventListener('DOMContentLoaded', () => {
    window.iframeParameterHandler.init();
});

// デバッグ用グローバル関数
window.debugParameter = () => {
    window.iframeParameterHandler.debug();
};