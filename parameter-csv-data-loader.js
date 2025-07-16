/**
 * パラメータベースのCSVデータローダー
 * data2フォルダから出しわけSS関連のCSVファイルを読み込む
 */
class ParameterCSVDataLoader {
    constructor() {
        this.clinicData = new Map();
        this.rankingData = new Map();
        this.storeData = new Map();
        this.regionData = new Map();
        this.dataPath = 'data2/';
    }

    /**
     * 全てのCSVデータを読み込む
     */
    async loadAllData() {
        try {
            const [clinics, rankings, stores, regions] = await Promise.all([
                this.loadClinicData(),
                this.loadRankingData(),
                this.loadStoreData(),
                this.loadRegionData()
            ]);

            return { clinics, rankings, stores, regions };
        } catch (error) {
            console.error('Failed to load CSV data:', error);
            throw error;
        }
    }

    /**
     * クリニックデータ（items.csv）を読み込む
     */
    async loadClinicData() {
        try {
            const response = await fetch(`${this.dataPath}出しわけSS - items.csv`);
            if (!response.ok) throw new Error(`Failed to load clinic data: ${response.status}`);
            
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            // ヘッダー行をスキップ
            for (let i = 1; i < lines.length; i++) {
                const [clinic_id, clinic_name, code] = this.parseCSVLine(lines[i]);
                if (clinic_id) {
                    this.clinicData.set(parseInt(clinic_id), {
                        clinic_id: parseInt(clinic_id),
                        clinic_name: clinic_name || '',
                        code: code || ''
                    });
                }
            }

            console.log(`Loaded ${this.clinicData.size} clinics`);
            return this.clinicData;
        } catch (error) {
            console.error('Error loading clinic data:', error);
            return this.clinicData;
        }
    }

    /**
     * ランキングデータ（ranking.csv）を読み込む
     */
    async loadRankingData() {
        try {
            const response = await fetch(`${this.dataPath}出しわけSS - ranking.csv`);
            if (!response.ok) throw new Error(`Failed to load ranking data: ${response.status}`);
            
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            // ヘッダー行をスキップ
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);
                if (values[0]) {
                    const parameterNo = values[0].padStart(3, '0'); // 001形式に統一
                    this.rankingData.set(parameterNo, {
                        parameter_no: parameterNo,
                        no1: parseInt(values[1]) || 0,
                        no2: parseInt(values[2]) || 0,
                        no3: parseInt(values[3]) || 0,
                        no4: parseInt(values[4]) || 0,
                        no5: parseInt(values[5]) || 0
                    });
                }
            }

            console.log(`Loaded ${this.rankingData.size} ranking patterns`);
            return this.rankingData;
        } catch (error) {
            console.error('Error loading ranking data:', error);
            return this.rankingData;
        }
    }

    /**
     * 店舗データ（stores.csv）を読み込む
     */
    async loadStoreData() {
        try {
            const response = await fetch(`${this.dataPath}出しわけSS - stores.csv`);
            if (!response.ok) throw new Error(`Failed to load store data: ${response.status}`);
            
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            // ヘッダー行をスキップ
            for (let i = 1; i < lines.length; i++) {
                const [store_id, clinic_name, store_name, zipcode, address, access] = this.parseCSVLine(lines[i]);
                if (store_id) {
                    const storeInfo = {
                        store_id: store_id || '',
                        clinic_name: clinic_name || '',
                        store_name: store_name || '',
                        zipcode: zipcode || '',
                        address: address || '',
                        access: access || ''
                    };

                    // クリニック名をキーとしてグループ化
                    if (!this.storeData.has(clinic_name)) {
                        this.storeData.set(clinic_name, []);
                    }
                    this.storeData.get(clinic_name).push(storeInfo);
                }
            }

            console.log(`Loaded store data for ${this.storeData.size} clinics`);
            return this.storeData;
        } catch (error) {
            console.error('Error loading store data:', error);
            return this.storeData;
        }
    }

    /**
     * CSV行をパースする（カンマ区切り、引用符対応）
     */
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    /**
     * 特定のパラメータ番号に対するランキングを取得
     */
    getRankingByParameter(parameterNo) {
        const paddedNo = parameterNo.padStart(3, '0');
        return this.rankingData.get(paddedNo) || null;
    }

    /**
     * クリニックIDから情報を取得
     */
    getClinicById(clinicId) {
        return this.clinicData.get(parseInt(clinicId)) || null;
    }

    /**
     * クリニック名から店舗情報を取得
     */
    getStoresByClinicName(clinicName) {
        return this.storeData.get(clinicName) || [];
    }

    /**
     * 地域データ（region.csv）を読み込む
     */
    async loadRegionData() {
        try {
            const response = await fetch(`${this.dataPath}出しわけSS - region.csv`);
            if (!response.ok) throw new Error(`Failed to load region data: ${response.status}`);
            
            const text = await response.text();
            const lines = text.split('\n').filter(line => line.trim());
            
            // ヘッダー行をスキップ
            for (let i = 1; i < lines.length; i++) {
                const [parameter_no, region] = this.parseCSVLine(lines[i]);
                if (parameter_no) {
                    const paddedNo = parameter_no.padStart(3, '0');
                    this.regionData.set(paddedNo, {
                        parameter_no: paddedNo,
                        region: region || ''
                    });
                }
            }

            console.log(`Loaded ${this.regionData.size} regions`);
            return this.regionData;
        } catch (error) {
            console.error('Error loading region data:', error);
            return this.regionData;
        }
    }

    /**
     * パラメータ番号から地域名を取得
     */
    getRegionByParameter(parameterNo) {
        const paddedNo = parameterNo.padStart(3, '0');
        const regionInfo = this.regionData.get(paddedNo);
        return regionInfo ? regionInfo.region : null;
    }
}

// グローバルスコープにエクスポート
window.ParameterCSVDataLoader = ParameterCSVDataLoader;