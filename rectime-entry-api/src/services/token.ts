import { AppError } from '../types/api'
import type { Env } from '../types/env'

export const ENTRY_TOKEN_TTL_SECONDS = 300

type IssueEntryTokenParams = {
  env: Env
  eventId: string
  uid: string
  email: string
}

export async function issueEntryToken(params: IssueEntryTokenParams): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  }
  const payload = {
    iss: 'rectime-entry-api',
    aud: params.eventId,
    sub: params.uid,
    email: params.email,
    eventId: params.eventId,
    iat: now,
    exp: now + ENTRY_TOKEN_TTL_SECONDS,
  }

  try {
    return await signJwt(header, payload, params.env.ENTRY_TOKEN_SECRET)
  } catch {
    throw new AppError(500, 'INTERNAL_ERROR', 'entry token の発行に失敗しました')
  }
}

async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  const encodedHeader = encodeBase64Url(JSON.stringify(header))
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput))
  return `${signingInput}.${encodeBase64Url(signature)}`
}

function encodeBase64Url(value: string | ArrayBuffer): string {
  const bytes =
    typeof value === 'string' ? new TextEncoder().encode(value) : new Uint8Array(value)

  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}
