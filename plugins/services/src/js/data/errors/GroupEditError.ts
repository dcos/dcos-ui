export class GroupEditError extends Error {
  public readonly responseCode: number;
  constructor(message: string, code: number) {
    super(message);
    this.name = "GroupEditError";
    this.responseCode = code;
  }
}
