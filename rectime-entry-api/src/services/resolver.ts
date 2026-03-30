import { DomainRoutesRepository } from '../repositories/domainRoutesRepository'
import { EmailExceptionsRepository } from '../repositories/emailExceptionsRepository'
import { EventsRepository, type EventRecord } from '../repositories/eventsRepository'
import { AppError } from '../types/api'
import type { D1DatabaseLike } from '../types/env'
import type { VerifiedFirebaseToken } from './firebase'

export type ResolveResult = {
  event: EventRecord
  reasonCode: 'EMAIL_EXCEPTION_MATCH' | 'DOMAIN_ROUTE_MATCH'
}

export async function resolveEventForUser(
  db: D1DatabaseLike,
  user: VerifiedFirebaseToken,
): Promise<ResolveResult> {
  if (!user.emailVerified) {
    throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'メールアドレスの確認が完了していません')
  }

  return resolveEventForEmail(db, user.email)
}

export async function resolveEventForEmail(
  db: D1DatabaseLike,
  email: string,
): Promise<ResolveResult> {
  const normalizedEmail = normalizeEmail(email)
  const emailDomain = extractEmailDomain(normalizedEmail)

  const emailExceptionsRepository = new EmailExceptionsRepository(db)
  const domainRoutesRepository = new DomainRoutesRepository(db)
  const eventsRepository = new EventsRepository(db)

  const emailException = await emailExceptionsRepository.findActiveByEmail(normalizedEmail)
  if (emailException) {
    const event = await getActiveEvent(eventsRepository, emailException.eventId)
    return {
      event,
      reasonCode: 'EMAIL_EXCEPTION_MATCH',
    }
  }

  const domainRoute = await domainRoutesRepository.findActiveByDomain(emailDomain)
  if (!domainRoute) {
    throw new AppError(404, 'EVENT_NOT_FOUND', '接続先イベントが見つかりません')
  }

  const event = await getActiveEvent(eventsRepository, domainRoute.eventId)
  return {
    event,
    reasonCode: 'DOMAIN_ROUTE_MATCH',
  }
}

async function getActiveEvent(
  eventsRepository: EventsRepository,
  eventId: string,
): Promise<EventRecord> {
  const event = await eventsRepository.findById(eventId)
  if (!event) {
    throw new AppError(404, 'EVENT_NOT_FOUND', '接続先イベントが見つかりません')
  }

  if (!event.isActive) {
    throw new AppError(409, 'EVENT_INACTIVE', '接続先イベントは停止中です')
  }

  return event
}

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase()
  if (normalizedEmail.length === 0) {
    throw new AppError(403, 'FORBIDDEN_EMAIL', 'このアカウントは利用対象外です')
  }

  return normalizedEmail
}

function extractEmailDomain(email: string): string {
  const [, domain] = email.split('@')
  if (!domain) {
    throw new AppError(403, 'FORBIDDEN_EMAIL', 'このアカウントは利用対象外です')
  }

  return domain
}
