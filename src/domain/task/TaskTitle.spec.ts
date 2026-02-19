import { TaskTitle } from '@/domain/task/TaskTitle';

describe('TaskTitle', () => {
  it('creates a valid title', () => {
    const titleOrError = TaskTitle.create('  Ship feature  ');

    expect(titleOrError.ok).toBe(true);
    if (!titleOrError.ok) {
      throw new Error('Expected a successful result');
    }
    expect(titleOrError.value.value).toBe('Ship feature');
  });

  it('fails for empty title', () => {
    const titleOrError = TaskTitle.create('   ');

    expect(titleOrError.ok).toBe(false);
    if (titleOrError.ok) {
      throw new Error('Expected a failed result');
    }
    expect(titleOrError.error.message).toBe('TASK_TITLE_REQUIRED');
  });
});
