import type { RealtimeEvent, RealtimeEventType } from './types'

type RouteMatcher = string | ((event: RealtimeEvent) => string | null)

const OWNER_ROUTES: Record<RealtimeEventType, RouteMatcher[]> = {
  'appointment.created': [
    '/business/appointments',
    '/business/dashboard',
    (e) => e.type === 'appointment.created' ? `/business/customers/${e.payload.customerId}` : null,
  ],
  'appointment.updated': [
    '/business/appointments',
    '/business/dashboard',
    (e) => e.type === 'appointment.updated' ? `/business/customers/${e.payload.customerId}` : null,
  ],
  'businessMember.created': [
    '/business/customers',
    '/business/dashboard',
  ],
  'business.updated': [
    '/business/profile',
    '/business/dashboard',
    '/business/subscription',
  ],
  'service.created': ['/business/services'],
  'service.updated': ['/business/services'],
  'service.deleted': ['/business/services'],
  'payment.verified': ['/business/subscription', '/business/dashboard'],
}

const CUSTOMER_ROUTES: Record<RealtimeEventType, RouteMatcher[]> = {
  'appointment.created': [
    (e) => e.type === 'appointment.created' ? `/customer/${e.payload.storeCode}/appointments` : null,
    (e) => e.type === 'appointment.created' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'appointment.updated': [
    (e) => e.type === 'appointment.updated' ? `/customer/${e.payload.storeCode}/appointments` : null,
    (e) => e.type === 'appointment.updated' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'businessMember.created': ['/customer'],
  'business.updated': [
    (e) => e.type === 'business.updated' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'service.created': [
    (e) => e.type === 'service.created' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'service.updated': [
    (e) => e.type === 'service.updated' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'service.deleted': [
    (e) => e.type === 'service.deleted' ? `/customer/${e.payload.storeCode}` : null,
  ],
  'payment.verified': [],
}

export function getAffectedRoutes(
  event: RealtimeEvent,
  role: 'BUSINESS_OWNER' | 'CUSTOMER'
): string[] {
  const map = role === 'BUSINESS_OWNER' ? OWNER_ROUTES : CUSTOMER_ROUTES
  const matchers = map[event.type] ?? []
  const routes: string[] = []
  for (const matcher of matchers) {
    const route = typeof matcher === 'string' ? matcher : matcher(event)
    if (route) routes.push(route)
  }
  return routes
}

export function pathMatches(current: string, pattern: string): boolean {
  if (current === pattern) return true
  const cp = current.split('/')
  const pp = pattern.split('/')
  if (cp.length !== pp.length) return false
  return pp.every((seg, i) => seg.startsWith('[') || seg === cp[i])
}
