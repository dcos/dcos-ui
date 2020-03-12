import * as TransactionTypes from "../constants/TransactionTypes";

const validTypes = Object.values(TransactionTypes);
const validKeys = Object.keys(TransactionTypes);

class Transaction {
  public readonly path: string | Array<string | number>;
  public readonly value: unknown;
  public readonly type: symbol;
  constructor(
    path: Array<string | number>,
    value: unknown,
    type: typeof validTypes[0] = TransactionTypes.SET
  ) {
    if (!validTypes.includes(type)) {
      throw new TypeError(`Only the following types are allowed: ${validKeys}`);
    }
    this.path = path;
    this.value = value;
    this.type = type;
    Object.defineProperties(this, {
      path: {
        writable: false,
        enumerable: true
      },
      value: {
        writable: false,
        enumerable: true
      },
      type: {
        writable: false,
        enumerable: true
      }
    });
  }
}

export default Transaction;
