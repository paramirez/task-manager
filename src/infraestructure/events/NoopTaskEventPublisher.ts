import { TaskEventPublisher } from '@/application/events/TaskEventPublisher';
import { Task } from '@/domain/task/Task';
import { PromiseResult, Result } from '@/shared/core/result';

export class NoopTaskEventPublisher implements TaskEventPublisher {
  publishTaskCreated(task: Task): PromiseResult<void, Error> {
    void task;
    return Promise.resolve(Result.ok(undefined));
  }
}
