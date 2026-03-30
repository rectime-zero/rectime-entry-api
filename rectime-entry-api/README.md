# rectime-entry-api

認証済みユーザーのメールアドレスとトークン情報をもとに、接続先イベント API を解決する入口 API です。Cloudflare Workers 上で動作する HTTP API として公開します。

## 特徴

- 認証済み Firebase ユーザーから接続先イベントを解決する
- D1 の `events` `domain_routes` `email_exceptions` を参照する
- Cloudflare Workers 上で軽量に動作する

## 技術スタック

- Runtime: Cloudflare Workers
- Web Framework: Hono
- Database: Cloudflare D1
- Language: TypeScript
- CI/CD: GitHub Actions

## エンドポイント

```txt
GET  /health
POST /v1/resolve
POST /v1/resolve-email
```

## DB スキーマ

ローカル構築と本番投入で使う基準スキーマは `schema.sql` です。アプリケーション実装もこの 3 テーブル前提です。

## セットアップとデプロイ

セットアップ、ローカル開発、GitHub Actions デプロイ手順は [SETUP.md](/K:/GitHub-Project/rectime-zero/rectime-entry-api/rectime-entry-api/SETUP.md) を参照してください。

## スクリプト

```txt
npm run dev
npm run generate:wrangler-toml
npm run deploy
npm run cf-typegen
```
