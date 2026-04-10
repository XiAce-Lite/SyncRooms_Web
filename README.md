# SyncRooms Web

Yamaha `SYNCROOM` の public ルーム一覧を、**見やすく・探しやすく** 表示する Web アプリです。  
ローカルお気に入り登録、入室/退室通知、ソート、フィルタ、入室導線を提供します。

> **重要**: 利用しているデータソースは guest API のみです。  
> `https://webapi.syncroom.appservice.yamaha.com/rooms/guest/online`

---

## 主な機能

- public ルーム一覧の取得と表示
- 一定間隔での自動更新（`1 / 3 / 5 / 10 / 30分 / 手動のみ`）
- お気に入りユーザのローカル管理（`localStorage`）
- Web Notifications API による通知
  - 入室通知: 同一セッション中は `(userId, roomId)` ごとに一度だけ
  - 退室通知: 差分検知ごとに毎回通知
  - `Official Test Room` は通知対象外
- 並び替え
  - お気に入り通知対象を優先
  - お気に入り人数が多い順
  - API順
- フィルタ
  - 日本側 / 韓国側
  - 鍵なし / 鍵あり
  - Test Room 表示
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
npm run dev -- --host 127.0.0.1 --port 4173
```

ブラウザで以下を開きます。

```text
http://127.0.0.1:4173/
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

- お気に入り設定は現時点ではローカル仮データです
- 永続化先は `localStorage` を利用しています
- `syncroom://join?...` はプレースホルダ導線のため、環境によっては動作しない場合があります
