export type ClientPlatform = 'ios' | 'android' | 'web'

export type ResolveRequestBody = {
  appVersion: string
  platform: ClientPlatform
}

export type ResolveByEmailRequestBody = ResolveRequestBody & {
  email: string
}

export type ErrorCode =
  | 'BAD_REQUEST'
  | 'EMAIL_NOT_VERIFIED'
  | 'EVENT_INACTIVE'
  | 'EVENT_NOT_FOUND'
  | 'FORBIDDEN_EMAIL'
  | 'INTERNAL_ERROR'
  | 'UNAUTHORIZED'

export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}
