// 統一ランキング同期システム
// CSVデータベースに基づいて全ページのランキングを統一

class RankingSyncSystem {
    constructor() {
        this.currentRegionData = null;
        this.isInitialized = false;
        this.defaultRegionId = '012'; // 千葉をデフォルト
    }

    // 初期化
    async init() {
        console.log('🔧 統一ランキング同期システムを初期化中...');
        
        // 依存関係の確認
        await this.waitForDependencies();
        
        // 初期データの読み込み (URLパラメータのregion_idを優先)
        this.loadInitialDataFromUrlOrDefault();
        
        this.isInitialized = true;
        console.log('✅ 統一ランキング同期システムが準備完了');
        
        // 地域変更イベントの監視
        this.setupEventListeners();
        
        // 初期更新の実行
        setTimeout(() => {
            this.updateAllPages();
        }, 500);
    }

    // 依存関係の待機
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.CLINIC_DATABASE_GENERATED && window.getClinicDataByRegionId) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // 5秒でタイムアウト
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('⚠️ 依存関係の読み込みがタイムアウトしました');
                resolve();
            }, 5000);
        });
    }

    // 初期データの読み込み (URLパラメータのregion_idを優先)
    loadInitialDataFromUrlOrDefault() {
        const urlParams = new URLSearchParams(window.location.search);
        const regionIdFromUrl = urlParams.get('region_id');

        let targetRegionId = this.defaultRegionId;

        if (regionIdFromUrl && window.CLINIC_DATABASE_GENERATED[regionIdFromUrl]) {
            targetRegionId = regionIdFromUrl;
            console.log(`📊 URLパラメータから地域IDを検出: ${targetRegionId}`);
        } else if (regionIdFromUrl) {
            console.warn(`⚠️ URLパラメータの地域ID ${regionIdFromUrl} は無効です。デフォルト地域を使用します。`);
        }

        if (window.CLINIC_DATABASE_GENERATED && window.CLINIC_DATABASE_GENERATED[targetRegionId]) {
            this.currentRegionData = window.CLINIC_DATABASE_GENERATED[targetRegionId];
            console.log(`📊 初期データ読み込み完了: ${this.currentRegionData.name} (ID: ${targetRegionId})`);
        } else {
            console.warn('⚠️ 初期データの読み込みに失敗しました。データベースまたはデフォルト地域IDを確認してください。');
        }
    }

    // イベントリスナーの設定
    setupEventListeners() {
        // 地域変更イベント
        window.addEventListener('regionChanged', (event) => {
            console.log('🔄 地域変更イベントを受信:', event.detail);
            this.handleRegionChange(event.detail);
        });

        // カスタムランキング更新イベント
        window.addEventListener('updateRankings', (event) => {
            console.log('🔄 ランキング更新イベントを受信');
            this.updateAllPages();
        });
    }

    // 地域変更の処理
    handleRegionChange(eventDetail) {
        const regionId = eventDetail.regionId || this.getRegionIdFromKey(eventDetail.region);
        
        if (regionId && window.CLINIC_DATABASE_GENERATED[regionId]) {
            this.currentRegionData = window.CLINIC_DATABASE_GENERATED[regionId];
            this.updateAllPages();
        }
    }

    // 地域キーからIDを取得
    getRegionIdFromKey(regionKey) {
        const keyMap = {
            'hokkaido': '001',
            'miyagi': '004',
            'chiba': '012',
            'tokyo': '013',
            'aichi': '023',
            'osaka': '027'
        };
        return keyMap[regionKey];
    }

    // 全ページの更新
    updateAllPages() {
        if (!this.currentRegionData) {
            console.warn('⚠️ 地域データが設定されていません');
            return;
        }

        console.log(`🔄 全ページを更新中: ${this.currentRegionData.name}`);

        // 各ページタイプごとに更新
        this.updateRankingResultsPage();
        this.updateComparisonTablePage();
        this.updateDetailedContentPage();
        
        console.log('✅ 全ページの更新が完了しました');
    }

    // 04_rankingresults.html の更新
    updateRankingResultsPage() {
        const rankingCards = document.querySelectorAll('.ranking-card');
        if (rankingCards.length === 0) return;

        console.log('📄 ランキング結果ページを更新中...');

        rankingCards.forEach((card, index) => {
            const clinic = this.currentRegionData.clinics[index];
            if (!clinic) return;

            // ランキングバッジの更新
            const badge = card.querySelector('.ranking-badge');
            if (badge) {
                const rankText = index === 0 ? '🏆 第1位 最もおすすめ' : `第${index + 1}位`;
                badge.textContent = rankText;
            }

            // クリニック名の更新
            const nameElement = card.querySelector('.clinic-name');
            if (nameElement) {
                const cleanName = clinic.name.replace(/ [^ ]*院$/, ''); // 院名の部分を削除
                nameElement.innerHTML = `${cleanName} <span data-region="name">${this.currentRegionData.name}</span>院（医療脱毛）`;
            }

            // 料金の更新
            const priceElements = card.querySelectorAll('.price-large');
            priceElements.forEach(element => {
                if (clinic.price) {
                    element.textContent = clinic.price.replace('月々', '');
                }
            });

            // キャンペーンの更新
            const campaignElements = card.querySelectorAll('.price-small');
            campaignElements.forEach(element => {
                if (clinic.campaign) {
                    element.textContent = clinic.campaign;
                }
            });
        });
    }

    // 06_comparisontable.html の更新
    updateComparisonTablePage() {
        const comparisonTableBody = document.querySelector('.comparison-table tbody');
        if (!comparisonTableBody) return;

        console.log('📄 比較表ページを更新中...');

        // 既存の行をクリア
        comparisonTableBody.innerHTML = '';

        this.currentRegionData.clinics.forEach((clinic, index) => {
            const row = document.createElement('tr');
            row.classList.add('clinic-row');

            const isRecommended = index === 0; // 1位を「おすすめ」とする

            row.innerHTML = `
                <td class="clinic-cell">
                    ${isRecommended ? '<div class="recommended-badge">おすすめ！</div>' : ''}
                    <div class="clinic-logo">${clinic.name.charAt(0)}</div>
                    <div class="clinic-name">${clinic.name.split(' ')[0]}</div>
                </td>
                <td class="clinic-cell">
                    <div class="feature-icon icon-red"><i class="fas fa-circle"></i></div>
                    <div class="price-text">${clinic.price}<br>${clinic.campaign ? clinic.campaign.replace('円', '') : ''}</div>
                </td>
                <td class="clinic-cell">
                    <div class="feature-icon icon-red"><i class="fas fa-circle"></i></div>
                    <div class="feature-text">脱毛効果95%以上</div>
                </td>
                <td class="clinic-cell">
                    <div class="feature-text">全国${clinic.features[1] ? clinic.features[1].match(/\d+/) : ''}院展開<br>${clinic.features[2] || ''}</div>
                </td>
                <td class="clinic-cell">
                    <button class="official-btn">
                        公式サイト
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </td>
            `;
            comparisonTableBody.appendChild(row);
        });
        this.setupDynamicEventListeners(); // 動的に生成された要素にイベントリスナーを設定
    }

    // 07_detailedcontent.html の更新
    updateDetailedContentPage() {
        const container = document.querySelector('.detailed-container');
        if (!container) return;

        console.log('📄 詳細コンテンツページを更新中...');

        // 既存のセクションをクリア
        container.innerHTML = '';

        this.currentRegionData.clinics.forEach((clinic, index) => {
            const section = document.createElement('div');
            section.classList.add('clinic-section');

            // clinic-database-generated.js のデータ構造に合わせて調整
            const clinicName = clinic.name.split(' ')[0];
            const clinicSubtitle = clinic.features[0] || ''; // 仮のサブタイトル

            section.innerHTML = `
                <div class="clinic-header" style="background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);">
                    <h2>${clinicName}</h2>
                    <div class="clinic-subtitle">${clinicSubtitle}</div>
                </div>

                <div class="banner-image">
                    <div class="banner-placeholder">
                        医療脱毛・全身脱毛
                        <div class="price-highlight">${clinic.price}から</div>
                    </div>
                </div>

                <div class="points-section">
                    <div class="points-header">ここがおすすめポイント！！</div>
                    
                    <div class="point-item">
                        <div class="point-title">${clinic.features[0] || 'ポイント1'}</div>
                        <div class="point-description">
                            ${clinic.features[1] || '説明1'}
                        </div>
                    </div>

                    <div class="point-item">
                        <div class="point-title">${clinic.features[2] || 'ポイント2'}</div>
                        <div class="point-description">
                            ${clinic.features[3] || '説明2'}
                        </div>
                    </div>

                    <div class="point-item">
                        <div class="point-title">${clinic.features[4] || 'ポイント3'}</div>
                        <div class="point-description">
                            ${clinic.features[5] || '説明3'}
                        </div>
                    </div>

                    <div class="action-buttons">
                        <a href="${clinic.url}" class="consultation-btn">
                            無料<br>カウンセリング<i class="fas fa-external-link-alt"></i><br>に進む
                        </a>
                        <button class="official-btn" onclick="window.open('${clinic.url}', '_blank')">
                            公式サイトを見る<i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- 基本情報テーブル (簡略化) -->
                <div class="basic-info-section">
                    <div class="table-header">${clinicName}の基本情報</div>
                    <div class="tab-navigation">
                        <button class="tab-btn active">価格</button>
                        <button class="tab-btn">脱毛部位</button>
                        <button class="tab-btn">通いやすさ</button>
                        <button class="tab-btn">サービス</button>
                    </div>
                    <div class="info-table">
                        <div class="table-row">
                            <div class="table-cell">全身脱毛5回</div>
                            <div class="table-cell price-text">${clinic.campaign || '価格情報なし'}</div>
                        </div>
                    </div>
                    <button class="more-btn">もっと見る</button>
                </div>

                <!-- 脱毛機器セクション (簡略化) -->
                <div class="equipment-section">
                    <div class="table-header">${clinicName}の脱毛機器</div>
                    <div class="equipment-item">
                        <div class="equipment-number">1</div>
                        <div class="equipment-image">脱毛機器</div>
                        <div class="equipment-details">
                            <div class="equipment-name">機器名</div>
                            <div class="equipment-specs">
                                <div class="spec-row">
                                    <div class="spec-label">タイプ</div>
                                    <div class="spec-value">タイプ情報</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 店舗検索セクション (簡略化) -->
                <div class="store-finder">
                    <div class="table-header">近くの店舗を探す</div>
                    <div class="region-item">
                        <span>${clinic.address.split(' ')[0]}</span>
                        <i class="fas fa-plus expand-icon"></i>
                    </div>
                </div>

                <div class="promotion-banner">
                    <div class="banner-ribbon">ご案内</div>
                    <div class="promotion-text">
                        【初回限定】<br>
                        脱毛満足度98.5% <span class="price-highlight-large">${clinic.price}から</span>
                    </div>
                    <div class="action-buttons">
                        <a href="${clinic.url}" class="consultation-btn">
                            無料<br>カウンセリング<i class="fas fa-external-link-alt"></i><br>に進む
                        </a>
                        <button class="official-btn" onclick="window.open('${clinic.url}', '_blank')">
                            公式サイトを見る<i class="fas fa-external-link-alt"></i>
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(section);
        });
        this.setupDynamicEventListeners(); // 動的に生成された要素にイベントリスナーを設定
    }

    // 新しいメソッドを追加 (動的に生成された要素のイベントリスナー設定用)
    setupDynamicEventListeners() {
        // Button animations
        document.querySelectorAll('.official-btn, .consultation-btn, .detail-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
        });

        // Store finder accordion (simulation)
        document.querySelectorAll('.region-item').forEach(item => {
            item.addEventListener('click', function() {
                const icon = this.querySelector('.expand-icon');
                if (icon) { // iconが存在するか確認
                    if (icon.classList.contains('fa-plus')) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    } else {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                }
            });
        });

        // Tab switching functionality for basic-info-section
        document.querySelectorAll('.basic-info-section .tab-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all tabs in the same navigation
                const navigation = this.parentElement;
                navigation.querySelectorAll('.tab-btn').forEach(tab => {
                    tab.classList.remove('active');
                });
                
                // Add active class to clicked tab
                this.classList.add('active');
            });
        });
    }

    // 地域名の更新（全ページ共通）
    updateRegionNames() {
        const regionElements = document.querySelectorAll('[data-region="name"]');
        regionElements.forEach(element => {
            element.textContent = this.currentRegionData.name;
        });
    }

    // 現在のランキング情報を取得
    getCurrentRanking() {
        return this.currentRegionData;
    }

    // デバッグ用：現在のランキングをコンソールに表示
    logCurrentRanking() {
        if (!this.currentRegionData) {
            console.log('❌ ランキングデータが読み込まれていません');
            return;
        }

        console.log(`\n📊 === ${this.currentRegionData.name} 地域の統一ランキング ===`);
        this.currentRegionData.clinics.forEach((clinic, index) => {
            console.log(`${index + 1}位: ${clinic.name}`);
            console.log(`     💰 ${clinic.price} | 📢 ${clinic.campaign}`);
        });
        console.log('='.repeat(50));
    }

    // 特定地域のデータを手動で更新
    updateRegion(regionId) {
        if (window.CLINIC_DATABASE_GENERATED && window.CLINIC_DATABASE_GENERATED[regionId]) {
            this.currentRegionData = window.CLINIC_DATABASE_GENERATED[regionId];
            this.updateAllPages();
            console.log(`🔄 手動で地域を更新: ${this.currentRegionData.name}`);
        } else {
            console.warn(`⚠️ 地域ID ${regionId} のデータが見つかりません`);
        }
    }
}

// グローバルインスタンス
window.rankingSyncSystem = new RankingSyncSystem();

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', async () => {
    await window.rankingSyncSystem.init();
});

// デバッグ用グローバル関数
window.showRanking = () => {
    window.rankingSyncSystem.logCurrentRanking();
};

window.updateToRegion = (regionId) => {
    window.rankingSyncSystem.updateRegion(regionId);
};

window.forceUpdate = () => {
    window.rankingSyncSystem.updateAllPages();
};