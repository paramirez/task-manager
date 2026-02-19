import { Query } from '@/shared/cqrs/CqrsTypes';

export const FIND_TASKS_BY_STATUS_QUERY = 'task.find_by_status';

export interface FindTasksByStatusQuery extends Query {
  kind: typeof FIND_TASKS_BY_STATUS_QUERY;
  status: string;
}
