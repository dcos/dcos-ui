import TransactionTypes from '../constants/TransactionTypes';

const validTypes = Object.values(TransactionTypes);

class Transaction {
  constructor(path, value, type = TransactionTypes.SET) {
    if (!validTypes.includes(type)) {
      throw new TypeError(`Only the following types are allowed: ${validTypes}`);
    }
    Object.defineProperties(this, {
      path: {
        value: path,
        writable: false
      },
      value: {
        value,
        writable: false
      },
      type: {
        value: type,
        writable: false
      }
    });
  }

}

module.exports = Transaction;
