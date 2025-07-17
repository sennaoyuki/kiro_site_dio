/**
 * パラメータシステムのエラーハンドリング
 * 各種エラーケースに対するフォールバック処理を提供
 */
class ParameterErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 100;
        this.fallbackStrategies = {
            'CSV_LOAD_ERROR': this.handleCsvLoadError.bind(this),
            'INVALID_PARAMETER': this.handleInvalidParameter.bind(this),
            'MISSING_DATA': this.handleMissingData.bind(this),
            'SYNC_ERROR': this.handleSyncError.bind(this),
            'NETWORK_ERROR': this.handleNetworkError.bind(this)
        };
    }

    /**
     * エラーを記録
     */
    logError(errorType, details, context = {}) {
        const error = {
            type: errorType,
            details: details,
            context: context,
            timestamp: new Date().toISOString(),
            resolved: false
        };

        this.errors.push(error);
        
        // エラー数の上限を管理
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        console.error(`❌ [${errorType}]`, details, context);
        
        // 自動回復を試みる
        this.attemptRecovery(error);
        
        return error;
    }

    /**
     * エラーからの自動回復を試みる
     */
    attemptRecovery(error) {
        const strategy = this.fallbackStrategies[error.type];
        if (strategy) {
            try {
                strategy(error);
                error.resolved = true;
                console.log(`✅ [${error.type}] エラーから回復しました`);
            } catch (recoveryError) {
                console.error(`❌ [${error.type}] 回復処理が失敗しました:`, recoveryError);
            }
        }
    }

    /**
     * CSV読み込みエラーの処理
     */
    handleCsvLoadError(error) {
        console.warn('⚠️ CSVファイルの読み込みに失敗しました。デフォルトデータを使用します。');
        
        // デフォルトデータの生成（実際のクリニック名を使用）
        const defaultData = {
            clinics: new Map([
                [1, { clinic_id: 1, clinic_name: 'DIO', code: 'dio' }],
                [2, { clinic_id: 2, clinic_name: 'エミナルクリニック', code: 'eminal' }],
                [3, { clinic_id: 3, clinic_name: 'ウララクリニック', code: 'urara' }],
                [4, { clinic_id: 4, clinic_name: 'リエートクリニック', code: 'lieto' }],
                [5, { clinic_id: 5, clinic_name: '湘南美容クリニック', code: 'sbc' }]
            ]),
            rankings: new Map([
                ['001', { parameter_no: '001', no1: 1, no2: 2, no3: 3, no4: 4, no5: 5 }]
            ]),
            stores: new Map(),
            regions: new Map([
                ['001', { parameter_no: '001', region: '北海道' }]
            ])
        };

        // グローバルオブジェクトにデフォルトデータを設定
        if (window.rankingSyncSystem && window.rankingSyncSystem.parameterRankingEngine) {
            window.rankingSyncSystem.parameterRankingEngine.clinicData = defaultData.clinics;
            window.rankingSyncSystem.parameterRankingEngine.rankingData = defaultData.rankings;
            window.rankingSyncSystem.parameterRankingEngine.storeData = defaultData.stores;
            window.rankingSyncSystem.parameterRankingEngine.regionData = defaultData.regions;
        }

        return defaultData;
    }

    /**
     * 無効なパラメータエラーの処理
     */
    handleInvalidParameter(error) {
        const defaultParameterNo = '001';
        console.warn(`⚠️ 無効なパラメータ: ${error.context.parameterNo}。デフォルト値 ${defaultParameterNo} を使用します。`);
        
        // デフォルトパラメータにリダイレクト
        if (window.rankingSyncSystem) {
            window.rankingSyncSystem.switchToParameterMode(defaultParameterNo);
        }
        
        // URLを更新
        const url = new URL(window.location);
        url.searchParams.set('parameter_no', defaultParameterNo);
        window.history.replaceState({}, '', url);
        
        return defaultParameterNo;
    }

    /**
     * データ欠損エラーの処理
     */
    handleMissingData(error) {
        console.warn('⚠️ 必要なデータが見つかりません。代替データを使用します。');
        
        // 地域モードへフォールバック
        if (window.rankingSyncSystem && window.rankingSyncSystem.switchToRegionMode) {
            window.rankingSyncSystem.switchToRegionMode('012'); // デフォルト地域（千葉）
        }
    }

    /**
     * 同期エラーの処理
     */
    handleSyncError(error) {
        console.warn('⚠️ コンポーネント同期エラー。個別更新を試みます。');
        
        // 個別のiframeを再読み込み
        if (error.context.iframeKey && window.iframeParameterHandler) {
            const iframe = window.iframeParameterHandler.iframes.get(error.context.iframeKey);
            if (iframe) {
                // 現在のsrcを保存
                const currentSrc = iframe.src;
                // srcを一時的にクリアして再設定（再読み込みを強制）
                iframe.src = 'about:blank';
                setTimeout(() => {
                    iframe.src = currentSrc;
                }, 100);
            }
        }
    }

    /**
     * ネットワークエラーの処理
     */
    handleNetworkError(error) {
        console.warn('⚠️ ネットワークエラー。再試行します。');
        
        // リトライロジック
        const maxRetries = 3;
        const retryDelay = 1000; // 1秒
        
        let retryCount = error.context.retryCount || 0;
        if (retryCount < maxRetries) {
            setTimeout(() => {
                if (error.context.retryFunction) {
                    error.context.retryFunction();
                }
            }, retryDelay * (retryCount + 1));
            
            error.context.retryCount = retryCount + 1;
        } else {
            console.error('❌ 最大再試行回数に達しました。');
            this.handleMissingData(error);
        }
    }

    /**
     * エラーハンドリングのラッパー関数
     */
    async wrapAsync(fn, errorType = 'UNKNOWN_ERROR') {
        try {
            return await fn();
        } catch (error) {
            this.logError(errorType, error.message, { error });
            throw error;
        }
    }

    /**
     * エラーハンドリングのラッパー関数（同期版）
     */
    wrap(fn, errorType = 'UNKNOWN_ERROR') {
        try {
            return fn();
        } catch (error) {
            this.logError(errorType, error.message, { error });
            throw error;
        }
    }

    /**
     * エラー統計の取得
     */
    getErrorStats() {
        const stats = {
            total: this.errors.length,
            byType: {},
            resolved: 0,
            unresolved: 0,
            recent: this.errors.slice(-10)
        };

        this.errors.forEach(error => {
            stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
            if (error.resolved) {
                stats.resolved++;
            } else {
                stats.unresolved++;
            }
        });

        return stats;
    }

    /**
     * エラーログのクリア
     */
    clearErrors() {
        this.errors = [];
        console.log('✅ エラーログをクリアしました');
    }

    /**
     * ユーザーへのエラー通知
     */
    notifyUser(message, type = 'error') {
        // 既存の通知要素を削除
        const existingNotification = document.getElementById('parameter-error-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 新しい通知要素を作成
        const notification = document.createElement('div');
        notification.id = 'parameter-error-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background-color: ${type === 'error' ? '#f44336' : '#ff9800'};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: sans-serif;
            font-size: 14px;
            max-width: 300px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // 5秒後に自動削除
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}

// グローバルスコープにエクスポート
window.parameterErrorHandler = new ParameterErrorHandler();

// 未処理のエラーをキャッチ
window.addEventListener('error', (event) => {
    if (event.filename && event.filename.includes('parameter')) {
        window.parameterErrorHandler.logError('RUNTIME_ERROR', event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    }
});

// Promise rejectionをキャッチ
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.toString().includes('parameter')) {
        window.parameterErrorHandler.logError('PROMISE_REJECTION', event.reason.toString(), {
            promise: event.promise
        });
    }
});

// デバッグ用グローバル関数
window.showParameterErrors = () => {
    console.table(window.parameterErrorHandler.getErrorStats());
};

window.clearParameterErrors = () => {
    window.parameterErrorHandler.clearErrors();
};