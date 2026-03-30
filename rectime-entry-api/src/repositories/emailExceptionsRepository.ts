import type { D1DatabaseLike } from '../types/env'

type EmailExceptionRow = {
  event_id: number | string
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
         ORDER BY sort_order ASC, id ASC
         LIMIT 1`,
      )
      .bind(email)
      .first<EmailExceptionRow>()

    return row ? { eventId: String(row.event_id) } : null
  }
}
