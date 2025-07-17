// 自動生成された地域設定ファイル
// このファイルはビルド時に自動生成されます。直接編集しないでください。

const REGION_CONFIG_GENERATED = {
    regions: {
        'hokkaido': {
            id: '001',
            name: '北海道',
            areaText: '札幌・函館・旭川エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
        'miyagi': {
            id: '004',
            name: '宮城',
            areaText: '仙台・石巻・大崎エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
        'chiba': {
            id: '012',
            name: '千葉',
            areaText: '千葉・船橋・柏エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
        'tokyo': {
            id: '013',
            name: '東京',
            areaText: '新宿・渋谷・池袋エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
        'osaka': {
            id: '027',
            name: '大阪',
            areaText: '梅田・心斎橋・難波エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
        'aichi': {
            id: '023',
            name: '愛知',
            areaText: '名古屋・岡崎・豊橋エリア対応',
            stationInfo: 'undefined',
            clinics: []
        },
    },

    currentRegion: 'chiba',

    switchRegion: function(regionKey) {
        if (this.regions[regionKey]) {
            this.currentRegion = regionKey;
            this.updateAllComponents();
            console.log(`地域を${this.regions[regionKey].name}に切り替えました`);
        }
    },

    getCurrentRegion: function() {
        return this.regions[this.currentRegion];
    },

    updateAllComponents: function() {
        const event = new CustomEvent('regionChanged', {
            detail: { 
                region: this.currentRegion,
                data: this.getCurrentRegion()
            }
        });
        
        window.dispatchEvent(event);
        
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

    init: function() {
        this.createRegionSelector();
        setTimeout(() => {
            this.updateAllComponents();
        }, 1000);
    },

    createRegionSelector: function() {
        const selector = document.createElement('div');
        let optionsHTML = '';
        
        for (const [key, region] of Object.entries(this.regions)) {
            optionsHTML += `<option value="${key}">${region.name}エリア</option>`;
        }
        
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
                    ${optionsHTML}
                </select>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        const selectElement = document.getElementById('regionSelector');
        selectElement.value = this.currentRegion;
        selectElement.addEventListener('change', (e) => {
            this.switchRegion(e.target.value);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    REGION_CONFIG_GENERATED.init();
});

window.REGION_CONFIG_GENERATED = REGION_CONFIG_GENERATED;
