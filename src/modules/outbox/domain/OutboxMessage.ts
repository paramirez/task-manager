export interface OutboxMessage {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
  processedAt?: Date;
}
