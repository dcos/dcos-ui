const md5 = require("md5");

class Notification {
  public readonly id: string;
  public readonly type: symbol;
  public readonly message: string;
  public readonly timestamp: Date;

  constructor(type: symbol, message: string) {
    this.id = md5(`${type.toString()}|${message}`);
    this.type = type;
    this.message = message;
    this.timestamp = new Date();
  }
}

export { Notification };
