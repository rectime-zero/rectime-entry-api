import { Hono } from 'hono'
import { swaggerUI } from '@hono/swagger-ui'

import type { AppBindings } from '../types/env'

const endpoints = [
  {
    method: 'GET',
    path: '/',
    auth: 'none',
    description: 'API の概要とエンドポイント一覧を返します。',
  },
  {
    method: 'GET',
    path: '/openapi.json',
    auth: 'none',
    description: 'OpenAPI 3.0 形式の API 定義を返します。',
  },
  {
    method: 'GET',
    path: '/docs',
    auth: 'none',
    description: 'Swagger UI を返します。',
  },
  {
    method: 'GET',
    path: '/health',
    auth: 'none',
    description: '疎通確認用ヘルスチェックです。',
  },
  {
    method: 'POST',
    path: '/v1/resolve',
    auth: 'Bearer Firebase ID Token',
    description: '認証済みユーザーの接続先イベントを解決します。',
    requestBody: {
      appVersion: '1.0.0',
      platform: 'ios | android',
    },
  },
] as const

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'rectime-entry-api',
    version: '1.0.0',
    description: '認証済みメールアドレスから接続先イベント API を解決する入口 API',
  },
  servers: [
    {
      url: '/',
    },
  ],
  tags: [
    {
      name: 'system',
      description: 'システム系エンドポイント',
    },
    {
      name: 'resolve',
      description: '接続先イベント解決 API',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ResolveRequest: {
        type: 'object',
        required: ['appVersion', 'platform'],
        properties: {
          appVersion: {
            type: 'string',
            example: '1.0.0',
          },
          platform: {
            type: 'string',
            enum: ['ios', 'android'],
            example: 'ios',
          },
        },
      },
      ResolveResponse: {
        type: 'object',
        required: ['eventId', 'apiBaseUrl', 'entryToken', 'expiresIn'],
        properties: {
          eventId: {
            type: 'string',
            example: 'hal-nagoya-2026',
          },
          apiBaseUrl: {
            type: 'string',
            format: 'uri',
            example: 'https://hal-nagoya-2026.example.com',
          },
          entryToken: {
            type: 'string',
            example: 'eyJ...',
          },
          expiresIn: {
            type: 'integer',
            example: 300,
          },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['code', 'message'],
        properties: {
          code: {
            type: 'string',
            example: 'EVENT_NOT_FOUND',
          },
          message: {
            type: 'string',
            example: '接続先イベントが見つかりません',
          },
        },
      },
      IndexResponse: {
        type: 'object',
        required: ['service', 'version', 'endpoints'],
        properties: {
          service: {
            type: 'string',
            example: 'rectime-entry-api',
          },
          version: {
            type: 'string',
            example: '1',
          },
          endpoints: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                method: { type: 'string' },
                path: { type: 'string' },
                auth: { type: 'string' },
                description: { type: 'string' },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['system'],
        summary: 'API 一覧',
        responses: {
          '200': {
            description: 'API 一覧',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/IndexResponse',
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['system'],
        summary: 'ヘルスチェック',
        responses: {
          '200': {
            description: '疎通確認結果',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/v1/resolve': {
      post: {
        tags: ['resolve'],
        summary: '接続先イベント解決',
        security: [
          {
            bearerAuth: [],
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ResolveRequest',
              },
            },
          },
        },
        responses: {
          '200': {
            description: '解決成功',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ResolveResponse',
                },
              },
            },
          },
          '400': {
            description: '不正なリクエスト',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '401': {
            description: '認証エラー',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '403': {
            description: '利用対象外またはメール未確認',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '404': {
            description: '接続先なし',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '409': {
            description: 'イベント停止中',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          '500': {
            description: '内部エラー',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
} as const

export const docsRoute = new Hono<AppBindings>()

docsRoute.get('/', (c) => {
  return c.json({
    service: 'rectime-entry-api',
    version: '1',
    endpoints,
  })
})

docsRoute.get('/openapi.json', (c) => {
  return c.json(openApiDocument)
})

docsRoute.get('/docs', swaggerUI({ url: '/openapi.json' }))
