# SyncRooms

Yamaha `SYNCROOM` の public ルーム一覧を、**見やすく・探しやすく** 表示する Web アプリです。  
ローカルお気に入り登録、入室/退室通知、フィルタ、入室導線を提供します。

> **重要**: 利用しているデータソースは guest API のみです。  
> `https://webapi.syncroom.appservice.yamaha.com/rooms/guest/online`

---

## 主な機能

- public ルーム一覧の取得と表示
- 一定間隔での自動更新（`30秒 / 1 / 3 / 5 / 10 / 30分 / 手動のみ`）
- お気に入りユーザのローカル管理（`localStorage`）
- 表示フィルターと自動更新間隔の永続化（`localStorage`）
- Web Notifications API による通知
  - 入室通知: 同一セッション中は `(userId, roomId)` ごとに一度だけ
  - 退室通知: 差分検知ごとに毎回通知
  - `Official Test Room` は通知対象外
- ルームカードの見やすさ改善
  - 鍵ありルームは左側に `🔒` アイコン表示 + 薄いグレー背景
  - 部屋説明は固定高さ + 縦スクロールで全文確認可能
  - タグは 2 行以内を目安に間引き表示し、残りは `…+N` のホバーで確認可能
- フィルタ
  - 日本 / 韓国
  - 鍵なし / 鍵あり
  - テストルーム表示
- `入室` ボタンによる外部アプリ起動導線
  - `buildJoinLink(roomId)` は現状プレースホルダ実装

---

## 技術スタック

- `React`
- `TypeScript`
- `Vite`

状態管理は `useState` / `useEffect` / `useMemo` / `useRef` を中心に構成しています。

---

## セットアップ

```bash
npm install
npm run dev -- --host 127.0.0.1
```

ブラウザで以下を開きます。

```text
http://127.0.0.1:5173/
```

### 本番ビルド

```bash
npm run build
```

### プレビュー

```bash
npm run preview
```

---

## Azure Static Web Apps 公開向け設定

このプロジェクトは **Azure Static Web Apps** での公開を想定して、以下を用意しています。

- `public/staticwebapp.config.json`
  - SPA の `index.html` フォールバック設定
  - 公開時の基本セキュリティヘッダー設定
- `.github/workflows/azure-static-web-apps.yml`
  - GitHub Actions による自動デプロイ用テンプレート
- `package.json`
  - Azure / GitHub Actions 側のビルドで使う Node.js バージョンの目安を指定

### Azure 側で設定する値

Azure Static Web Apps 作成時の代表値:

- **App location**: `/`
- **Output location**: `dist`
- **Branch**: `main`（運用ブランチに合わせて変更）

### 公開手順の流れ

1. GitHub にこのリポジトリを push
2. Azure Portal で **Static Web Apps** を作成
3. リポジトリとブランチを接続
4. 必要に応じて GitHub Secret `AZURE_STATIC_WEB_APPS_API_TOKEN` を設定
5. push をトリガーに自動デプロイ

> 注意: 外部 guest API 側の CORS 制約が変更された場合、本番環境で取得できなくなる可能性があります。

---

## 通知について

- 通知を使うには、画面上の **「通知を有効化」** を押してブラウザ許可が必要です。
- 通知本文に時刻は入れていません。OS / ブラウザの通知 UI に任せています。
- 通知クリック時は、該当ルームカードへスクロールしてハイライトします。

---

## データソース制約

このアプリは以下の API **のみ** を使用します。

```text
GET https://webapi.syncroom.appservice.yamaha.com/rooms/guest/online
```

- guest API は public ルームのみ返します
- 入室後 API や非公開 API は推測して利用していません

---

## ディレクトリ構成

```text
src/
  components/
    RoomCard.tsx
    RoomList.tsx
    Toolbar.tsx
  hooks/
    useNotifications.ts
  App.tsx
  logic.ts
  types.ts
```

---

## 備考

- お気に入り設定・表示フィルター・自動更新間隔は `localStorage` に保存されます
- 表示順は現在 `お気に入り通知対象を優先` の固定です
- `syncroom://join?...` はプレースホルダ導線のため、環境によっては動作しない場合があります
