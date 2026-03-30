import type { ClientPlatform } from '../types/api'
import type { D1DatabaseLike } from '../types/env'
import { nowIsoString } from '../utils/time'

type InsertResolveLogParams = {
  firebaseUid: string
  emailHash: string
  resolvedEventId: string | null
  result: 'success' | 'not_found' | 'rejected'
  reasonCode: string
  appVersion: string
  platform: ClientPlatform
}

export class ResolveLogsRepository {
  constructor(private readonly db: D1DatabaseLike) {}

  async insert(params: InsertResolveLogParams): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO resolve_logs (
          firebase_uid,
          email_hash,
          resolved_event_id,
          result,
          reason_code,
          app_version,
          platform,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        params.firebaseUid,
        params.emailHash,
        params.resolvedEventId,
        params.result,
        params.reasonCode,
        params.appVersion,
        params.platform,
        nowIsoString(),
      )
      .run()
  }
}
