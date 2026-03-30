# rectime-entry-api

接続元ユーザーを認証し、そのメールアドレスやトークン情報をもとに接続先イベントを解決する入口 API です。Cloudflare Workers 上で動作し、HTTP API と Swagger UI を提供します。

## 役割

- 認証済みリクエストから接続先イベントを解決する
- D1 に保存されたイベント関連データを参照する
- OpenAPI と Swagger UI を提供する
- Cloudflare Workers 上で軽量に動作する API として公開する

## 技術スタック

- Runtime: Cloudflare Workers
- Web Framework: Hono
- Database: Cloudflare D1
- API Docs: OpenAPI, Swagger UI
- Language: TypeScript
- CI/CD: GitHub Actions

## エンドポイント

```txt
GET  /
GET  /openapi.json
GET  /docs
GET  /health
POST /v1/resolve
```

## 開発とデプロイ

セットアップ、ローカル開発、GitHub Actions デプロイ手順は [SETUP.md](/K:/GitHub-Project/rectime-zero/rectime-entry-api/rectime-entry-api/SETUP.md) を参照してください。

## スクリプト

```txt
npm run dev
npm run generate:wrangler-toml
npm run deploy
npm run cf-typegen
```