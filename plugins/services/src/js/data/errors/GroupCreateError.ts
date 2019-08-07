export class GroupCreateError extends Error {
  readonly responseCode: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "GroupCreateError";
    this.responseCode = code;
  }
}
