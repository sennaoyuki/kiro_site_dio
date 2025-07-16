/**
 * 拡張版ランキング同期システム
 * 既存の地域ベースシステムとパラメータベースシステムの両方をサポート
 */
class EnhancedRankingSyncSystem extends RankingSyncSystem {
    constructor() {
        super();
        this.parameterDataLoader = null;
        this.parameterHandler = null;
        this.parameterRankingEngine = null;
        this.isParameterMode = false;
        this.parameterData = null;
    }

    /**
     * システムの初期化（オーバーライド）
     */
    async init() {
        console.log('🔧 拡張版統一ランキング同期システムを初期化中...');
        
        // パラメータベースシステムの初期化
        await this.initParameterSystem();
        
        // URLパラメータをチェック
        const urlParams = new URLSearchParams(window.location.search);
        const parameterNo = urlParams.get('parameter_no');
        
        if (parameterNo && this.parameterHandler.validateParameterNo(parameterNo)) {
            // パラメータモードで起動
            this.isParameterMode = true;
            console.log(`📊 パラメータモードで起動: parameter_no=${parameterNo}`);
            await this.loadParameterData(parameterNo);
        } else {
            // 通常の地域モードで起動
            this.isParameterMode = false;
            await super.init();
        }
        
        // 追加のイベントリスナー設定
        this.setupParameterEventListeners();
    }

    /**
     * パラメータシステムの初期化
     */
    async initParameterSystem() {
        try {
            // データローダーの作成と初期化
            this.parameterDataLoader = new ParameterCSVDataLoader();
            const csvData = await this.parameterDataLoader.loadAllData();
            
            // ランキングエンジンの作成
            this.parameterRankingEngine = new ParameterRankingEngine(csvData);
            
            // パラメータハンドラーの作成と初期化
            this.parameterHandler = new ParameterHandler();
            this.parameterHandler.init();
            
            console.log('✅ パラメータシステムの初期化完了');
        } catch (error) {
            console.error('❌ パラメータシステムの初期化に失敗:', error);
            this.isParameterMode = false;
        }
    }

    /**
     * パラメータデータの読み込み
     */
    async loadParameterData(parameterNo) {
        try {
            this.parameterData = this.parameterRankingEngine.generateRankingForParameter(parameterNo);
            console.log(`📊 パラメータ ${parameterNo} のデータ読み込み完了`);
            
            // 初期更新の実行
            setTimeout(() => {
                this.updateAllPages();
            }, 500);
        } catch (error) {
            console.error('❌ パラメータデータの読み込みに失敗:', error);
            this.isParameterMode = false;
            // フォールバックとして通常モードに切り替え
            await super.init();
        }
    }

