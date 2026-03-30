import type { ErrorHandler } from 'hono'

import { AppError } from '../types/api'
import type { AppBindings } from '../types/env'

export const errorHandler: ErrorHandler<AppBindings> = (error, c) => {
  if (error instanceof AppError) {
    return c.json(
      {
        code: error.code,
        message: error.message,
      },
      error.status,
    )
  }

  console.error('Unhandled error', {
    requestId: c.get('requestId'),
    error,
  })

  return c.json(
    {
      code: 'INTERNAL_ERROR',
      message: '想定外エラーが発生しました',
    },
    500,
  )
}
