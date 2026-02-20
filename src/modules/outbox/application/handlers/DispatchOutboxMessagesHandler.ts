import type { TaskEventPublisher } from '@/modules/notification/application/ports/TaskEventPublisher';
import { Result } from '@/shared/core/result';
import { OutboxMessage } from '@/modules/outbox/domain/OutboxMessage';
import type { OutboxRepository } from '@/modules/outbox/application/ports/OutboxRepository';
import { TASK_CREATED_EVENT_TYPE } from '@/modules/outbox/domain/TaskCreatedOutboxEvent';
import { TASK_UPDATED_EVENT_TYPE } from '@/modules/outbox/domain/TaskUpdatedOutboxEvent';
import { DispatchOutboxMessagesCommand } from '@/modules/outbox/application/commands/dispatch-outbox/DispatchOutboxMessagesCommand';

interface DispatchFailure {
  messageId: string;
  reason: string;
}

export interface DispatchOutboxMessagesResult {
  total: number;
  processed: number;
  failed: number;
  failures: DispatchFailure[];
}

export class DispatchOutboxMessagesHandler {
  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly taskEventPublisher: TaskEventPublisher,
  ) {}

  async execute(
    command: DispatchOutboxMessagesCommand,
  ): Promise<Result<DispatchOutboxMessagesResult, Error>> {
    void command;
    const pendingMessagesResult = await this.outboxRepository.listPending();
    if (!pendingMessagesResult.ok)
      return Result.fail(pendingMessagesResult.error);

    const failures: DispatchFailure[] = [];
    let processed = 0;

    for (const message of pendingMessagesResult.value) {
      const dispatchResult = await this.dispatchMessage(message);
      if (!dispatchResult.ok) {
        failures.push({
          messageId: message.id,
          reason: dispatchResult.error.message,
        });
        continue;
      }

      const markResult = await this.outboxRepository.markAsProcessed(
        message.id,
      );
      if (!markResult.ok) return Result.fail(markResult.error);
      processed += 1;
    }

    return Result.ok({
      total: pendingMessagesResult.value.length,
      processed,
      failed: failures.length,
      failures,
    });
  }

  private async dispatchMessage(
    message: OutboxMessage,
  ): Promise<Result<void, Error>> {
    if (
      message.type !== TASK_CREATED_EVENT_TYPE &&
      message.type !== TASK_UPDATED_EVENT_TYPE
    ) {
      return Result.fail(
        new Error(`OUTBOX_UNSUPPORTED_EVENT_TYPE:${message.type}`),
      );
    }

    const payloadResult = this.validateTaskPayload(message.payload);
    if (!payloadResult.ok) return Result.fail(payloadResult.error);

    const publishResult = await this.taskEventPublisher.publish({
      type: message.type,
      occurredAt: message.occurredAt.toISOString(),
      payload: payloadResult.value,
    });
    if (!publishResult.ok) return Result.fail(publishResult.error);

    return Result.ok(undefined);
  }

  private validateTaskPayload(
    payload: Record<string, unknown>,
  ): Result<Record<string, unknown>, Error> {
    if (typeof payload.id !== 'string') {
      return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:id'));
    }
    if (typeof payload.title !== 'string') {
      return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:title'));
    }
    if (payload.status !== undefined && typeof payload.status !== 'string') {
      return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:status'));
    }
    if (
      payload.description !== undefined &&
      typeof payload.description !== 'string'
    ) {
      return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:description'));
    }
    if (
      payload.assignedTo !== undefined &&
      typeof payload.assignedTo !== 'string'
    ) {
      return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:assignedTo'));
    }

    let dueDate: Date | undefined;
    if (payload.dueDate !== undefined) {
      if (payload.dueDate instanceof Date) {
        dueDate = new Date(payload.dueDate);
      } else if (typeof payload.dueDate === 'string') {
        const parsed = new Date(payload.dueDate);
        if (Number.isNaN(parsed.getTime())) {
          return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:dueDate'));
        }
        dueDate = parsed;
      } else {
        return Result.fail(new Error('OUTBOX_INVALID_PAYLOAD:dueDate'));
      }
    }

    return Result.ok({
      id: payload.id,
      title: payload.title,
      status: payload.status,
      description: payload.description,
      assignedTo: payload.assignedTo,
      dueDate,
    });
  }
}
