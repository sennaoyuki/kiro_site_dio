// Region 004 (宮城) ランキング確認スクリプト

// clinic-database-generated.jsの読み込みをシミュレート
const fs = require('fs');
const path = require('path');

// ファイルを読み込み
const clinicDatabasePath = path.join(__dirname, 'clinic-database-generated.js');
const clinicDatabaseContent = fs.readFileSync(clinicDatabasePath, 'utf8');

// CLINIC_DATABASE_GENERATEDを抽出
const matches = clinicDatabaseContent.match(/const CLINIC_DATABASE_GENERATED = ({[\s\S]*?});/);
if (matches) {
    const databaseCode = `const CLINIC_DATABASE_GENERATED = ${matches[1]};`;
    eval(databaseCode);
    
    // 004地域のデータを確認
    const region004 = CLINIC_DATABASE_GENERATED['004'];
    
    if (region004) {
        console.log('\n=== 宮城（004）地域のランキング ===');
        console.log(`地域名: ${region004.name}`);
        console.log(`エリア: ${region004.areaText}`);
        console.log('\nクリニックランキング:');
        
        region004.clinics.forEach((clinic, index) => {
            console.log(`${index + 1}位: ${clinic.name}`);
            console.log(`   💰 ${clinic.price}`);
            console.log(`   📢 ${clinic.campaign}`);
            console.log(`   ⭐ ${clinic.rating}`);
            console.log(`   📍 ${clinic.address}`);
            console.log('');
        });
        
        console.log('\n=== 04_rankingresults.html での表示予想 ===');
        region004.clinics.forEach((clinic, index) => {
            const cleanName = clinic.name.replace(/ [^ ]*院$/, '');
            const displayName = `${cleanName} ${region004.name}院（医療脱毛）`;
            const rankText = index === 0 ? '🏆 第1位 最もおすすめ' : `第${index + 1}位`;
            const price = clinic.price.replace('月々', '');
            
            console.log(`${rankText}`);
            console.log(`クリニック名: ${displayName}`);
            console.log(`表示価格: ${price}`);
            console.log(`キャンペーン: ${clinic.campaign}`);
            console.log('');
        });
        
        console.log('\n=== 06_comparisontable.html での表示予想 ===');
        region004.clinics.forEach((clinic, index) => {
            const cleanName = clinic.name.split(' ')[0];
            
            console.log(`${index + 1}位: ${cleanName}`);
            console.log(`表示価格: ${clinic.price}`);
            console.log('');
        });
        
    } else {
        console.log('❌ 宮城（004）地域のデータが見つかりません');
    }
} else {
    console.log('❌ clinic-database-generated.jsからデータを抽出できませんでした');
}