// Realtime event payloads

export interface AppointmentEventPayload {
  appointmentId: string
  businessId: string
  storeCode: string
  customerId: string
  ownerId: string
  datetime: string
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED'
}

export interface BusinessMemberEventPayload {
  memberId: string
  businessId: string
  storeCode: string
  ownerId: string
  customerId: string
}

export interface BusinessEventPayload {
  businessId: string
  storeCode: string
  ownerId: string
  changedFields: Array<'profile' | 'subscription' | 'workingHours'>
  newFreeUntil?: string
}

export interface ServiceEventPayload {
  serviceId: string
  businessId: string
  storeCode: string
  ownerId: string
}

export interface PaymentEventPayload {
  paymentId: string
  businessId: string
  ownerId: string
  amount: number
  newFreeUntil: string
}

export type RealtimeEvent =
  | { type: 'appointment.created'; payload: AppointmentEventPayload }
  | { type: 'appointment.updated'; payload: AppointmentEventPayload }
  | { type: 'businessMember.created'; payload: BusinessMemberEventPayload }
  | { type: 'business.updated'; payload: BusinessEventPayload }
  | { type: 'service.created'; payload: ServiceEventPayload }
  | { type: 'service.updated'; payload: ServiceEventPayload }
  | { type: 'service.deleted'; payload: ServiceEventPayload }
  | { type: 'payment.verified'; payload: PaymentEventPayload }

export type RealtimeEventType = RealtimeEvent['type']

export function getAffectedUserIds(event: RealtimeEvent): string[] {
  switch (event.type) {
    case 'appointment.created':
    case 'appointment.updated':
      return [...new Set([event.payload.ownerId, event.payload.customerId])]
    case 'businessMember.created':
      return [...new Set([event.payload.ownerId, event.payload.customerId])]
    case 'business.updated':
      return [event.payload.ownerId]
    case 'service.created':
    case 'service.updated':
    case 'service.deleted':
      return [event.payload.ownerId]
    case 'payment.verified':
      return [event.payload.ownerId]
  }
}

// Wire messages (server → client)
export type WsServerMessage =
  | { type: 'connected'; userId: string }
  | { type: 'pong' }
  | (RealtimeEvent & { timestamp: number })

// Wire messages (client → server)
export type WsClientMessage = { type: 'ping' }
