// 統一ランキングシステム
// CSVデータベースと連携して全ページの順位を統一管理

class UnifiedRankingSystem {
    constructor() {
        this.isInitialized = false;
        this.currentRegionData = null;
    }

    // 初期化
    async init() {
        console.log('統一ランキングシステムを初期化中...');
        
        // region-config-generated.jsが読み込まれるまで待機
        await this.waitForDependencies();
        
        this.isInitialized = true;
        console.log('統一ランキングシステムの初期化完了');
        
        // 地域変更イベントをリッスン
        window.addEventListener('regionChanged', (event) => {
            this.updateAllRankings(event.detail);
        });

        // 初期データで更新
        this.loadInitialRankings();
    }

    // 依存関係の読み込み待機
    async waitForDependencies() {
        return new Promise((resolve) => {
            const checkDependencies = () => {
                if (window.CLINIC_DATABASE_GENERATED || window.getClinicDataByRegionId) {
                    resolve();
                } else {
                    setTimeout(checkDependencies, 100);
                }
            };
            checkDependencies();
        });
    }

    // 初期ランキングデータの読み込み
    loadInitialRankings() {
        // デフォルト地域（千葉）のデータを取得
        const defaultRegionId = '012'; // 千葉
        const regionData = this.getRegionRankingData(defaultRegionId);
        
        if (regionData) {
            this.updateAllRankings({
                region: 'chiba',
                regionId: defaultRegionId,
                data: regionData
            });
        }
    }

    // 地域IDからランキングデータを取得
    getRegionRankingData(regionId) {
        if (window.CLINIC_DATABASE_GENERATED && window.CLINIC_DATABASE_GENERATED[regionId]) {
            return window.CLINIC_DATABASE_GENERATED[regionId];
        }
        
        if (window.getClinicDataByRegionId) {
            return window.getClinicDataByRegionId(regionId, '地域名不明');
        }
        
        return null;
    }

    // 全ページのランキングを更新
    updateAllRankings(eventDetail) {
        console.log('全ページのランキングを更新:', eventDetail);
        
        const regionData = eventDetail.data || this.getRegionRankingData(eventDetail.regionId);
        if (!regionData || !regionData.clinics) {
            console.warn('ランキングデータが見つかりません');
            return;
        }

        this.currentRegionData = regionData;

        // 各ページタイプを判定して更新
        this.updateRankingResultsPage(regionData);
        this.updateComparisonTablePage(regionData);
        this.updateMainVisualPage(regionData);
        this.updateHeaderPage(regionData);
    }

    // ランキング結果ページ（04_rankingresults.html）を更新
    updateRankingResultsPage(regionData) {
        const rankingCards = document.querySelectorAll('.ranking-card');
        if (rankingCards.length === 0) return;

        console.log('ランキング結果ページを更新');

        rankingCards.forEach((card, index) => {
            const clinic = regionData.clinics[index];
            if (!clinic) return;

            // クリニック名を更新
            const nameElement = card.querySelector('.clinic-name');
            if (nameElement) {
                nameElement.innerHTML = `${clinic.name} <span data-region="name">${regionData.name}</span>院`;
            }

            // 料金を更新
            const priceElement = card.querySelector('.price-large');
            if (priceElement && clinic.price) {
                priceElement.textContent = clinic.price.replace('月々', '');
            }

            // キャンペーンを更新
            const campaignElements = card.querySelectorAll('.benefit-item span, .feature-text');
            campaignElements.forEach(element => {
                if (element.textContent.includes('円') && clinic.campaign) {
                    element.textContent = clinic.campaign;
                }
            });

            // 評価を更新
            const ratingElements = card.querySelectorAll('.feature-text');
            ratingElements.forEach(element => {
                if (element.textContent.includes('満足度') && clinic.rating) {
                    element.textContent = `満足度${clinic.rating}`;
                }
            });
        });
    }

    // 比較表ページ（06_comparisontable.html）を更新
    updateComparisonTablePage(regionData) {
        const comparisonItems = document.querySelectorAll('.comparison-item');
        if (comparisonItems.length === 0) return;

        console.log('比較表ページを更新');

        comparisonItems.forEach((item, index) => {
            const clinic = regionData.clinics[index];
            if (!clinic) return;

            // クリニック名を更新（複数箇所）
            const nameElements = item.querySelectorAll('.clinic-name');
            nameElements.forEach(nameElement => {
                // 地域を除いたクリニック名のみを抽出
                const clinicNameOnly = clinic.name.split(' ')[0];
                nameElement.textContent = clinicNameOnly;
            });

            // 料金を更新
            const priceElements = item.querySelectorAll('.price-value');
            priceElements.forEach(priceElement => {
                if (clinic.price) {
                    priceElement.textContent = clinic.price;
                }
            });

            // キャンペーン価格を更新
            const campaignElements = item.querySelectorAll('.highlight-text');
            campaignElements.forEach(element => {
                if (clinic.campaign && element.textContent.includes('円')) {
                    element.textContent = clinic.campaign;
                }
            });
        });
    }

    // メインビジュアルページを更新
    updateMainVisualPage(regionData) {
        // メインビジュアルの地域表示を更新
        const regionElements = document.querySelectorAll('[data-region="name"]');
        regionElements.forEach(element => {
            element.textContent = regionData.name;
        });

        // トップクリニックの情報を更新
        const topClinic = regionData.clinics[0];
        if (topClinic) {
            const topClinicElements = document.querySelectorAll('.top-clinic-name');
            topClinicElements.forEach(element => {
                element.textContent = topClinic.name;
            });
        }
    }

    // ヘッダーページを更新
    updateHeaderPage(regionData) {
        // ヘッダーの地域表示を更新
        const headerRegionElements = document.querySelectorAll('.header-region');
        headerRegionElements.forEach(element => {
            element.textContent = regionData.name;
        });
    }

    // 現在のランキングデータを取得
    getCurrentRankingData() {
        return this.currentRegionData;
    }

    // 特定順位のクリニック情報を取得
    getClinicByRank(rank) {
        if (!this.currentRegionData || !this.currentRegionData.clinics) {
            return null;
        }
        return this.currentRegionData.clinics[rank - 1];
    }

    // デバッグ用：現在のランキングを表示
    logCurrentRankings() {
        if (!this.currentRegionData) {
            console.log('ランキングデータが読み込まれていません');
            return;
        }

        console.log(`=== ${this.currentRegionData.name} 地域ランキング ===`);
        this.currentRegionData.clinics.forEach((clinic, index) => {
            console.log(`${index + 1}位: ${clinic.name} - ${clinic.price} - ${clinic.campaign}`);
        });
    }
}

// グローバルインスタンス
window.unifiedRankingSystem = new UnifiedRankingSystem();

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', async () => {
    await window.unifiedRankingSystem.init();
});

// デバッグ用：グローバル関数
window.showCurrentRankings = () => {
    window.unifiedRankingSystem.logCurrentRankings();
};