import {
  Command,
  CommandBus,
  CommandHandlerBinding,
  DomainEvent,
  EventBus,
  EventHandlerBinding,
  Query,
  QueryBus,
  QueryHandlerBinding,
} from '@/shared/cqrs/CqrsTypes';
import { PromiseResult, Result } from '@/shared/core/result';

export class InProcessCommandBus implements CommandBus {
  private readonly handlersByKind = new Map<string, CommandHandlerBinding>();

  constructor(handlers: CommandHandlerBinding[]) {
    for (const handler of handlers) {
      this.handlersByKind.set(handler.kind, handler);
    }
  }

  execute<TResponse, TCommand extends Command>(
    command: TCommand,
  ): PromiseResult<TResponse, Error> {
    const handler = this.handlersByKind.get(command.kind);
    if (!handler) {
      return Promise.resolve(
        Result.fail(new Error(`COMMAND_HANDLER_NOT_FOUND:${command.kind}`)),
      );
    }

    return handler.execute(command) as PromiseResult<TResponse, Error>;
  }
}

export class InProcessQueryBus implements QueryBus {
  private readonly handlersByKind = new Map<string, QueryHandlerBinding>();

  constructor(handlers: QueryHandlerBinding[]) {
    for (const handler of handlers) {
      this.handlersByKind.set(handler.kind, handler);
    }
  }

  execute<TResponse, TQuery extends Query>(
    query: TQuery,
  ): PromiseResult<TResponse, Error> {
    const handler = this.handlersByKind.get(query.kind);
    if (!handler) {
      return Promise.resolve(
        Result.fail(new Error(`QUERY_HANDLER_NOT_FOUND:${query.kind}`)),
      );
    }

    return handler.execute(query) as PromiseResult<TResponse, Error>;
  }
}

export class InProcessEventBus implements EventBus {
  private readonly handlersByKind = new Map<string, EventHandlerBinding[]>();

  constructor(handlers: EventHandlerBinding[]) {
    for (const handler of handlers) {
      const existing = this.handlersByKind.get(handler.kind) ?? [];
      this.handlersByKind.set(handler.kind, existing.concat(handler));
    }
  }

  async publish<TEvent extends DomainEvent>(
    event: TEvent,
  ): PromiseResult<void, Error> {
    const handlers = this.handlersByKind.get(event.kind) ?? [];
    for (const handler of handlers) {
      const result = await handler.handle(event);
      if (!result.ok) return Result.fail(result.error);
    }

    return Result.ok(undefined);
  }
}
