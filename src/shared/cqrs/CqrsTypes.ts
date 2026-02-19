import { PromiseResult } from '@/shared/core/result';

export interface Command {
  kind: string;
}

export interface Query {
  kind: string;
}

export interface DomainEvent {
  kind: string;
}

export interface CommandBus {
  execute<TResponse, TCommand extends Command = Command>(
    command: TCommand,
  ): PromiseResult<TResponse, Error>;
}

export interface QueryBus {
  execute<TResponse, TQuery extends Query = Query>(
    query: TQuery,
  ): PromiseResult<TResponse, Error>;
}

export interface EventBus {
  publish<TEvent extends DomainEvent>(
    event: TEvent,
  ): PromiseResult<void, Error>;
}

export const COMMAND_BUS = Symbol('COMMAND_BUS');
export const QUERY_BUS = Symbol('QUERY_BUS');
export const EVENT_BUS = Symbol('EVENT_BUS');

export interface CommandHandlerBinding {
  kind: string;
  execute(command: Command): PromiseResult<unknown, Error>;
}

export interface QueryHandlerBinding {
  kind: string;
  execute(query: Query): PromiseResult<unknown, Error>;
}

export interface EventHandlerBinding {
  kind: string;
  handle(event: DomainEvent): PromiseResult<void, Error>;
}
