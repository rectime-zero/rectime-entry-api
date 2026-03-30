import { AppError } from '../types/api'
import type { Env } from '../types/env'

const REQUIRED_TOKEN_ENV_KEYS = ['FIREBASE_PROJECT_ID', 'ENTRY_TOKEN_SECRET'] as const

export function assertDatabaseEnv(env: Env) {
  if (!env.DB || typeof env.DB.prepare !== 'function') {
    throw new AppError(500, 'INTERNAL_ERROR', 'D1 binding DB が未設定です')
  }
}

export function assertRuntimeEnv(env: Env) {
  assertDatabaseEnv(env)

  for (const key of REQUIRED_TOKEN_ENV_KEYS) {
    const value = env[key]
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new AppError(500, 'INTERNAL_ERROR', `環境変数 ${key} が未設定です`)
    }
  }
}
