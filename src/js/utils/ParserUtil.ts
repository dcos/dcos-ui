import { findNestedPropertyInObject } from "./Util";
import Transaction from "../structs/Transaction";

type Parser = (a: {}) => Transaction | Transaction[];
export function combineParsers(parsers: Parser[] = []) {
  parsers = parsers.filter(parser => typeof parser === "function").reverse();

  return (state = {}) => {
    let index = parsers.length;

    const transactionLog: Transaction[] = [];

    while (--index >= 0) {
      const parser = parsers[index];

      const transaction = parser(state);

      if (transaction instanceof Array) {
        transactionLog.push(...transaction);
      } else {
        transactionLog.push(transaction);
      }
    }

    return transactionLog;
  };
}

export function simpleParser(path: string[]): Parser {
  return state => {
    const value = findNestedPropertyInObject(state, path.join("."));
    return value == null ? [] : new Transaction(path, value);
  };
}
