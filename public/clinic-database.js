// 地域別クリニックデータベース（実在クリニック情報）
const CLINIC_DATABASE = {
    // 北海道（札幌）- region_id: 001
    '001': {
        id: '001',
        name: '北海道',
        areaText: '札幌・函館・旭川エリア対応',
        stationInfo: 'JR札幌駅徒歩5分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: '湘南美容クリニック 札幌院',
                rating: '★★★★★ (4.7)',
                address: '北海道札幌市中央区北1条西3-3-10 ユニゾイン札幌3階',
                access: 'JR札幌駅南口徒歩3分',
                campaign: '両ワキ脱毛6回 2,500円',
                price: '月々3,000円〜',
                features: [
                    '業界最安級の料金設定',
                    '全国130院以上展開',
                    '経験豊富な医師による施術'
                ],
                url: 'https://www.s-b-c.net/clinic/branch/sapporo/',
                phone: '0120-031-999'
            },
            {
                rank: 2,
                name: 'リゼクリニック 札幌院',
                rating: '★★★★☆ (4.5)',
                address: '北海道札幌市中央区南三条西4-1-1 ススキノラフィラ6F',
                access: '市営地下鉄すすきの駅2番出口徒歩1分',
                campaign: '全身脱毛5回 192,000円',
                price: '月々3,700円〜',
                features: [
                    '3種類の医療レーザー脱毛機',
                    '追加料金一切なし',
                    '硬毛化・増毛化保証あり'
                ],
                url: 'https://www.rizeclinic.com/clinic/sapporo.html',
                phone: '0120-966-120'
            },
            {
                rank: 3,
                name: 'エミナルクリニック 札幌院',
                rating: '★★★★☆ (4.3)',
                address: '北海道札幌市中央区北1条西3丁目3-33 リープロ札幌4階',
                access: 'JR札幌駅南口徒歩5分',
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '最短5ヶ月で脱毛完了',
                    '痛み軽減技術導入',
                    '21時まで診療'
                ],
                url: 'https://eminal-clinic.jp/clinic/sapporo/',
                phone: '011-206-7790'
            }
        ]
    },

    // 宮城（仙台）- region_id: 004
    '004': {
        id: '004',
        name: '宮城',
        areaText: '仙台・石巻・大崎エリア対応',
        stationInfo: 'JR仙台駅徒歩5分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: 'TCB東京中央美容外科 仙台院',
                rating: '★★★★★ (4.8)',
                address: '宮城県仙台市青葉区中央1-6-27 仙信ビル4F',
                access: 'JR仙台駅西口徒歩5分',
                campaign: 'VIO脱毛5回 48,000円',
                price: '月々1,700円〜',
                features: [
                    '痛みの少ない脱毛機導入',
                    '全国55院展開の安心感',
                    '夜20時まで診療で通いやすい'
                ],
                url: 'https://aoki-tsuyoshi.com/tcb/sendai/',
                phone: '022-796-1530'
            },
            {
                rank: 2,
                name: 'リゼクリニック 仙台院',
                rating: '★★★★☆ (4.6)',
                address: '宮城県仙台市青葉区本町2-4-8 510ビル3F',
                access: 'JR仙台駅徒歩3分',
                campaign: '全身脱毛5回 192,000円',
                price: '月々3,700円〜',
                features: [
                    '医療レーザー脱毛専門',
                    '3種類の脱毛機完備',
                    '硬毛化保証付き'
                ],
                url: 'https://www.rizeclinic.com/clinic/sendai.html',
                phone: '0120-966-120'
            },
            {
                rank: 3,
                name: 'エミナルクリニック 仙台院',
                rating: '★★★★☆ (4.4)',
                address: '宮城県仙台市青葉区一番町3-9-13 DATE ONEビル5階',
                access: '仙台市営地下鉄広瀬通駅徒歩3分',
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '業界最安級の料金',
                    '最短5ヶ月で完了',
                    '痛み軽減技術採用'
                ],
                url: 'https://eminal-clinic.jp/clinic/sendai/',
                phone: '022-738-7750'
            }
        ]
    },

    // 千葉 - region_id: 012
    '012': {
        id: '012',
        name: '千葉',
        areaText: '千葉・船橋・柏エリア対応',
        stationInfo: 'JR千葉駅徒歩5分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: '湘南美容クリニック 千葉センシティ院',
                rating: '★★★★★ (4.6)',
                address: '千葉県千葉市中央区新町1000番地 センシティビルディング9階',
                access: 'JR千葉駅東口徒歩1分',
                campaign: '両ワキ脱毛6回 2,500円',
                price: '月々3,000円〜',
                features: [
                    '駅直結で通いやすい',
                    '豊富な症例実績',
                    '安心の全国展開'
                ],
                url: 'https://www.s-b-c.net/clinic/branch/chiba/',
                phone: '0120-955-559'
            },
            {
                rank: 2,
                name: 'TCB東京中央美容外科 千葉院',
                rating: '★★★★☆ (4.5)',
                address: '千葉県千葉市中央区新町1-17-2 MF10ビル6F',
                access: 'JR千葉駅東口徒歩2分',
                campaign: 'VIO脱毛5回 48,000円',
                price: '月々1,700円〜',
                features: [
                    '痛みの少ない脱毛',
                    '豊富な割引制度',
                    '20時まで診療'
                ],
                url: 'https://aoki-tsuyoshi.com/tcb/chiba/',
                phone: '043-310-7577'
            },
            {
                rank: 3,
                name: 'エミナルクリニック 千葉院',
                rating: '★★★★☆ (4.3)',
                address: '千葉県千葉市中央区富士見2-3-1 塚本大千葉ビル7階',
                access: 'JR千葉駅東口徒歩5分',
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '最短5ヶ月完了',
                    'コスパ重視の料金',
                    '予約の取りやすさ'
                ],
                url: 'https://eminal-clinic.jp/clinic/chiba/',
                phone: '043-227-1171'
            }
        ]
    },

    // 東京（新宿）- region_id: 013
    '013': {
        id: '013',
        name: '東京',
        areaText: '新宿・渋谷・池袋エリア対応',
        stationInfo: 'JR新宿駅徒歩3分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: 'レジーナクリニック 新宿院',
                rating: '★★★★★ (4.8)',
                address: '東京都新宿区歌舞伎町1-6-1 シロービル6階',
                access: 'JR新宿駅東口徒歩4分',
                campaign: '全身脱毛5回 99,000円',
                price: '月々1,400円〜',
                features: [
                    '追加料金一切なし',
                    '平日21時まで診療',
                    '完全個室でプライバシー配慮'
                ],
                url: 'https://reginaclinic.jp/clinic/shinjuku/',
                phone: '03-6304-5867'
            },
            {
                rank: 2,
                name: 'アリシアクリニック 新宿東口院',
                rating: '★★★★☆ (4.6)',
                address: '東京都新宿区新宿3-13-5 クリハシビル7F',
                access: 'JR新宿駅東口徒歩2分',
                campaign: '全身脱毛5回 88,000円',
                price: '月々1,400円〜',
                features: [
                    '初回契約時に4回分予約可能',
                    '当日キャンセル無料',
                    '最短4ヶ月で完了'
                ],
                url: 'https://www.aletheia-clinic.com/clinic/shinjuku-higashiguchi/',
                phone: '0120-225-677'
            },
            {
                rank: 3,
                name: '湘南美容クリニック 新宿本院',
                rating: '★★★★☆ (4.4)',
                address: '東京都新宿区西新宿6-5-1 新宿アイランドタワー24F',
                access: 'JR新宿駅西口徒歩10分',
                campaign: '両ワキ脱毛6回 2,500円',
                price: '月々3,000円〜',
                features: [
                    '業界最大手の安心感',
                    '豊富な症例数',
                    '全国どこでも通院可能'
                ],
                url: 'https://www.s-b-c.net/clinic/branch/shinjuku/',
                phone: '0120-548-991'
            }
        ]
    },

    // 大阪（梅田）- region_id: 027
    '027': {
        id: '027',
        name: '大阪',
        areaText: '梅田・心斎橋・難波エリア対応',
        stationInfo: 'JR大阪駅徒歩5分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: 'レジーナクリニック 大阪梅田院',
                rating: '★★★★★ (4.7)',
                address: '大阪府大阪市北区曽根崎新地1-4-20 桜橋IMビル12階',
                access: 'JR大阪駅桜橋出口徒歩8分',
                campaign: '全身脱毛5回 99,000円',
                price: '月々1,400円〜',
                features: [
                    '追加料金なしの安心システム',
                    '平日21時まで診療',
                    '完全個室制'
                ],
                url: 'https://reginaclinic.jp/clinic/osakaumeda/',
                phone: '06-6147-7590'
            },
            {
                rank: 2,
                name: 'リゼクリニック 大阪梅田院',
                rating: '★★★★☆ (4.5)',
                address: '大阪府大阪市北区梅田2-1-21 レイズウメダビル10F',
                access: 'JR大阪駅中央改札口徒歩7分',
                campaign: '全身脱毛5回 192,000円',
                price: '月々3,700円〜',
                features: [
                    '医療レーザー脱毛専門',
                    '3種類の脱毛機',
                    'コース終了後半額以下'
                ],
                url: 'https://www.rizeclinic.com/clinic/osaka-umeda.html',
                phone: '0120-966-120'
            },
            {
                rank: 3,
                name: 'エミナルクリニック 梅田院',
                rating: '★★★★☆ (4.3)',
                address: '大阪府大阪市北区太融寺町5-13 東梅田パークビル6F',
                access: '阪急梅田駅徒歩3分',
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '最短5ヶ月で完了',
                    '痛み軽減システム',
                    '夜21時まで診療'
                ],
                url: 'https://eminal-clinic.jp/clinic/umeda/',
                phone: '06-6315-5707'
            }
        ]
    },

    // 愛知（名古屋）- region_id: 023
    '023': {
        id: '023',
        name: '愛知',
        areaText: '名古屋・岡崎・豊橋エリア対応',
        stationInfo: 'JR名古屋駅徒歩5分以内の好立地',
        clinics: [
            {
                rank: 1,
                name: 'レジーナクリニック 名古屋院',
                rating: '★★★★★ (4.6)',
                address: '愛知県名古屋市中村区名駅2-45-19 桑山ビル5階',
                access: 'JR名古屋駅桜通口徒歩5分',
                campaign: '全身脱毛5回 99,000円',
                price: '月々1,400円〜',
                features: [
                    '追加料金完全無料',
                    '平日21時まで診療',
                    '女性専用・完全個室'
                ],
                url: 'https://reginaclinic.jp/clinic/nagoya/',
                phone: '052-551-4650'
            },
            {
                rank: 2,
                name: 'リゼクリニック 名古屋栄院',
                rating: '★★★★☆ (4.4)',
                address: '愛知県名古屋市中区栄3-17-15 エフエックスビル9F',
                access: '地下鉄栄駅8番出口徒歩3分',
                campaign: '全身脱毛5回 192,000円',
                price: '月々3,700円〜',
                features: [
                    '医療レーザー脱毛専門院',
                    '3種類の脱毛機完備',
                    'コース終了後特別価格'
                ],
                url: 'https://www.rizeclinic.com/clinic/nagoya-sakae.html',
                phone: '0120-966-120'
            },
            {
                rank: 3,
                name: 'エミナルクリニック 名古屋院',
                rating: '★★★★☆ (4.2)',
                address: '愛知県名古屋市中村区名駅2-45-7 松岡第二ビル3階',
                access: 'JR名古屋駅桜通口徒歩4分',
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '最短5ヶ月完了',
                    '業界最安級の料金',
                    '予約が取りやすい'
                ],
                url: 'https://eminal-clinic.jp/clinic/nagoya/',
                phone: '052-583-8637'
            }
        ]
    }
};

