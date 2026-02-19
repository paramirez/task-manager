import { TaskEventPublisher } from '@/modules/notification/application/ports/TaskEventPublisher';
import { Task } from '@/modules/task/domain/Task';
import { PromiseResult, Result } from '@/shared/core/result';

export class NoopTaskEventPublisher implements TaskEventPublisher {
  publishTaskCreated(task: Task): PromiseResult<void, Error> {
    void task;
    return Promise.resolve(Result.ok(undefined));
  }
}
