import * as TransactionTypes from "../constants/TransactionTypes";

const validTypes = Object.values(TransactionTypes);
const validKeys = Object.keys(TransactionTypes);

class Transaction {
  constructor(
    path: string[],
    value: unknown,
    type: typeof validTypes[0] = TransactionTypes.SET
  ) {
    if (!validTypes.includes(type)) {
      throw new TypeError(`Only the following types are allowed: ${validKeys}`);
    }
    Object.defineProperties(this, {
      path: {
        value: path,
        writable: false,
        enumerable: true
      },
      value: {
        value,
        writable: false,
        enumerable: true
      },
      type: {
        value: type,
        writable: false,
        enumerable: true
      }
    });
  }
}

export default Transaction;
