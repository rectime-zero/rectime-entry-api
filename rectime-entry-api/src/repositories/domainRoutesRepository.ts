import type { D1DatabaseLike } from '../types/env'

type DomainRouteRow = {
  event_id: string
}

export class DomainRoutesRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async findActiveByDomain(emailDomain: string): Promise<{ eventId: string } | null> {
    const row = await this.db
      .prepare(
        `SELECT event_id
         FROM domain_routes
         WHERE email_domain = ?
           AND is_active = 1
         ORDER BY priority ASC, id ASC
         LIMIT 1`,
      )
      .bind(emailDomain)
      .first<DomainRouteRow>()

    return row ? { eventId: row.event_id } : null
  }
}
