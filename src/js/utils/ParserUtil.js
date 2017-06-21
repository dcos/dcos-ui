import Transaction from "../structs/Transaction";
import { findNestedPropertyInObject } from "./Util";

module.exports = {
  combineParsers(parsers = []) {
    parsers = parsers
      .filter(function(parser) {
        return typeof parser === "function";
      })
      .reverse();

    return function(state = {}) {
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

    return function(state) {
      const value = findNestedPropertyInObject(state, searchPath);

      if (value == null) {
        return [];
      }

      return new Transaction(path, value);
    };
  }
};
