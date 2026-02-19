import { DomainError } from './DomainError';

export class ValidationError extends DomainError {
  constructor(code: string, message = code) {
    super(message, code);
  }
}
