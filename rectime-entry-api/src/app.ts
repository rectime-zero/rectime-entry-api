import { Hono } from 'hono'

import { errorHandler } from './middleware/errorHandler'
import { requestId } from './middleware/requestId'
import { healthRoute } from './routes/health'
import { resolveRoute } from './routes/resolve'
import type { AppBindings } from './types/env'

export function createApp() {
  const app = new Hono<AppBindings>()

  app.use('*', requestId)
  app.onError(errorHandler)

  app.route('/', healthRoute)
  app.route('/', resolveRoute)

  app.notFound((c) => {
    return c.json(
      {
        code: 'NOT_FOUND',
        message: 'リソースが見つかりません',
      },
      404,
    )
  })

  return app
}