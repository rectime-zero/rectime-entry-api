const encoder = new TextEncoder()

export async function hashEmail(email: string): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(normalizedEmail))
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}
