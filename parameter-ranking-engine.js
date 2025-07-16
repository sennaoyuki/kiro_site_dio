/**
 * パラメータベースのランキングエンジン
 * parameter_noに基づいてクリニックのランキングを生成
 */
class ParameterRankingEngine {
    constructor(csvData) {
        this.clinicData = csvData.clinics || new Map();
        this.rankingData = csvData.rankings || new Map();
        this.storeData = csvData.stores || new Map();
    }

    /**
     * 指定されたパラメータ番号のランキングを生成
     */
    generateRankingForParameter(parameterNo) {
        const paddedNo = parameterNo.padStart(3, '0');
        const ranking = this.rankingData.get(paddedNo);
        
        if (!ranking) {
            console.warn(`No ranking found for parameter_no: ${paddedNo}`);
            return this.getDefaultRanking();
        }

        return this.buildClinicRanking(ranking);
    }

    /**
     * ランキング順序に基づいてクリニック情報を構築
     */
    buildClinicRanking(rankingOrder) {
        const rankedClinics = [];
        
        // no1からno5までのクリニックを順番に処理
        for (let i = 1; i <= 5; i++) {
            const clinicId = rankingOrder[`no${i}`];
            if (clinicId && clinicId !== 0) {
                const clinicInfo = this.getClinicById(clinicId);
                if (clinicInfo) {
                    rankedClinics.push({
                        rank: i,
                        ...clinicInfo,
                        stores: this.getStoresByClinicName(clinicInfo.clinic_name)
                    });
                }
            }
        }

        return {
            parameter_no: rankingOrder.parameter_no,
            clinics: rankedClinics,
            totalClinics: rankedClinics.length
        };
    }

    /**
     * クリニックIDから情報を取得
     */
    getClinicById(clinicId) {
        const clinic = this.clinicData.get(parseInt(clinicId));
        return clinic || null;
    }

    /**
     * クリニック名から店舗情報を取得
     */
    getStoresByClinicName(clinicName) {
        return this.storeData.get(clinicName) || [];
    }

    /**
     * デフォルトランキングを取得（001を使用）
     */
    getDefaultRanking() {
        const defaultRanking = this.rankingData.get('001');
        if (defaultRanking) {
            return this.buildClinicRanking(defaultRanking);
        }

        // データが全く無い場合の最終フォールバック
        return {
            parameter_no: '001',
            clinics: [],
            totalClinics: 0
        };
    }

    /**
     * 利用可能な全パラメータ番号を取得
     */
    getAvailableParameters() {
        return Array.from(this.rankingData.keys()).sort();
    }

    /**
     * パラメータ番号が有効かチェック
     */
    isValidParameter(parameterNo) {
        const paddedNo = parameterNo.padStart(3, '0');
        return this.rankingData.has(paddedNo);
    }

    /**
     * 全クリニック情報を取得
     */
    getAllClinics() {
        return Array.from(this.clinicData.values());
    }

    /**
     * 特定のクリニックが含まれるパラメータを検索
     */
    findParametersWithClinic(clinicId) {
        const parameters = [];
        const targetId = parseInt(clinicId);

        this.rankingData.forEach((ranking, parameterNo) => {
            for (let i = 1; i <= 5; i++) {
                if (ranking[`no${i}`] === targetId) {
                    parameters.push({
                        parameter_no: parameterNo,
                        rank: i
                    });
                    break;
                }
            }
        });

        return parameters;
    }

    /**
     * CLINIC_DATABASE_GENERATED形式への変換
     */
    convertToLegacyFormat(rankingData) {
        if (!rankingData || !rankingData.clinics) {
            return [];
        }

        return rankingData.clinics.map(clinic => {
            // クリニック名からキーを生成（スペースを除去）
            const key = clinic.clinic_name.replace(/\s+/g, '');
            
            return {
                key: key,
                id: String(clinic.clinic_id),
                name: clinic.clinic_name,
                code: clinic.code || '',
                rank: clinic.rank,
                stores: clinic.stores.map(store => ({
                    name: store.store_name,
                    address: store.address,
                    access: store.access
                }))
            };
        });
    }

    /**
     * 統計情報を取得
     */
    getStatistics() {
        return {
            totalClinics: this.clinicData.size,
            totalParameters: this.rankingData.size,
            totalStores: Array.from(this.storeData.values()).reduce((sum, stores) => sum + stores.length, 0),
            clinicsWithStores: this.storeData.size
        };
    }
}

// グローバルスコープにエクスポート
window.ParameterRankingEngine = ParameterRankingEngine;