#!/usr/bin/env node
// Vercel用ビルドスクリプト（Node.js版）
// CSVファイルからJavaScriptファイルを生成

const fs = require('fs');
const path = require('path');

const DATA_DIR = './data';
const OUTPUT_DIR = './';

console.log('=== Vercel用ビルドスクリプト開始 ===');

// CSVファイルを読み込む
function readCSV(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        });
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
}

// クリニックデータベースを生成
function generateClinicDatabase() {
    console.log('クリニックデータベースを生成中...');
    
    const regionMaster = readCSV(path.join(DATA_DIR, 'region_master.csv'));
    const clinicMaster = readCSV(path.join(DATA_DIR, 'clinic_master.csv'));
    const clinicLocations = readCSV(path.join(DATA_DIR, 'clinic_locations.csv'));
    const regionalRankings = readCSV(path.join(DATA_DIR, 'regional_rankings.csv'));
    
    let jsContent = `// 自動生成されたクリニックデータベース
// このファイルはビルド時に自動生成されます。直接編集しないでください。

const CLINIC_DATABASE_GENERATED = {
`;

    regionMaster.forEach(region => {
        const regionId = region.region_id;
        const regionName = region.region_name;
        
        jsContent += `    // ${regionName} - region_id: ${regionId}\n`;
        jsContent += `    '${regionId}': {\n`;
        jsContent += `        id: '${regionId}',\n`;
        jsContent += `        name: '${regionName}',\n`;
        jsContent += `        areaText: '${region.area_text}',\n`;
        jsContent += `        stationInfo: '${region.station_info}',\n`;
        jsContent += `        clinics: [\n`;
        
        // 地域別ランキングを取得
        const ranking = regionalRankings.find(r => r.region_id === regionId);
        if (ranking) {
            for (let rank = 1; rank <= 3; rank++) {
                const locationId = ranking[`rank${rank}_location`];
                if (locationId) {
                    const location = clinicLocations.find(l => l.location_id === locationId);
                    if (location) {
                        const clinic = clinicMaster.find(c => c.clinic_id === location.clinic_id);
                        if (clinic) {
                            jsContent += `            {\n`;
                            jsContent += `                rank: ${rank},\n`;
                            jsContent += `                name: '${clinic.clinic_name} ${location.branch_name}',\n`;
                            jsContent += `                rating: '★★★★★ (${location.rating})',\n`;
                            jsContent += `                address: '${location.address}',\n`;
                            jsContent += `                access: '${location.access}',\n`;
                            jsContent += `                campaign: '${location.campaign}',\n`;
                            jsContent += `                price: '${location.monthly_price}',\n`;
                            jsContent += `                features: [\n`;
                            jsContent += `                    '${location.feature1}',\n`;
                            jsContent += `                    '${location.feature2}',\n`;
                            jsContent += `                    '${location.feature3}'\n`;
                            jsContent += `                ],\n`;
                            jsContent += `                url: '${clinic.official_url}',\n`;
                            jsContent += `                phone: '${location.phone}'\n`;
                            jsContent += rank === 3 ? `            }\n` : `            },\n`;
                        }
                    }
                }
            }
        }
        
        jsContent += `        ]\n`;
        jsContent += `    },\n\n`;
    });

    jsContent += `};

// データベースからクリニック情報を取得する関数
function getClinicDataByRegionId(regionId, regionName) {
    if (CLINIC_DATABASE_GENERATED[regionId]) {
        console.log(\`詳細クリニックデータを取得: \${regionId} (\${regionName})\`);
        return CLINIC_DATABASE_GENERATED[regionId];
    }
    
    console.log(\`データが見つかりません: \${regionId} (\${regionName})\`);
    return null;
}

// エクスポート（CommonJS環境の場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CLINIC_DATABASE_GENERATED,
        getClinicDataByRegionId
    };
}

// グローバルに公開
window.CLINIC_DATABASE_GENERATED = CLINIC_DATABASE_GENERATED;
window.getClinicDataByRegionId = getClinicDataByRegionId;
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'clinic-database-generated.js'), jsContent);
    console.log('クリニックデータベースを生成しました: clinic-database-generated.js');
}

// 地域設定を生成
function generateRegionConfig() {
    console.log('地域設定ファイルを生成中...');
    
    const regionMaster = readCSV(path.join(DATA_DIR, 'region_master.csv'));
    
    let jsContent = `// 自動生成された地域設定ファイル
// このファイルはビルド時に自動生成されます。直接編集しないでください。

const REGION_CONFIG_GENERATED = {
    regions: {
`;

    regionMaster.forEach(region => {
        const regionId = region.region_id;
        const regionName = region.region_name;
        
        // 地域キーを生成
        const keyMap = {
            '001': 'hokkaido',
            '004': 'miyagi', 
            '012': 'chiba',
            '013': 'tokyo',
            '023': 'aichi',
            '027': 'osaka'
        };
        
        const regionKey = keyMap[regionId] || `region${regionId}`;
        
        jsContent += `        '${regionKey}': {\n`;
        jsContent += `            id: '${regionId}',\n`;
        jsContent += `            name: '${regionName}',\n`;
        jsContent += `            areaText: '${region.area_text}',\n`;
        jsContent += `            stationInfo: '${region.station_info}',\n`;
        jsContent += `            clinics: []\n`;
        jsContent += `        },\n`;
    });

    jsContent += `    },

    currentRegion: 'chiba',

    switchRegion: function(regionKey) {
        if (this.regions[regionKey]) {
            this.currentRegion = regionKey;
            this.updateAllComponents();
            console.log(\`地域を\${this.regions[regionKey].name}に切り替えました\`);
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
            optionsHTML += \`<option value="\${key}">\${region.name}エリア</option>\`;
        }
        
        selector.innerHTML = \`
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
                    \${optionsHTML}
                </select>
            </div>
        \`;
        
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
`;

    fs.writeFileSync(path.join(OUTPUT_DIR, 'region-config-generated.js'), jsContent);
    console.log('地域設定ファイルを生成しました: region-config-generated.js');
}

// メイン実行
try {
    // CSVファイルの存在確認
    const requiredFiles = [
        'region_master.csv',
        'clinic_master.csv', 
        'clinic_locations.csv',
        'regional_rankings.csv'
    ];
    
    for (const file of requiredFiles) {
        const filePath = path.join(DATA_DIR, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Required file not found: ${filePath}`);
        }
    }
    
    generateClinicDatabase();
    generateRegionConfig();
    
    console.log('=== ビルド完了 ===');
} catch (error) {
    console.error('ビルドエラー:', error);
    process.exit(1);
}