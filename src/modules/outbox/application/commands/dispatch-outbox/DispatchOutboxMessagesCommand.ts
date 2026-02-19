import { Command } from '@/shared/cqrs/CqrsTypes';

export const DISPATCH_OUTBOX_MESSAGES_COMMAND = 'outbox.dispatch_messages';

export interface DispatchOutboxMessagesCommand extends Command {
  kind: typeof DISPATCH_OUTBOX_MESSAGES_COMMAND;
}
