import { Query } from '@/shared/cqrs/CqrsTypes';

export const FIND_TASK_BY_ID_QUERY = 'task.find_by_id';

export interface FindTaskByIdQuery extends Query {
  kind: typeof FIND_TASK_BY_ID_QUERY;
  id: string;
}
