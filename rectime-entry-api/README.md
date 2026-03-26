# rectime-entry-api

Cloudflare Workers + Hono + D1 で動く、認証済みメールアドレスから接続先イベント API を解決する入口 API です。

## セットアップ

```txt
npm install
```

`wrangler.jsonc` に `FIREBASE_PROJECT_ID` を設定し、D1 バインディング `DB` を追加します。秘密情報は `wrangler secret put`、ローカル開発では `.dev.vars` で渡します。

```txt
wrangler secret put FIREBASE_CLIENT_EMAIL
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put ENTRY_TOKEN_SECRET
```

`.dev.vars.example` をコピーして `.dev.vars` を作るとローカル確認しやすいです。

## D1 スキーマ

```txt
wrangler d1 execute <DB_NAME> --file migrations/0001_initial.sql
```

## エンドポイント一覧

```txt
GET  /
GET  /openapi.json
GET  /docs
GET  /health
POST /v1/resolve
```

`/docs` は Swagger UI、`/openapi.json` は OpenAPI 定義です。

## ローカル開発

```txt
npm run dev
```

IntelliJ IDEA では共有 Run Configuration `rectime-entry-api dev` を追加済みです。右上の実行ボタンからそのまま `npm run dev` を起動できます。

## デプロイ

```txt
npm run deploy
```
