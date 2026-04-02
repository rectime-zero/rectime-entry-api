import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { errorHandler } from './middleware/errorHandler'
import { requestId } from './middleware/requestId'
import { healthRoute } from './routes/health'
import { resolveRoute } from './routes/resolve'
import type { AppBindings } from './types/env'

export function createApp() {
  const app = new Hono<AppBindings>()

  app.use(
    '*',
    cors({
      origin: (origin, c) => resolveCorsOrigin(origin, c.env.CORS_ALLOWED_ORIGIN),
      allowHeaders: ['Authorization', 'Content-Type'],
      allowMethods: ['GET', 'POST', 'OPTIONS'],
      credentials: false,
    }),
  )
  app.use('*', requestId)
  app.onError(errorHandler)

  app.route('/', healthRoute)
  app.route('/', resolveRoute)

  app.notFound((c) => {
    return c.body(null, 404)
  })

  return app
}

function resolveCorsOrigin(requestOrigin: string | undefined, allowedOriginEnv: string | undefined) {
  if (!allowedOriginEnv) {
    return requestOrigin || '*'
  }

  const allowedOrigins = allowedOriginEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0)

  if (!requestOrigin) {
    return allowedOrigins[0] || '*'
  }

  return allowedOrigins.includes(requestOrigin) ? requestOrigin : allowedOrigins[0] || '*'
}
