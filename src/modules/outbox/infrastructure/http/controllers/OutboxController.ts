import {
  DISPATCH_OUTBOX_MESSAGES_COMMAND,
  DispatchOutboxMessagesCommand,
} from '@/modules/outbox/application/commands/dispatch-outbox/DispatchOutboxMessagesCommand';
import { Inject } from '@nestjs/common';
import { Controller, Post } from '@nestjs/common';
import { COMMAND_BUS } from '@/shared/cqrs/CqrsTypes';
import type { CommandBus } from '@/shared/cqrs/CqrsTypes';

@Controller({
  path: 'outbox',
  version: '1',
})
export class OutboxController {
  constructor(@Inject(COMMAND_BUS) private readonly commandBus: CommandBus) {}

  @Post('dispatch')
  async dispatch() {
    const dispatchResult = await this.commandBus.execute<
      {
        total: number;
        processed: number;
        failed: number;
        failures: { messageId: string; reason: string }[];
      },
      DispatchOutboxMessagesCommand
    >({
      kind: DISPATCH_OUTBOX_MESSAGES_COMMAND,
    });
    if (!dispatchResult.ok) throw dispatchResult.error;

    return dispatchResult.value;
  }
}
