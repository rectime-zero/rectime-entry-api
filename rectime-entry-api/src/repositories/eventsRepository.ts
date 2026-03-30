import type { D1DatabaseLike } from '../types/env'

type EventRow = {
  id: number | string
  name: string
  backend_url: string
  is_active: number
  created_at: string
}

export type EventRecord = {
  id: string
  name: string
  backendUrl: string
  isActive: boolean
  createdAt: string
}

export class EventsRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async findById(id: string): Promise<EventRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, name, backend_url, is_active, created_at
         FROM events
         WHERE id = ?`,
      )
      .bind(id)
      .first<EventRow>()

    if (!row) {
      return null
    }

    return {
      id: String(row.id),
      name: row.name,
      backendUrl: row.backend_url,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
    }
  }
}
