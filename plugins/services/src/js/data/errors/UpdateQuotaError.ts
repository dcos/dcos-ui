export class UpdateQuotaError extends Error {
  public readonly responseCode: number;
  constructor(message: string, code: number = 0) {
    super(message);
    this.name = "UpdateQuotaError";
    this.responseCode = code;
  }
}
