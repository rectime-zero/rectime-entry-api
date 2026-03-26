export function parseAuthorizationBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) {
    return null
  }

  const match = headerValue.match(/^Bearer\s+(.+)$/i)
  return match ? match[1] : null
}
