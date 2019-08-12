const OVERCOMMIT_ERROR_CHECK = "this is more than the requested limits";

export class OvercommitQuotaError extends Error {
  static isOvercommitError(message: string): boolean {
    return message.includes(OVERCOMMIT_ERROR_CHECK);
  }
  readonly responseCode: number;
  constructor(message: string, code: number = 0) {
    super(message);
    this.name = "OvercommitQuotaError";
    this.responseCode = code;
  }
}
