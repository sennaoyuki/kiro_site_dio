// 地域出し分け設定ファイル（URLパラメータ対応・63地域対応）
const REGION_CONFIG_ENHANCED = {
    // 地域マッピングデータ（001-063）
    regionMapping: {
        '001': '北海道', '002': '青森', '003': '岩手', '004': '宮城', '005': '秋田',
        '006': '山形', '007': '福島', '008': '茨城', '009': '栃木', '010': '群馬',
        '011': '埼玉', '012': '千葉', '013': '東京', '014': '神奈川', '015': '新潟',
        '016': '富山', '017': '石川', '018': '福井', '019': '山梨', '020': '長野',
        '021': '岐阜', '022': '静岡', '023': '愛知', '024': '三重', '025': '滋賀',
        '026': '京都', '027': '大阪', '028': '兵庫', '029': '奈良', '030': '和歌山',
        '031': '鳥取', '032': '島根', '033': '岡山', '034': '広島', '035': '山口',
        '036': '徳島', '037': '香川', '038': '愛媛', '039': '高知', '040': '福岡',
        '041': '佐賀', '042': '長崎', '043': '熊本', '044': '大分', '045': '宮崎',
        '046': '鹿児島', '047': '沖縄', '048': '新宿', '049': '渋谷', '050': '千代田区',
        '051': '台東区', '052': '豊島区', '053': '世田谷', '054': '目黒', '055': '杉並',
        '056': '品川', '057': '葛飾', '058': '八王子', '059': '立川', '060': '武蔵野',
        '061': '三鷹', '062': '町田', '063': '調布'
    },

    // 詳細地域データ（clinic-database.jsに統合済み - フォールバック用のみ保持）
    regions: {},

    // デフォルト地域
    defaultRegionId: '012', // 千葉

    // 現在の地域
    currentRegionId: null,

    // URLパラメータからregion_idを取得
    getRegionIdFromUrl: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const regionId = urlParams.get('region_id');
        console.log('URLから取得したregion_id:', regionId);
        return regionId;
    },

    // 地域IDから地域名を取得
    getRegionNameById: function(regionId) {
        return this.regionMapping[regionId] || this.regionMapping[this.defaultRegionId];
    },

    // 地域IDから詳細データを取得（CSV優先・クリニックデータベース統合）
    getRegionDataById: function(regionId) {
        // 優先順位1: CSVシステムから取得
        if (window.getClinicDataByRegionIdFromCSV) {
            const regionName = this.getRegionNameById(regionId);
            const csvData = window.getClinicDataByRegionIdFromCSV(regionId, regionName);
            if (csvData) {
                console.log(`CSVシステムから取得: ${regionId} (${regionName})`);
                return csvData;
            }
        }
        
        // 優先順位2: 旧クリニックデータベースから取得（フォールバック）
        if (window.getClinicDataByRegionId) {
            const regionName = this.getRegionNameById(regionId);
            const clinicData = window.getClinicDataByRegionId(regionId, regionName);
            if (clinicData) {
                console.log(`フォールバック: 旧クリニックデータベースから取得: ${regionId} (${regionName})`);
                return clinicData;
            }
        }
        
        // 優先順位3: 既存の静的データ
        if (this.regions[regionId]) {
            console.log(`静的データから取得: ${regionId}`);
            return this.regions[regionId];
        }
        
        // 最終フォールバック: 基本データを生成
        const regionName = this.getRegionNameById(regionId);
        console.log(`最終フォールバック: 基本データ生成: ${regionId} (${regionName})`);
        return this.generateBasicRegionData(regionId, regionName);
    },

    // 基本的な地域データを生成（詳細データがない地域用）
    // 注意: この関数は使用されません。clinic-database.jsのフォールバック機能を使用してください。
    generateBasicRegionData: function(regionId, regionName) {
        console.warn('generateBasicRegionData is deprecated. Using clinic-database.js fallback instead.');
        // clinic-database.jsのフォールバック機能に委譲
        if (window.generateFallbackClinicData) {
            return window.generateFallbackClinicData(regionId, regionName);
        }
        
        // 最終フォールバック（医療脱毛クリニック版）
        return {
            id: regionId,
            name: regionName,
            areaText: `${regionName}・周辺エリア対応`,
            stationInfo: `JR${regionName}駅徒歩5分以内の好立地`,
            clinics: [
                {
                    rank: 1,
                    name: `湘南美容クリニック ${regionName}院`,
                    rating: '★★★★★ (4.5)',
                    address: `${regionName}の中心部に位置`,
                    access: `JR${regionName}駅徒歩5分`,
                    campaign: '両ワキ脱毛6回 2,500円',
                    price: '月々3,000円〜',
                    features: [
                        '全国展開の安心感',
                        '豊富な症例実績',
                        '駅近で通いやすい'
                    ],
                    url: 'https://www.s-b-c.net/',
                    phone: '0120-489-100'
                }
            ]
        };
    },

    // 現在の地域データを取得
    getCurrentRegionData: function() {
        const regionId = this.currentRegionId || this.defaultRegionId;
        return this.getRegionDataById(regionId);
    },

    // 地域を設定
    setCurrentRegion: function(regionId) {
        // 有効な地域IDかチェック
        if (this.regionMapping[regionId]) {
            this.currentRegionId = regionId;
            console.log(`地域を設定: ${regionId} (${this.getRegionNameById(regionId)})`);
            return true;
        } else {
            console.warn(`無効な地域ID: ${regionId}. デフォルト地域を使用します.`);
            this.currentRegionId = this.defaultRegionId;
            return false;
        }
    },

    // URLパラメータから地域を初期化
    initializeFromUrl: function() {
        const regionId = this.getRegionIdFromUrl();
        
        if (regionId) {
            this.setCurrentRegion(regionId);
        } else {
            this.currentRegionId = this.defaultRegionId;
            console.log(`URLパラメータなし。デフォルト地域を使用: ${this.getRegionNameById(this.defaultRegionId)}`);
        }
        
        return this.getCurrentRegionData();
    },

    // 全コンポーネントを更新
    updateAllComponents: function() {
        const regionData = this.getCurrentRegionData();
        
        // 親ウィンドウとすべてのiframeに地域変更を通知
        const event = new CustomEvent('regionChanged', {
            detail: { 
                regionId: this.currentRegionId,
                regionData: regionData
            }
        });
        
        // 親ウィンドウで発火
        window.dispatchEvent(event);
        
        // 各iframeにメッセージを送信
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'regionChanged',
                    regionId: this.currentRegionId,
                    regionData: regionData
                }, '*');
            } catch (e) {
                console.warn('iframe通信エラー:', e);
            }
        });
        
        // 地域選択UIも更新
        this.updateRegionSelector();
        
        console.log(`全コンポーネントを${regionData.name}版に更新しました`);
    },

    // ページのタイトルとメタ情報を更新
    updatePageMeta: function() {
        const regionData = this.getCurrentRegionData();
        
        // タイトルタグの更新
        const titleElement = document.querySelector('title');
        if (titleElement) {
            titleElement.textContent = `${regionData.name}版 医療痩身クリニックランキング 2025`;
        }
        
        // メタディスクリプションの更新
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 
                `${regionData.name}エリアで厳選された医療痩身クリニックTOP3。${regionData.areaText}の信頼できるクリニック比較。`
            );
        }
    },

    // 地域選択UIを更新
    updateRegionSelector: function() {
        const selector = document.getElementById('regionSelector');
        if (selector) {
            // セレクトボックスの値を現在の地域に合わせる
            const regionName = this.getCurrentRegionData().name;
            
            // 既存のオプションをチェック
            let found = false;
            for (let option of selector.options) {
                if (option.text.includes(regionName)) {
                    selector.value = option.value;
                    found = true;
                    break;
                }
            }
            
            // オプションが見つからない場合は動的に追加
            if (!found) {
                const newOption = document.createElement('option');
                newOption.value = this.currentRegionId;
                newOption.textContent = `${regionName}エリア`;
                selector.appendChild(newOption);
                selector.value = this.currentRegionId;
            }
        }
    },

    // 地域選択UIを作成（拡張版）
    /*
    createRegionSelector: function() {
        const selector = document.createElement('div');
        selector.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border: 2px solid #007bff;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                z-index: 9999;
                font-family: sans-serif;
                min-width: 220px;
            ">
                <h4 style="margin: 0 0 10px 0; color: #007bff;">地域を選択</h4>
                <select id="regionSelector" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                ">
                    <option value="012">千葉エリア</option>
                    <option value="013">東京エリア</option>
                    <option value="027">大阪エリア</option>
                    <option value="001">北海道エリア</option>
                    <option value="">--- その他の地域 ---</option>
                </select>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    現在: <span id="currentRegionDisplay">${this.getCurrentRegionData().name}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        // セレクトボックスのイベントリスナー
        const selectElement = document.getElementById('regionSelector');
        selectElement.value = this.currentRegionId;
        selectElement.addEventListener('change', (e) => {
            if (e.target.value) {
                this.setCurrentRegion(e.target.value);
                this.updateAllComponents();
                this.updatePageMeta();
            }
        });
        
        // 現在地域表示の更新
        const currentDisplay = document.getElementById('currentRegionDisplay');
        if (currentDisplay) {
            currentDisplay.textContent = this.getCurrentRegionData().name;
        }
    },*/

    // 初期化
    init: function() {
        console.log('地域出し分けシステム（URLパラメータ対応）を初期化中...');
        
        // URLパラメータから地域を設定
        this.initializeFromUrl();
        
        // ページメタ情報を更新
        this.updatePageMeta();
        
        // 地域切り替えUIを作成
        // this.createRegionSelector();
        
        // 初期データで全コンポーネントを更新
        setTimeout(() => {
            this.updateAllComponents();
        }, 1000); // iframeの読み込み完了を待つ
        
        console.log(`地域出し分けシステム初期化完了: ${this.getCurrentRegionData().name}版`);
    }
};

// メッセージリスナーを設定（親ウィンドウ用）
window.addEventListener('message', (event) => {
    if (event.data.type === 'requestRegionData' && window.REGION_CONFIG_ENHANCED) {
        // 要求元のiframeに現在の地域データを送信
        event.source.postMessage({
            type: 'regionChanged',
            regionId: window.REGION_CONFIG_ENHANCED.currentRegionId,
            regionData: window.REGION_CONFIG_ENHANCED.getCurrentRegionData()
        }, '*');
    }
});

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    REGION_CONFIG_ENHANCED.init();
});

// グローバルからアクセス可能にする
window.REGION_CONFIG_ENHANCED = REGION_CONFIG_ENHANCED;