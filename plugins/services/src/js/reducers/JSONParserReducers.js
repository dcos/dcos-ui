import {simpleParser} from '../../../../../src/js/utils/ParserUtil';
import {
  ADD_ROW,
  SET
} from '../../../../../src/js/constants/TransactionTypes';

import Transaction from '../../../../../src/js/structs/Transaction';

module.exports = [
  simpleParser(['id']),
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['instances']),
  simpleParser(['cmd']),
  function (state) {
    return Object.keys(state.env).reduce(function (memo, key, index) {
      memo.push(new Transaction(['env'], index, ADD_ROW));
      memo.push(new Transaction([
        'env',
        index,
        'key'
      ], key, SET));
      memo.push(new Transaction([
        'env',
        index,
        'value'
      ], state.env[key], SET));

      return memo;
    }, []);
  },
  function (state) {
    return Object.keys(state.labels).reduce(function (memo, key, index) {
      memo.push(new Transaction(['labels'], index, ADD_ROW));
      memo.push(new Transaction([
        'labels',
        index,
        'key'
      ], key, SET));
      memo.push(new Transaction([
        'labels',
        index,
        'value'
      ], state.labels[key], SET));

      return memo;
    }, []);
  }
];
