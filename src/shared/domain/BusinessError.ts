import { DomainError } from './DomainError';

export class BusinessError extends DomainError {
  constructor(code: string, message = code) {
    super(message, code);
  }
}