// 地域にクリニック詳細データがない場合のフォールバック生成
function generateFallbackClinicData(regionId, regionName) {
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
            },
            {
                rank: 2,
                name: `エミナルクリニック ${regionName}院`,
                rating: '★★★★☆ (4.3)',
                address: `${regionName}の医療脱毛クリニック`,
                access: `${regionName}駅周辺`,
                campaign: '全身脱毛5回 68,000円',
                price: '月々1,000円〜',
                features: [
                    '最短5ヶ月で完了',
                    '痛み軽減技術',
                    'コスパ重視'
                ],
                url: 'https://eminal-clinic.jp/',
                phone: '0120-133-786'
            },
            {
                rank: 3,
                name: `TCB東京中央美容外科 ${regionName}院`,
                rating: '★★★★☆ (4.2)',
                address: `${regionName}エリアの美容外科`,
                access: `${regionName}駅アクセス良好`,
                campaign: 'VIO脱毛5回 48,000円',
                price: '月々1,700円〜',
                features: [
                    '全国55院展開',
                    '痛みの少ない脱毛',
                    '夜20時まで診療'
                ],
                url: 'https://aoki-tsuyoshi.com/',
                phone: '0120-86-7000'
            }
        ]
    };
}

// データベースからクリニック情報を取得する関数
function getClinicDataByRegionId(regionId, regionName) {
    // 詳細データがある場合は返す
    if (CLINIC_DATABASE[regionId]) {
        console.log(`詳細クリニックデータを取得: ${regionId} (${regionName})`);
        return CLINIC_DATABASE[regionId];
    }
    
    // 詳細データがない場合はフォールバックデータを生成
    console.log(`フォールバックデータを生成: ${regionId} (${regionName})`);
    return generateFallbackClinicData(regionId, regionName);
}

// エクスポート（CommonJS環境の場合）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CLINIC_DATABASE,
        getClinicDataByRegionId,
        generateFallbackClinicData
    };
}

// グローバルに公開
window.CLINIC_DATABASE = CLINIC_DATABASE;
window.getClinicDataByRegionId = getClinicDataByRegionId;