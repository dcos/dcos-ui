import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET,
  DEL,
  ERROR
} from "../constants/TransactionTypes";

declare class Transaction {
  readonly path: Array<string | number>;
  readonly value: any;
  readonly type: ADD_ITEM | REMOVE_ITEM | SET | DEL | ERROR;
  constructor(path: Array<string | number>, value: any, type: symbol = SET);
}

module.exports = Transaction;
