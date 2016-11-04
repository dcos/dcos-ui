import Transaction from '../structs/Transaction';
import Util from './Util';

module.exports = {
  combineParsers(parsers = []) {
    parsers = parsers.filter(
      function (parser) {
        return typeof parser === 'function';
      }
    ).reverse();

    return function (state = {}) {
      let index = parsers.length;

      const transactionLog = [];

      while (--index >= 0) {
        let parser = parsers[index];

        let transaction = parser(state);

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
    let searchPath = path.join('.');

    return function (state) {
      return new Transaction(path, Util.findNestedPropertyInObject(
        state,
        searchPath
      ));
    };
  }
};
