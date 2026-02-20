export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };
export type Result<T, E> = Ok<T> | Err<E>;
export type PromiseResult<T, E> = Promise<Result<T, E>>;

export const Result = {
  ok<T, E = never>(value: T): Result<T, E> {
    return { ok: true, value };
  },
  fail<T = never, E = Error>(error: E): Result<T, E> {
    return { ok: false, error };
  },
  isOk<T, E>(result: Result<T, E>): result is Ok<T> {
    return result.ok;
  },
  isErr<T, E>(result: Result<T, E>): result is Err<E> {
    return !result.ok;
  },
  match<T, E, U>(
    result: Result<T, E>,
    onOk: (value: T) => U,
    onErr: (error: E) => U,
  ): U {
    return result.ok ? onOk(result.value) : onErr(result.error);
  },
};
