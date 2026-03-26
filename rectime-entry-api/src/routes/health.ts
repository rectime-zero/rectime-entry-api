import { Hono } from 'hono'

import type { AppBindings } from '../types/env'

export const healthRoute = new Hono<AppBindings>()

healthRoute.get('/health', (c) => {
  return c.json({ status: 'ok' })
})
