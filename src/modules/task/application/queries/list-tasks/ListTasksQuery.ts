import { Query } from '@/shared/cqrs/CqrsTypes';

export const LIST_TASKS_QUERY = 'task.list';

export interface ListTasksQuery extends Query {
  kind: typeof LIST_TASKS_QUERY;
}
