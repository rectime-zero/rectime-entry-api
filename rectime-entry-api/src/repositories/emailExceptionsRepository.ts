import type { D1DatabaseLike } from '../types/env'
import { nowIsoString } from '../utils/time'

type EmailExceptionRow = {
  event_id: string
}

export class EmailExceptionsRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async findActiveByEmail(email: string): Promise<{ eventId: string } | null> {
    const row = await this.db
      .prepare(
        `SELECT event_id
         FROM email_exceptions
         WHERE email = ?
           AND is_active = 1
           AND (expires_at IS NULL OR expires_at > ?)
         ORDER BY id ASC
         LIMIT 1`,
      )
      .bind(email, nowIsoString())
      .first<EmailExceptionRow>()

    return row ? { eventId: row.event_id } : null
  }
}