    /**
     * パラメータ用イベントリスナーの設定
     */
    setupParameterEventListeners() {
        // パラメータ変更時の処理
        if (this.parameterHandler) {
            this.parameterHandler.addChangeListener((newParameterNo) => {
                console.log(`🔄 パラメータ変更を検出: ${newParameterNo}`);
                this.isParameterMode = true;
                this.loadParameterData(newParameterNo);
            });
        }

        // URLパラメータの監視
        window.addEventListener('popstate', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const parameterNo = urlParams.get('parameter_no');
            const regionId = urlParams.get('region_id');
            
            if (parameterNo && this.parameterHandler.validateParameterNo(parameterNo)) {
                this.isParameterMode = true;
                this.loadParameterData(parameterNo);
            } else if (regionId) {
                this.isParameterMode = false;
                this.handleRegionChange({ regionId });
            }
        });
    }

    /**
     * 全ページの更新（オーバーライド）
     */
    updateAllPages() {
        if (this.isParameterMode) {
            this.updateAllPagesWithParameterData();
        } else {
            super.updateAllPages();
        }
    }

    /**
     * パラメータデータで全ページを更新
     */
    updateAllPagesWithParameterData() {
        if (!this.parameterData || !this.parameterData.clinics) {
            console.warn('⚠️ パラメータデータが設定されていません');
            return;
        }

        console.log(`🔄 全ページをパラメータデータで更新中: parameter_no=${this.parameterData.parameter_no}`);

        // レガシー形式に変換
        const legacyData = this.parameterRankingEngine.convertToLegacyFormat(this.parameterData);
        
        // 一時的に現在の地域データを保存してレガシーデータに置き換え
        const originalData = this.currentRegionData;
        this.currentRegionData = {
            name: `パラメータ${this.parameterData.parameter_no}`,
            clinics: legacyData.map(clinic => ({
                name: clinic.name,
                price: '月々1,900円',
                campaign: '77,000円',
                features: [
                    `クリニックコード: ${clinic.code}`,
                    `${clinic.stores.length}店舗`,
                    '医療脱毛',
                    '最新機器導入',
                    '全身脱毛対応',
                    '無料カウンセリング'
                ],
                url: '#',
                address: clinic.stores[0]?.address || '住所情報なし'
            }))
        };

        // 基底クラスの更新メソッドを呼び出し
        this.updateRankingResultsPage();
        this.updateComparisonTablePage();
        this.updateDetailedContentPageWithParameter();
        
        // 元のデータを復元
        this.currentRegionData = originalData;
        
        console.log('✅ パラメータデータでの全ページ更新が完了しました');
    }

    /**
     * パラメータデータ用の詳細コンテンツページ更新
     */
    updateDetailedContentPageWithParameter() {
        const container = document.querySelector('.detailed-container');
        if (!container) return;

        console.log('📄 詳細コンテンツページをパラメータデータで更新中...');

        // 既存のセクションをクリア
        container.innerHTML = '';

        this.parameterData.clinics.forEach((clinic, index) => {
            const section = document.createElement('div');
            section.classList.add('clinic-section');

            section.innerHTML = `
                <div class="clinic-header" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);">
                    <h2>${clinic.clinic_name}</h2>
                    <div class="clinic-subtitle">第${clinic.rank}位 - クリニックコード: ${clinic.code}</div>
                </div>

                <div class="banner-image">
                    <div class="banner-placeholder">
                        医療脱毛・全身脱毛
                        <div class="price-highlight">月々1,900円から</div>
                    </div>
                </div>

                <div class="points-section">
                    <div class="points-header">ここがおすすめポイント！！</div>
                    
                    <div class="point-item">
                        <div class="point-title">豊富な店舗数</div>
                        <div class="point-description">
                            ${clinic.clinic_name}は${clinic.stores.length}店舗を展開しています。
                        </div>
                    </div>

                    <div class="point-item">
                        <div class="point-title">アクセス便利</div>
                        <div class="point-description">
                            ${clinic.stores[0]?.access || '駅から徒歩圏内の好立地'}
                        </div>
                    </div>

                    <div class="point-item">
                        <div class="point-title">医療脱毛専門</div>
                        <div class="point-description">
                            医療機関による確かな脱毛技術を提供
                        </div>
                    </div>

                    <div class="action-buttons">
                        <a href="#" class="consultation-btn">
                            無料<br>カウンセリング<i class="fas fa-external-link-alt"></i><br>に進む
                        </a>
                        <button class="official-btn" onclick="alert('公式サイトへ遷移します')">
                            公式サイトを見る<i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- 店舗情報 -->
                <div class="store-finder">
                    <div class="table-header">${clinic.clinic_name}の店舗一覧</div>
                    ${clinic.stores.map(store => `
                        <div class="region-item">
                            <span>${store.store_name}</span>
                            <div class="store-details">
                                <p>〒${store.zipcode} ${store.address}</p>
                                <p>アクセス: ${store.access}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="promotion-banner">
                    <div class="banner-ribbon">ご案内</div>
                    <div class="promotion-text">
                        【初回限定】<br>
                        脱毛満足度98.5% <span class="price-highlight-large">月々1,900円から</span>
                    </div>
                    <div class="action-buttons">
                        <a href="#" class="consultation-btn">
                            無料<br>カウンセリング<i class="fas fa-external-link-alt"></i><br>に進む
                        </a>
                        <button class="official-btn" onclick="alert('公式サイトへ遷移します')">
                            公式サイトを見る<i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(section);
        });
        
        this.setupDynamicEventListeners();
    }

    /**
     * 現在の動作モードを取得
     */
    getCurrentMode() {
        return this.isParameterMode ? 'parameter' : 'region';
    }

    /**
     * パラメータモードへの切り替え
     */
    switchToParameterMode(parameterNo) {
        if (this.parameterHandler && this.parameterHandler.validateParameterNo(parameterNo)) {
            this.isParameterMode = true;
            this.parameterHandler.changeParameter(parameterNo);
            this.loadParameterData(parameterNo);
            return true;
        }
        return false;
    }

    /**
     * 地域モードへの切り替え
     */
    switchToRegionMode(regionId) {
        this.isParameterMode = false;
        // URLからparameter_noを削除
        const url = new URL(window.location);
        url.searchParams.delete('parameter_no');
        url.searchParams.set('region_id', regionId);
        window.history.pushState({}, '', url);
        
        this.updateRegion(regionId);
    }

    /**
     * デバッグ用：現在のランキングをコンソールに表示（オーバーライド）
     */
    logCurrentRanking() {
        if (this.isParameterMode) {
            if (!this.parameterData) {
                console.log('❌ パラメータデータが読み込まれていません');
                return;
            }

            console.log(`\n📊 === パラメータ ${this.parameterData.parameter_no} のランキング ===`);
            this.parameterData.clinics.forEach((clinic) => {
                console.log(`${clinic.rank}位: ${clinic.clinic_name} (ID: ${clinic.clinic_id})`);
                console.log(`     📍 ${clinic.stores.length}店舗展開`);
            });
            console.log('='.repeat(50));
        } else {
            super.logCurrentRanking();
        }
    }
}

// グローバルインスタンスを拡張版に置き換え
window.rankingSyncSystem = new EnhancedRankingSyncSystem();

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', async () => {
    await window.rankingSyncSystem.init();
});

// デバッグ用グローバル関数（追加）
window.switchToParameter = (parameterNo) => {
    return window.rankingSyncSystem.switchToParameterMode(parameterNo);
};

window.switchToRegion = (regionId) => {
    window.rankingSyncSystem.switchToRegionMode(regionId);
};

window.getCurrentMode = () => {
    return window.rankingSyncSystem.getCurrentMode();
};