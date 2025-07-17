/**
 * パラメータ番号のURLパラメータハンドラー
 * parameter_noパラメータの取得、検証、更新を管理
 */
class ParameterHandler {
    constructor() {
        this.currentParameterNo = null;
        this.validParameterRange = { min: 1, max: 63 };
        this.defaultParameterNo = '001';
        this.listeners = [];
    }

    /**
     * 初期化
     */
    init() {
        this.setupUrlParameterHandling();
        this.setupBrowserHistoryHandling();
        this.loadInitialParameter();
    }

    /**
     * URLパラメータハンドリングのセットアップ
     */
    setupUrlParameterHandling() {
        // URLが変更された時の処理
        window.addEventListener('popstate', () => {
            const newParameterNo = this.getParameterNoFromUrl();
            if (newParameterNo !== this.currentParameterNo) {
                this.setCurrentParameter(newParameterNo);
                this.notifyListeners();
            }
        });
    }

    /**
     * ブラウザ履歴ハンドリングのセットアップ
     */
    setupBrowserHistoryHandling() {
        // ブラウザの戻る/進むボタンに対応
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(history, arguments);
            window.dispatchEvent(new Event('pushstate'));
        };

        history.replaceState = function() {
            originalReplaceState.apply(history, arguments);
            window.dispatchEvent(new Event('replacestate'));
        };

        window.addEventListener('pushstate', () => {
            const newParameterNo = this.getParameterNoFromUrl();
            if (newParameterNo !== this.currentParameterNo) {
                this.setCurrentParameter(newParameterNo);
                this.notifyListeners();
            }
        });
    }

    /**
     * 初期パラメータの読み込み
     */
    loadInitialParameter() {
        const parameterNo = this.getParameterNoFromUrl();
        this.setCurrentParameter(parameterNo || this.defaultParameterNo);
    }

    /**
     * URLからparameter_noを取得
     */
    getParameterNoFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('parameter_no');
    }

    /**
     * URLを指定したparameter_noで更新
     */
    updateUrlWithParameterNo(parameterNo, replaceState = false) {
        const url = new URL(window.location);
        
        if (parameterNo) {
            url.searchParams.set('parameter_no', parameterNo);
        } else {
            url.searchParams.delete('parameter_no');
        }

        if (replaceState) {
            window.history.replaceState({}, '', url);
        } else {
            window.history.pushState({}, '', url);
        }
    }

    /**
     * parameter_noの妥当性を検証
     */
    validateParameterNo(parameterNo) {
        if (!parameterNo) return false;
        
        // 数値として解析
        const numValue = parseInt(parameterNo);
        
        // 範囲チェック
        if (isNaN(numValue) || 
            numValue < this.validParameterRange.min || 
            numValue > this.validParameterRange.max) {
            return false;
        }
        
        return true;
    }

    /**
     * 現在のパラメータを設定
     */
    setCurrentParameter(parameterNo) {
        if (this.validateParameterNo(parameterNo)) {
            // 3桁のゼロパディング形式に統一
            this.currentParameterNo = parameterNo.padStart(3, '0');
        } else {
            this.currentParameterNo = this.defaultParameterNo;
        }
    }

    /**
     * 現在のパラメータ番号を取得
     */
    getCurrentParameterNo() {
        return this.currentParameterNo;
    }

    /**
     * パラメータを変更
     */
    changeParameter(parameterNo) {
        if (this.validateParameterNo(parameterNo)) {
            const paddedNo = parameterNo.padStart(3, '0');
            this.setCurrentParameter(paddedNo);
            this.updateUrlWithParameterNo(paddedNo);
            this.notifyListeners();
            return true;
        }
        return false;
    }

    /**
     * 変更リスナーを追加
     */
    addChangeListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 変更リスナーを削除
     */
    removeChangeListener(callback) {
        this.listeners = this.listeners.filter(listener => listener !== callback);
    }

    /**
     * リスナーに通知
     */
    notifyListeners() {
        const currentParameter = this.getCurrentParameterNo();
        this.listeners.forEach(listener => {
            try {
                listener(currentParameter);
            } catch (error) {
                console.error('Error in parameter change listener:', error);
            }
        });
    }

    /**
     * デフォルトパラメータにリセット
     */
    resetToDefault() {
        this.changeParameter(this.defaultParameterNo);
    }

    /**
     * 次のパラメータに移動
     */
    nextParameter() {
        const current = parseInt(this.currentParameterNo);
        if (current < this.validParameterRange.max) {
            this.changeParameter(String(current + 1));
        }
    }

    /**
     * 前のパラメータに移動
     */
    previousParameter() {
        const current = parseInt(this.currentParameterNo);
        if (current > this.validParameterRange.min) {
            this.changeParameter(String(current - 1));
        }
    }
}

// グローバルスコープにエクスポート
window.ParameterHandler = ParameterHandler;