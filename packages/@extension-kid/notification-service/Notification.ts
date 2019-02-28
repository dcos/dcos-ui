import md5 from "md5";

class Notification {
  readonly id: string;
  readonly type: symbol;
  readonly message: string;
  readonly timestamp: Date;

  constructor(type: symbol, message: string) {
    this.id = md5(`${type.toString()}|${message}`);
    this.type = type;
    this.message = message;
    this.timestamp = new Date();
  }
}

export { Notification };
