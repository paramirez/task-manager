import { TaskEventPublisher } from '@/modules/notification/application/ports/TaskEventPublisher';
import { PromiseResult, Result } from '@/shared/core/result';

export class NoopTaskEventPublisher implements TaskEventPublisher {
  publish(): PromiseResult<void, Error> {
    return Promise.resolve(Result.ok(undefined));
  }
}
