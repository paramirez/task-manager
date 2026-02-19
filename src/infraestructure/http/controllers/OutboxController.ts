import { DispatchOutboxMessagesHandler } from '@/application/outbox/DispatchOutboxMessagesHandler';
import { Controller, InternalServerErrorException, Post } from '@nestjs/common';

@Controller({
  path: 'outbox',
  version: '1',
})
export class OutboxController {
  constructor(
    private readonly dispatchOutboxMessagesHandler: DispatchOutboxMessagesHandler,
  ) {}

  @Post('dispatch')
  async dispatch() {
    const dispatchResult = await this.dispatchOutboxMessagesHandler.execute();
    if (!dispatchResult.ok) {
      throw new InternalServerErrorException(dispatchResult.error.message);
    }

    return dispatchResult.value;
  }
}
