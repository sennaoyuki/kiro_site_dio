// CSV動的読み込み機能
// CSVファイルを直接読み込んで地域・クリニックデータを生成

class CSVDataLoader {
    constructor(dataPath = './data/') {
        this.dataPath = dataPath;
        this.cache = {};
        this.isLoaded = false;
    }

    // CSVファイルを読み込む
    async loadCSV(filename) {
        try {
            const response = await fetch(`${this.dataPath}${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filename}: ${response.status}`);
            }
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return [];
        }
    }

    // CSV文字列をパース
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, ''));
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        });
    }

    // 全CSVデータを読み込み
    async loadAllData() {
        console.log('CSVデータを読み込み中...');
        
        try {
            const [regionMaster, clinicMaster, clinicLocations, regionalRankings] = await Promise.all([
                this.loadCSV('region_master.csv'),
                this.loadCSV('clinic_master.csv'),
                this.loadCSV('clinic_locations.csv'),
                this.loadCSV('regional_rankings.csv')
            ]);

            this.cache = {
                regionMaster,
                clinicMaster,
                clinicLocations,
                regionalRankings
            };

            this.isLoaded = true;
            console.log('CSVデータの読み込みが完了しました');
            return true;
        } catch (error) {
            console.error('CSVデータの読み込みに失敗しました:', error);
            return false;
        }
    }

    // 地域IDから地域情報を取得
    getRegionData(regionId) {
        if (!this.isLoaded) {
            console.warn('CSVデータがまだ読み込まれていません');
            return null;
        }

        const region = this.cache.regionMaster.find(r => r.region_id === regionId);
        if (!region) {
            console.warn(`Region not found: ${regionId}`);
            return null;
        }

        // 地域のランキング情報を取得
        const ranking = this.cache.regionalRankings.find(r => r.region_id === regionId);
        if (!ranking) {
            console.warn(`Ranking not found for region: ${regionId}`);
            return { ...region, clinics: [] };
        }

        // ランキング順にクリニック情報を構築
        const clinics = [];
        for (let rank = 1; rank <= 3; rank++) {
            const locationId = ranking[`rank${rank}_location`];
            if (locationId) {
                const clinic = this.getClinicData(locationId);
                if (clinic) {
                    clinic.rank = rank;
                    clinics.push(clinic);
                }
            }
        }

        return {
            id: region.region_id,
            name: region.region_name,
            areaText: region.area_text,
            stationInfo: region.station_info,
            clinics
        };
    }

    // location_idからクリニック詳細情報を取得
    getClinicData(locationId) {
        const location = this.cache.clinicLocations.find(l => l.location_id === locationId);
        if (!location) {
            console.warn(`Location not found: ${locationId}`);
            return null;
        }

        const clinic = this.cache.clinicMaster.find(c => c.clinic_id === location.clinic_id);
        if (!clinic) {
            console.warn(`Clinic not found: ${location.clinic_id}`);
            return null;
        }

        return {
            name: `${clinic.clinic_name} ${location.branch_name}`,
            rating: `★★★★★ (${location.rating})`,
            address: location.address,
            access: location.access,
            campaign: location.campaign,
            price: location.monthly_price,
            features: [
                location.feature1,
                location.feature2,
                location.feature3
            ].filter(f => f && f.trim()),
            url: clinic.official_url,
            phone: location.phone
        };
    }

    // すべての地域データを取得
    getAllRegions() {
        if (!this.isLoaded) {
            console.warn('CSVデータがまだ読み込まれていません');
            return [];
        }

        return this.cache.regionMaster.map(region => this.getRegionData(region.region_id));
    }

    // 地域名から地域IDを検索
    findRegionIdByName(regionName) {
        if (!this.isLoaded) return null;
        
        const region = this.cache.regionMaster.find(r => 
            r.region_name.includes(regionName) || regionName.includes(r.region_name)
        );
        return region ? region.region_id : null;
    }

    // データが読み込まれているかチェック
    isDataLoaded() {
        return this.isLoaded;
    }

    // キャッシュをクリア
    clearCache() {
        this.cache = {};
        this.isLoaded = false;
    }

    // データを再読み込み
    async reloadData() {
        this.clearCache();
        return await this.loadAllData();
    }
}

// 動的地域設定クラス
class DynamicRegionConfig {
    constructor(csvLoader) {
        this.csvLoader = csvLoader;
        this.currentRegion = null;
        this.regions = {};
        this.initialized = false;
    }

