import { findNestedPropertyInObject } from "./Util";
import Transaction from "../structs/Transaction";

module.exports = {
  combineParsers(parsers = []) {
    parsers = parsers
      .filter(parser => {
        return typeof parser === "function";
      })
      .reverse();

    return (state = {}) => {
      let index = parsers.length;

      const transactionLog = [];

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
  },

  simpleParser(path) {
    const searchPath = path.join(".");

    return state => {
      const value = findNestedPropertyInObject(state, searchPath);

      if (value == null) {
        return [];
      }

      return new Transaction(path, value);
    };
  }
};
