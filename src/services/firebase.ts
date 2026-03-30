import { AppError } from '../types/api'
import type { Env } from '../types/env'

type Jwk = JsonWebKey & {
  kid?: string
}

type JwtHeader = {
  alg?: string
  kid?: string
}

type FirebaseJwtPayload = {
  aud?: string
  email?: string
  email_verified?: boolean
  exp?: number
  iat?: number
  iss?: string
  sub?: string
}

export type VerifiedFirebaseToken = {
  uid: string
  email: string
  emailVerified: boolean
}

type CachedJwks = {
  expiresAt: number
  keys: Map<string, CryptoKey>
}

const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'

let cachedJwks: CachedJwks | null = null

export async function verifyFirebaseIdToken(token: string, env: Env): Promise<VerifiedFirebaseToken> {
  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.')
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  const header = parseJwtPart<JwtHeader>(encodedHeader)
  const payload = parseJwtPart<FirebaseJwtPayload>(encodedPayload)

  if (header.alg !== 'RS256' || !header.kid) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  const signingInput = encodeUtf8(`${encodedHeader}.${encodedPayload}`)
  const signature = decodeBase64Url(encodedSignature)
  const publicKey = await getFirebasePublicKey(header.kid)
  const isValid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    publicKey,
    signature,
    signingInput,
  )

  if (!isValid) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  validateFirebaseClaims(payload, env.FIREBASE_PROJECT_ID)

  if (typeof payload.email !== 'string' || payload.email.length === 0) {
    throw new AppError(403, 'FORBIDDEN_EMAIL', 'このアカウントは利用対象外です')
  }

  return {
    uid: payload.sub as string,
    email: payload.email,
    emailVerified: payload.email_verified === true,
  }
}

function validateFirebaseClaims(payload: FirebaseJwtPayload, projectId: string) {
  const now = Math.floor(Date.now() / 1000)

  if (payload.aud !== projectId) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  if (typeof payload.exp !== 'number' || payload.exp <= now) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンの有効期限が切れています')
  }

  if (typeof payload.iat !== 'number' || payload.iat > now + 60) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }
}

async function getFirebasePublicKey(kid: string): Promise<CryptoKey> {
  const now = Date.now()
  if (cachedJwks && cachedJwks.expiresAt > now) {
    const cachedKey = cachedJwks.keys.get(kid)
    if (cachedKey) {
      return cachedKey
    }
  }

  const response = await fetch(JWKS_URL)
  if (!response.ok) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Firebase 公開鍵の取得に失敗しました')
  }

  const body = (await response.json()) as { keys?: Jwk[] }
  const jwks = body.keys ?? []
  const keys = new Map<string, CryptoKey>()

  for (const jwk of jwks) {
    if (!jwk.kid || jwk.kty !== 'RSA') {
      continue
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    )

    keys.set(jwk.kid, cryptoKey)
  }

  cachedJwks = {
    expiresAt: now + parseCacheMaxAge(response.headers.get('Cache-Control')) * 1000,
    keys,
  }

  const key = keys.get(kid)
  if (!key) {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }

  return key
}

function parseCacheMaxAge(cacheControl: string | null): number {
  if (!cacheControl) {
    return 3600
  }

  const match = cacheControl.match(/max-age=(\d+)/)
  return match ? Number(match[1]) : 3600
}

function parseJwtPart<T>(value: string): T {
  try {
    return JSON.parse(new TextDecoder().decode(decodeBase64Url(value))) as T
  } catch {
    throw new AppError(401, 'UNAUTHORIZED', '認証トークンが不正です')
  }
}

function encodeUtf8(value: string): ArrayBuffer {
  const bytes = new TextEncoder().encode(value)
  const buffer = new ArrayBuffer(bytes.length)
  new Uint8Array(buffer).set(bytes)
  return buffer
}

function decodeBase64Url(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return buffer
}
