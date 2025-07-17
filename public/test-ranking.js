#!/usr/bin/env node
// ローカルでランキング変更をテストするスクリプト

const fs = require('fs');
const path = require('path');

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

// ランキングをテスト表示
function testRankings() {
    console.log('🔍 現在のランキング確認中...\n');
    
    const regionMaster = readCSV('./data/region_master.csv');
    const clinicMaster = readCSV('./data/clinic_master.csv');
    const clinicLocations = readCSV('./data/clinic_locations.csv');
    const regionalRankings = readCSV('./data/regional_rankings.csv');
    
    regionalRankings.forEach(ranking => {
        const region = regionMaster.find(r => r.region_id === ranking.region_id);
        if (!region) return;
        
        console.log(`📍 ${region.region_name} (${region.region_id})`);
        console.log('─'.repeat(40));
        
        for (let rank = 1; rank <= 3; rank++) {
            const locationId = ranking[`rank${rank}_location`];
            if (locationId) {
                const location = clinicLocations.find(l => l.location_id === locationId);
                if (location) {
                    const clinic = clinicMaster.find(c => c.clinic_id === location.clinic_id);
                    if (clinic) {
                        console.log(`${rank}位: ${clinic.clinic_name} ${location.branch_name}`);
                        console.log(`     評価: ${location.rating} | 価格: ${location.monthly_price}`);
                        console.log(`     キャンペーン: ${location.campaign}`);
                    } else {
                        console.log(`${rank}位: ❌ クリニック情報なし (location_id: ${locationId})`);
                    }
                } else {
                    console.log(`${rank}位: ❌ 店舗情報なし (location_id: ${locationId})`);
                }
            }
        }
        console.log('');
    });
}

// テスト実行
testRankings();