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
      origin: (origin, c) => c.env.CORS_ALLOWED_ORIGIN || origin || '*',
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
