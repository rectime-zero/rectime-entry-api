import type { D1DatabaseLike } from '../types/env'

type EventRow = {
  id: string
  name: string
  backend_url: string
  status: string
  created_at: string
  updated_at: string
}

export type EventRecord = {
  id: string
  name: string
  backendUrl: string
  status: string
  createdAt: string
  updatedAt: string
}

export class EventsRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async findById(id: string): Promise<EventRecord | null> {
    const row = await this.db
      .prepare(
        `SELECT id, name, backend_url, status, created_at, updated_at
         FROM events
         WHERE id = ?`,
      )
      .bind(id)
      .first<EventRow>()

    if (!row) {
      return null
    }

    return {
      id: row.id,
      name: row.name,
      backendUrl: row.backend_url,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}
