import { Hono } from 'hono'

import { AppError, type ResolveByEmailRequestBody, type ResolveRequestBody } from '../types/api'
import type { AppBindings } from '../types/env'
import { verifyFirebaseIdToken, type VerifiedFirebaseToken } from '../services/firebase'
import { resolveEventForEmail, resolveEventForUser } from '../services/resolver'
import { issueEntryToken, ENTRY_TOKEN_TTL_SECONDS } from '../services/token'
import { assertDatabaseEnv, assertRuntimeEnv } from '../utils/env'
import { parseAuthorizationBearerToken } from '../utils/http'

export const resolveRoute = new Hono<AppBindings>()

resolveRoute.post('/v1/resolve', async (c) => {
  assertRuntimeEnv(c.env)

  const bearerToken = parseAuthorizationBearerToken(c.req.header('Authorization'))
  if (!bearerToken) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  await parseResolveBody(c.req.raw)

  const verifiedToken: VerifiedFirebaseToken = await verifyFirebaseIdToken(bearerToken, c.env)
  const resolution = await resolveEventForUser(c.env.DB, verifiedToken)
  const entryToken = await issueEntryToken({
    env: c.env,
    eventId: resolution.event.id,
    uid: verifiedToken.uid,
    email: verifiedToken.email,
  })

  return c.json({
    eventId: resolution.event.id,
    apiBaseUrl: resolution.event.backendUrl,
    entryToken,
    expiresIn: ENTRY_TOKEN_TTL_SECONDS,
  })
})

resolveRoute.post('/v1/resolve-email', async (c) => {
  assertDatabaseEnv(c.env)

  const body = await parseResolveByEmailBody(c.req.raw)
  const resolution = await resolveEventForEmail(c.env.DB, body.email)

  return c.json({
    eventId: resolution.event.id,
    apiBaseUrl: resolution.event.backendUrl,
  })
})

async function parseResolveBody(request: Request): Promise<ResolveRequestBody> {
  let json: unknown

  try {
    json = await request.json()
  } catch {
    throw new AppError(400, 'BAD_REQUEST', 'リクエストボディが不正です')
  }

  if (!json || typeof json !== 'object') {
    throw new AppError(400, 'BAD_REQUEST', 'リクエストボディが不正です')
  }

  const { appVersion, platform } = json as Record<string, unknown>
  if (typeof appVersion !== 'string' || appVersion.length === 0) {
    throw new AppError(400, 'BAD_REQUEST', 'appVersion が不正です')
  }

  if (platform !== 'ios' && platform !== 'android' && platform !== 'web') {
    throw new AppError(400, 'BAD_REQUEST', 'platform が不正です')
  }

  return { appVersion, platform }
}

async function parseResolveByEmailBody(request: Request): Promise<ResolveByEmailRequestBody> {
  let json: unknown

  try {
    json = await request.json()
  } catch {
    throw new AppError(400, 'BAD_REQUEST', 'リクエストボディが不正です')
  }

  if (!json || typeof json !== 'object') {
    throw new AppError(400, 'BAD_REQUEST', 'リクエストボディが不正です')
  }

  const { email } = json as Record<string, unknown>
  if (typeof email !== 'string' || email.trim().length === 0) {
    throw new AppError(400, 'BAD_REQUEST', 'email が不正です')
  }

  return {
    email,
  }
}
