// 地域出し分け設定ファイル
const REGION_CONFIG = {
    // 地域データ
    regions: {
        'chiba': {
            name: '千葉',
            areaText: '千葉・船橋・柏エリア対応',
            stationInfo: 'JR千葉駅徒歩5分以内の好立地',
            clinics: [
                {
                    rank: 1,
                    name: 'ディオクリニック',
                    rating: '★★★★★ (4.9)',
                    campaign: '12ヶ月分0円！',
                    successRate: '99%',
                    avgWeight: '13.7kg',
                    cases: '50万件以上',
                    price: '月々4,900円',
                    url: 'https://dioclinic.jp/'
                },
                {
                    rank: 2,
                    name: 'URARAクリニック',
                    rating: '★★★★☆ (4.6)',
                    campaign: '最大79%OFF！',
                    successRate: '94%',
                    avgWeight: '-',
                    cases: '-',
                    price: '月々9,780円',
                    url: 'https://uraraclinic.jp/'
                },
                {
                    rank: 3,
                    name: 'リエートクリニック',
                    rating: '★★★★☆ (4.4)',
                    campaign: 'モニター80%OFF',
                    successRate: '-',
                    avgWeight: '18kg',
                    cases: '-',
                    price: '月々9,600円',
                    url: 'https://lietoclinic.com/'
                }
            ]
        },
        'tokyo': {
            name: '東京',
            areaText: '新宿・渋谷・池袋エリア対応',
            stationInfo: 'JR新宿駅徒歩3分以内の好立地',
            clinics: [
                {
                    rank: 1,
                    name: 'ディオクリニック',
                    rating: '★★★★★ (4.9)',
                    campaign: '12ヶ月分0円！',
                    successRate: '99%',
                    avgWeight: '13.7kg',
                    cases: '50万件以上',
                    price: '月々4,900円',
                    url: 'https://dioclinic.jp/'
                },
                {
                    rank: 2,
                    name: 'URARAクリニック',
                    rating: '★★★★☆ (4.6)',
                    campaign: '最大79%OFF！',
                    successRate: '94%',
                    avgWeight: '-',
                    cases: '-',
                    price: '月々9,780円',
                    url: 'https://uraraclinic.jp/'
                },
                {
                    rank: 3,
                    name: 'リエートクリニック',
                    rating: '★★★★☆ (4.4)',
                    campaign: 'モニター80%OFF',
                    successRate: '-',
                    avgWeight: '18kg',
                    cases: '-',
                    price: '月々9,600円',
                    url: 'https://lietoclinic.com/'
                }
            ]
        },
        'osaka': {
            name: '大阪',
            areaText: '梅田・心斎橋・難波エリア対応',
            stationInfo: 'JR大阪駅徒歩5分以内の好立地',
            clinics: [
                {
                    rank: 1,
                    name: 'ディオクリニック',
                    rating: '★★★★★ (4.9)',
                    campaign: '12ヶ月分0円！',
                    successRate: '99%',
                    avgWeight: '13.7kg',
                    cases: '50万件以上',
                    price: '月々4,900円',
                    url: 'https://dioclinic.jp/'
                },
                {
                    rank: 2,
                    name: 'URARAクリニック',
                    rating: '★★★★☆ (4.6)',
                    campaign: '最大79%OFF！',
                    successRate: '94%',
                    avgWeight: '-',
                    cases: '-',
                    price: '月々9,780円',
                    url: 'https://uraraclinic.jp/'
                },
                {
                    rank: 3,
                    name: 'リエートクリニック',
                    rating: '★★★★☆ (4.4)',
                    campaign: 'モニター80%OFF',
                    successRate: '-',
                    avgWeight: '18kg',
                    cases: '-',
                    price: '月々9,600円',
                    url: 'https://lietoclinic.com/'
                }
            ]
        }
    },

    // 現在の地域を設定（デフォルト：千葉）
    currentRegion: 'chiba',

    // 地域切り替え関数
    switchRegion: function(regionKey) {
        if (this.regions[regionKey]) {
            this.currentRegion = regionKey;
            this.updateAllComponents();
            console.log(`地域を${this.regions[regionKey].name}に切り替えました`);
        }
    },

    // 現在の地域データを取得
    getCurrentRegion: function() {
        return this.regions[this.currentRegion];
    },

    // 全コンポーネントを更新
    updateAllComponents: function() {
        // 親ウィンドウとすべてのiframeに地域変更を通知
        const event = new CustomEvent('regionChanged', {
            detail: { 
                region: this.currentRegion,
                data: this.getCurrentRegion()
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
                    region: this.currentRegion,
                    data: this.getCurrentRegion()
                }, '*');
            } catch (e) {
                console.warn('iframe通信エラー:', e);
            }
        });
    },

    // 初期化
    init: function() {
        // 地域切り替えボタンを作成
        this.createRegionSelector();
        
        // 初期データで更新
        setTimeout(() => {
            this.updateAllComponents();
        }, 1000); // iframeの読み込み完了を待つ
    },

    // 地域選択UIを作成
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
                min-width: 200px;
            ">
                <h4 style="margin: 0 0 10px 0; color: #007bff;">地域を選択</h4>
                <select id="regionSelector" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                ">
                    <option value="chiba">千葉エリア</option>
                    <option value="tokyo">東京エリア</option>
                    <option value="osaka">大阪エリア</option>
                </select>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        // セレクトボックスのイベントリスナー
        const selectElement = document.getElementById('regionSelector');
        selectElement.value = this.currentRegion;
        selectElement.addEventListener('change', (e) => {
            this.switchRegion(e.target.value);
        });
    }
};

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', () => {
    REGION_CONFIG.init();
});

// グローバルからアクセス可能にする
window.REGION_CONFIG = REGION_CONFIG;