    // 初期化
    async init() {
        console.log('動的地域設定を初期化中...');
        
        // CSVデータを読み込み
        const success = await this.csvLoader.loadAllData();
        if (!success) {
            console.error('CSVデータの読み込みに失敗しました');
            return false;
        }

        // 地域データを構築
        this.buildRegionData();
        
        // デフォルト地域を設定
        this.setDefaultRegion();
        
        // 地域選択UIを作成
        this.createRegionSelector();
        
        this.initialized = true;
        console.log('動的地域設定の初期化が完了しました');
        
        // 初期更新
        setTimeout(() => {
            this.updateAllComponents();
        }, 1000);
        
        return true;
    }

    // 地域データを構築
    buildRegionData() {
        const allRegions = this.csvLoader.getAllRegions();
        
        allRegions.forEach(region => {
            if (region) {
                // 地域キーを生成（例：001→hokkaido, 013→tokyo）
                const regionKey = this.generateRegionKey(region.id, region.name);
                this.regions[regionKey] = region;
            }
        });
        
        console.log('地域データを構築しました:', Object.keys(this.regions));
    }

    // 地域キーを生成
    generateRegionKey(regionId, regionName) {
        const keyMap = {
            '001': 'hokkaido',
            '004': 'miyagi',
            '012': 'chiba',
            '013': 'tokyo',
            '023': 'aichi',
            '027': 'osaka'
        };
        
        return keyMap[regionId] || `region${regionId}`;
    }

    // デフォルト地域を設定
    setDefaultRegion() {
        const regionKeys = Object.keys(this.regions);
        if (regionKeys.length > 0) {
            this.currentRegion = regionKeys.includes('chiba') ? 'chiba' : regionKeys[0];
        }
    }

    // 地域切り替え
    switchRegion(regionKey) {
        if (this.regions[regionKey]) {
            this.currentRegion = regionKey;
            this.updateAllComponents();
            console.log(`地域を${this.regions[regionKey].name}に切り替えました`);
            return true;
        }
        return false;
    }

    // 現在の地域データを取得
    getCurrentRegion() {
        return this.regions[this.currentRegion];
    }

    // 全コンポーネントを更新
    updateAllComponents() {
        if (!this.initialized) return;

        const currentData = this.getCurrentRegion();
        if (!currentData) return;

        const event = new CustomEvent('regionChanged', {
            detail: { 
                region: this.currentRegion,
                data: currentData
            }
        });
        
        window.dispatchEvent(event);
        
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            try {
                iframe.contentWindow.postMessage({
                    type: 'regionChanged',
                    region: this.currentRegion,
                    data: currentData
                }, '*');
            } catch (e) {
                console.warn('iframe通信エラー:', e);
            }
        });
    }

    // 地域選択UIを作成
    createRegionSelector() {
        // 既存のセレクターを削除
        const existingSelector = document.getElementById('dynamicRegionSelector');
        if (existingSelector) {
            existingSelector.remove();
        }

        const selector = document.createElement('div');
        selector.id = 'dynamicRegionSelector';
        
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
                <h4 style="margin: 0 0 10px 0; color: #007bff;">地域を選択 (動的)</h4>
                <select id="dynamicRegionSelect" style="
                    width: 100%;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                ">
                    ${optionsHTML}
                </select>
                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                    CSVファイルから動的読み込み
                </div>
            </div>
        `;
        
        document.body.appendChild(selector);
        
        const selectElement = document.getElementById('dynamicRegionSelect');
        selectElement.value = this.currentRegion;
        selectElement.addEventListener('change', (e) => {
            this.switchRegion(e.target.value);
        });
    }

    // データを再読み込み
    async reloadData() {
        console.log('CSVデータを再読み込み中...');
        const success = await this.csvLoader.reloadData();
        if (success) {
            this.buildRegionData();
            this.createRegionSelector();
            this.updateAllComponents();
            console.log('データの再読み込みが完了しました');
        }
        return success;
    }
}

// グローバルインスタンス
const csvDataLoader = new CSVDataLoader();
const dynamicRegionConfig = new DynamicRegionConfig(csvDataLoader);

// ページ読み込み完了後に初期化
document.addEventListener('DOMContentLoaded', async () => {
    await dynamicRegionConfig.init();
});

// グローバルに公開
window.csvDataLoader = csvDataLoader;
window.dynamicRegionConfig = dynamicRegionConfig;
window.CSVDataLoader = CSVDataLoader;
window.DynamicRegionConfig = DynamicRegionConfig;