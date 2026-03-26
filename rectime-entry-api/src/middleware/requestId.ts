import type { MiddlewareHandler } from 'hono'

import type { AppBindings } from '../types/env'

export const requestId: MiddlewareHandler<AppBindings> = async (c, next) => {
  const requestId = c.req.header('X-Request-Id') ?? crypto.randomUUID()
  c.set('requestId', requestId)
  c.header('X-Request-Id', requestId)
  await next()
}
