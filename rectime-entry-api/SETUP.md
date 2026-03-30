# セットアップ

## ローカル開発

1. 依存関係をインストールします。

```txt
npm install
```

2. `.dev.vars.example` を `.dev.vars` にコピーして値を設定します。

必要な設定は次の 2 種類です。

- `WRANGLER_...`: Worker と D1 の設定
- `FIREBASE_CLIENT_EMAIL` など: 実行時 secret

3. ローカル D1 にスキーマを適用します。

```txt
npm run generate:wrangler-toml
npx wrangler d1 execute rectime-entry-api-local --local --config wrangler.toml --file migrations/0001_initial.sql
```

4. アプリを起動します。

```txt
npm run dev
```

`npm run dev` は `.dev.vars` を読んで `wrangler.toml` を生成し、その設定で `wrangler dev --config wrangler.toml` を起動します。`wrangler.jsonc` は使いません。

## GitHub Actions デプロイ

デプロイでは GitHub Environments を使い、Actions 実行時に `wrangler.toml` を生成します。

関連ファイル:

- [deploy-workers-main.yml](/K:/GitHub-Project/rectime-zero/rectime-entry-api/rectime-entry-api/.github/workflows/deploy-workers-main.yml)
- [deploy-workers-develop.yml](/K:/GitHub-Project/rectime-zero/rectime-entry-api/rectime-entry-api/.github/workflows/deploy-workers-develop.yml)
- [generate-wrangler-toml.mjs](/K:/GitHub-Project/rectime-zero/rectime-entry-api/rectime-entry-api/scripts/generate-wrangler-toml.mjs)

GitHub には次の Environment を作成します。

- `production`
- `develop`

各 Environment には `WRANGLER_` prefix の変数を設定します。生成スクリプトが自動で `wrangler.toml` に変換するため、設定項目を増やしても workflow の修正は不要です。

Secrets:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

Variables:

```txt
WRANGLER_ROOT_NAME
WRANGLER_ROOT_MAIN
WRANGLER_ROOT_COMPATIBILITY_DATE
WRANGLER_VAR_FIREBASE_PROJECT_ID
WRANGLER_TABLE_D1_DATABASES_0_BINDING
WRANGLER_TABLE_D1_DATABASES_0_DATABASE_NAME
WRANGLER_TABLE_D1_DATABASES_0_DATABASE_ID
```

命名ルール:

```txt
WRANGLER_ROOT_<KEY>                # 例: WRANGLER_ROOT_NAME
WRANGLER_VAR_<KEY>                 # 例: WRANGLER_VAR_FIREBASE_PROJECT_ID
WRANGLER_TABLE_<TABLE>_<N>_<KEY>   # 例: WRANGLER_TABLE_D1_DATABASES_0_BINDING
```

## Cloudflare Worker Secrets

以下は GitHub Variables ではなく、Cloudflare Workers 側に登録します。

```txt
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
ENTRY_TOKEN_SECRET
```