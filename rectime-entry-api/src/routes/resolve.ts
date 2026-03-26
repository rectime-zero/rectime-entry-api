import { Hono } from 'hono'

import { AppError, type ResolveRequestBody } from '../types/api'
import type { AppBindings } from '../types/env'
import { ResolveLogsRepository } from '../repositories/resolveLogsRepository'
import { verifyFirebaseIdToken, type VerifiedFirebaseToken } from '../services/firebase'
import { resolveEventForUser } from '../services/resolver'
import { issueEntryToken, ENTRY_TOKEN_TTL_SECONDS } from '../services/token'
import { assertRuntimeEnv } from '../utils/env'
import { hashEmail } from '../utils/hash'
import { parseAuthorizationBearerToken } from '../utils/http'

export const resolveRoute = new Hono<AppBindings>()

resolveRoute.post('/v1/resolve', async (c) => {
  assertRuntimeEnv(c.env)

  const bearerToken = parseAuthorizationBearerToken(c.req.header('Authorization'))
  if (!bearerToken) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  const body = await parseResolveBody(c.req.raw)
  const logsRepository = new ResolveLogsRepository(c.env.DB)

  let verifiedToken: VerifiedFirebaseToken | null = null

  try {
    verifiedToken = await verifyFirebaseIdToken(bearerToken, c.env)
    const resolution = await resolveEventForUser(c.env.DB, verifiedToken)
    const entryToken = await issueEntryToken({
      env: c.env,
      eventId: resolution.event.id,
      uid: verifiedToken.uid,
      email: verifiedToken.email,
    })

    await logsRepository.insert({
      firebaseUid: verifiedToken.uid,
      emailHash: await hashEmail(verifiedToken.email),
      resolvedEventId: resolution.event.id,
      result: 'success',
      reasonCode: resolution.reasonCode,
      appVersion: body.appVersion,
      platform: body.platform,
    })

    return c.json({
      eventId: resolution.event.id,
      apiBaseUrl: resolution.event.backendUrl,
      entryToken,
      expiresIn: ENTRY_TOKEN_TTL_SECONDS,
    })
  } catch (error) {
    if (verifiedToken) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(500, 'INTERNAL_ERROR', '想定外エラーが発生しました')

      await logsRepository.insert({
        firebaseUid: verifiedToken.uid,
        emailHash: await hashEmail(verifiedToken.email),
        resolvedEventId: null,
        result: appError.code === 'EVENT_NOT_FOUND' ? 'not_found' : 'rejected',
        reasonCode: appError.code,
        appVersion: body.appVersion,
        platform: body.platform,
      })
    }

    throw error
  }
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

  if (platform !== 'ios' && platform !== 'android') {
    throw new AppError(400, 'BAD_REQUEST', 'platform が不正です')
  }

  return { appVersion, platform }
}
