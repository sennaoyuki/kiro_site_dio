// 各コンポーネント用の地域データ処理ハンドラー（URLパラメータ対応）
class RegionHandlerEnhanced {
    constructor() {
        this.currentRegionId = null;
        this.currentData = null;
        this.init();
    }

    init() {
        // 親ウィンドウからのメッセージを受信
        window.addEventListener('message', (event) => {
            if (event.data.type === 'regionChanged') {
                this.handleRegionChange(event.data.regionId, event.data.regionData);
            }
        });

        // 初期データの要求
        this.requestInitialData();
    }

    // 初期データを親ウィンドウに要求
    requestInitialData() {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'requestRegionData'
            }, '*');
        }
    }

    // 地域変更を処理
    handleRegionChange(regionId, regionData) {
        this.currentRegionId = regionId;
        this.currentData = regionData;
        console.log(`地域データを更新: ${regionId} (${regionData.name})`);
        
        // コンポーネント固有の更新処理を実行
        this.updateComponent(regionData);
        
        // カスタムイベントを発火（コンポーネント内での追加処理用）
        const event = new CustomEvent('regionDataUpdated', {
            detail: { regionId, regionData }
        });
        document.dispatchEvent(event);
    }

    // コンポーネント固有の更新処理（オーバーライド用）
    updateComponent(regionData) {
        // 基本的なテキスト置換処理
        this.updateText('[data-region="name"]', regionData.name);
        this.updateText('[data-region="area"]', regionData.areaText);
        this.updateText('[data-region="station"]', regionData.stationInfo);

        // クリニック情報の更新
        this.updateClinics(regionData.clinics);

        // ページタイトルの更新
        this.updatePageTitle(regionData);

        // メタ情報の更新
        this.updateMetaInfo(regionData);
    }

    // ページタイトルを更新
    updatePageTitle(regionData) {
        const titleElement = document.querySelector('title');
        if (titleElement) {
            // 既存のタイトルテンプレートを地域名で置換
            let newTitle = titleElement.textContent;
            
            // 地域名の置換パターン
            const regionPatterns = ['千葉', '東京', '大阪', '北海道', '神奈川', '埼玉', '愛知'];
            
            regionPatterns.forEach(pattern => {
                if (newTitle.includes(pattern)) {
                    newTitle = newTitle.replace(pattern, regionData.name);
                }
            });
            
            // パターンマッチしない場合は先頭に地域名を追加
            if (!regionPatterns.some(pattern => titleElement.textContent.includes(pattern))) {
                newTitle = `【2024年版】${regionData.name}の医療脱毛クリニックおすすめ人気ランキングTOP3`;
            }
            
            titleElement.textContent = newTitle;
            console.log(`タイトル更新: ${newTitle}`);
        }
    }

    // メタ情報を更新
    updateMetaInfo(regionData) {
        // メタディスクリプション
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const newDesc = `${regionData.name}エリアで厳選された医療脱毛クリニックの比較情報。${regionData.areaText}で信頼できるクリニックを見つけよう。`;
            metaDesc.setAttribute('content', newDesc);
        }
    }

    // テキスト更新ヘルパー
    updateText(selector, text) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.value = text;
            } else {
                el.textContent = text;
            }
        });
    }

    // HTML更新ヘルパー
    updateHTML(selector, html) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.innerHTML = html;
        });
    }

    // 属性更新ヘルパー
    updateAttribute(selector, attribute, value) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.setAttribute(attribute, value);
        });
    }

    // クリニック情報の更新
    updateClinics(clinics) {
        if (!clinics || !Array.isArray(clinics)) return;

        clinics.forEach((clinic, index) => {
            const rank = clinic.rank;
            
            // クリニック名
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="name"]`, clinic.name);
            
            // 評価
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="rating"]`, clinic.rating);
            
            // キャンペーン
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="campaign"]`, clinic.campaign);
            
            // 成功率
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="successRate"]`, clinic.successRate);
            
            // 平均減量
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="avgWeight"]`, clinic.avgWeight);
            
            // 症例数
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="cases"]`, clinic.cases);
            
            // 価格
            this.updateText(`[data-clinic-rank="${rank}"] [data-clinic="price"]`, clinic.price);
            
            // URL
            this.updateAttribute(`[data-clinic-rank="${rank}"] [data-clinic="url"]`, 'href', clinic.url);
        });
    }

    // 地域別テキスト置換（汎用）
    replaceRegionText(regionData) {
        // data-region-replace属性を持つ要素を自動更新
        document.querySelectorAll('[data-region-replace]').forEach(element => {
            const replaceType = element.getAttribute('data-region-replace');
            let newText = element.textContent;

            switch (replaceType) {
                case 'name':
                    // 地域名の置換
                    newText = newText.replace(/千葉|東京|大阪|北海道/g, regionData.name);
                    break;
                case 'area':
                    // エリア情報の置換
                    newText = regionData.areaText;
                    break;
                case 'station':
                    // 駅情報の置換
                    newText = regionData.stationInfo;
                    break;
                case 'title':
                    // タイトル形式の置換
                    newText = `${regionData.name}版 医療痩身クリニックランキング`;
                    break;
            }

            element.textContent = newText;
        });
    }

    // 現在の地域データを取得
    getCurrentData() {
        return this.currentData;
    }

    // 現在の地域IDを取得
    getCurrentRegionId() {
        return this.currentRegionId;
    }

    // 特定の地域情報を取得
    getRegionInfo(key) {
        return this.currentData ? this.currentData[key] : null;
    }

    // クリニック情報を順位で取得
    getClinicByRank(rank) {
        if (!this.currentData || !this.currentData.clinics) return null;
        return this.currentData.clinics.find(clinic => clinic.rank === rank);
    }

    // URLパラメータから地域IDを取得
    getRegionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('region_id');
    }

    // 地域固有のスタイル適用
    applyRegionStyles(regionData) {
        // 地域別のカラーテーマ適用など
        const regionThemes = {
            '001': { primary: '#0066cc', secondary: '#e6f2ff' }, // 北海道: 青
            '012': { primary: '#00cc66', secondary: '#e6ffe6' }, // 千葉: 緑
            '013': { primary: '#cc0066', secondary: '#ffe6f2' }, // 東京: ピンク
            '027': { primary: '#cc6600', secondary: '#fff2e6' }  // 大阪: オレンジ
        };

        const theme = regionThemes[this.currentRegionId];
        if (theme) {
            document.documentElement.style.setProperty('--region-primary', theme.primary);
            document.documentElement.style.setProperty('--region-secondary', theme.secondary);
        }
    }
}

// ヘルパー関数：データ属性でマークしたHTML要素の一括更新
function updateDataElements(data) {
    // [data-update="property"] の要素を自動更新
    document.querySelectorAll('[data-update]').forEach(element => {
        const property = element.getAttribute('data-update');
        const value = getNestedProperty(data, property);
        
        if (value !== undefined) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = value;
            } else if (element.hasAttribute('data-attr')) {
                const attr = element.getAttribute('data-attr');
                element.setAttribute(attr, value);
            } else {
                element.textContent = value;
            }
        }
    });
}

// ネストされたプロパティを取得するヘルパー
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

// 地域別デバッグ情報表示
function showRegionDebugInfo(regionData) {
    if (window.location.search.includes('debug=true')) {
        console.group('🌍 地域データ詳細');
        console.log('地域ID:', regionData.id);
        console.log('地域名:', regionData.name);
        console.log('エリア情報:', regionData.areaText);
        console.log('駅情報:', regionData.stationInfo);
        console.log('クリニック数:', regionData.clinics ? regionData.clinics.length : 0);
        console.groupEnd();
    }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionHandlerEnhanced;
}

// グローバルに公開
window.RegionHandlerEnhanced = RegionHandlerEnhanced;