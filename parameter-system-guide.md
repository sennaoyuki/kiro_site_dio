# パラメータベースランキングシステム 統合ガイド

## 概要

パラメータベースランキングシステムは、URLパラメータ `parameter_no` を使用して、data2フォルダのCSVデータに基づいて5つのクリニックの順序を動的に変更するシステムです。

## 使い方

### 基本的な使用方法

1. **パラメータ指定でアクセス**
   ```
   index.html?parameter_no=001
   index.html?parameter_no=020
   index.html?parameter_no=063
   ```

2. **パラメータ範囲**
   - 有効な範囲: 001～063
   - デフォルト: 001（パラメータが無効または指定されていない場合）

### テストページ

テストページで機能を確認できます:
```
test-parameter-ranking.html
```

## システム構成

### 主要コンポーネント

1. **parameter-csv-data-loader.js**
   - data2フォルダのCSVファイルを読み込む
   - items.csv、ranking.csv、stores.csvを解析

2. **parameter-handler.js**
   - URLパラメータの管理
   - パラメータ変更の通知

3. **parameter-ranking-engine.js**
   - parameter_noに基づいてランキングを生成
   - クリニックデータの構築

4. **ranking-sync-system-enhanced.js**
   - 既存の地域ベースシステムを拡張
   - パラメータモードと地域モードの切り替え

5. **iframe-parameter-handler.js**
   - iframeコンポーネントへのデータ配信
   - パラメータ変更の同期

6. **parameter-error-handler.js**
   - エラー処理とフォールバック
   - 自動回復機能

## データ形式

### CSVファイル構造

**data2/出しわけSS - items.csv**
```
clinic_id,clinic_name,code
1,SBCスキンクリニック,SBC
2,エミシアクリニック,EMI
...
```

**data2/出しわけSS - ranking.csv**
```
parameter_no,no1,no2,no3,no4,no5
1,1,2,3,4,5
2,2,3,4,5,1
...
```

**data2/出しわけSS - stores.csv**
```
store_id,clinic_name,store_name,zipcode,address,access
1,SBCスキンクリニック,新宿院,160-0023,東京都新宿区...,JR新宿駅から徒歩3分
...
```

## 動作モード

### パラメータモード
- URLに `parameter_no` が含まれる場合
- data2フォルダのCSVデータを使用
- 5つのクリニックを指定された順序で表示

### 地域モード（既存）
- URLに `region_id` が含まれる場合
- 既存の地域ベースデータを使用
- 地域ごとのクリニック情報を表示

## デバッグ機能

ブラウザのコンソールで以下のコマンドが使用可能:

```javascript
// 現在のモードを確認
getCurrentMode()

// パラメータモードに切り替え
switchToParameter('020')

// 地域モードに切り替え
switchToRegion('012')

// ランキング情報を表示
showRanking()

// パラメータエラーを表示
showParameterErrors()

// デバッグ情報を表示
debugParameter()
```

## トラブルシューティング

### CSVファイルが読み込めない場合
- data2フォルダの存在を確認
- CSVファイル名が正しいか確認
- ブラウザのコンソールでエラーを確認

### パラメータが反映されない場合
- URLパラメータの形式を確認（parameter_no=001）
- パラメータ範囲（001-063）を確認
- コンソールでエラーを確認

### デフォルトデータが表示される場合
- CSVファイルの読み込みエラーを確認
- パラメータの妥当性を確認
- エラーハンドラーのログを確認

## 注意事項

1. パラメータモードと地域モードは排他的（同時使用不可）
2. CSVファイルはUTF-8エンコーディングである必要がある
3. ローカル環境ではCORSエラーが発生する可能性がある（サーバー経由で実行推奨）