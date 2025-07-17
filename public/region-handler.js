// 各コンポーネント用の地域データ処理ハンドラー
class RegionHandler {
    constructor() {
        this.currentData = null;
        this.init();
    }

    init() {
        // 親ウィンドウからのメッセージを受信
        window.addEventListener('message', (event) => {
            if (event.data.type === 'regionChanged') {
                this.handleRegionChange(event.data.region, event.data.data);
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
    handleRegionChange(regionKey, regionData) {
        this.currentData = regionData;
        console.log(`地域データを更新: ${regionData.name}`);
        
        // コンポーネント固有の更新処理を実行
        this.updateComponent(regionData);
        
        // カスタムイベントを発火（コンポーネント内での追加処理用）
        const event = new CustomEvent('regionDataUpdated', {
            detail: { regionKey, regionData }
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

    // 現在の地域データを取得
    getCurrentData() {
        return this.currentData;
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

// エクスポート（CommonJS環境の場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RegionHandler;
}

// グローバルに公開
window.RegionHandler = RegionHandler;