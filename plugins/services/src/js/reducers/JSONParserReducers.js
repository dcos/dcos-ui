import {simpleParser} from '../../../../../src/js/utils/ParserUtil';
import {
  ADD_ROW,
  SET
} from '../../../../../src/js/constants/TransactionTypes';

import {JSONParser as environmentVariables} from './form/EnvironmentVariables';

import Transaction from '../../../../../src/js/structs/Transaction';

module.exports = [
  simpleParser(['id']),
  simpleParser(['cpus']),
  simpleParser(['mem']),
  simpleParser(['disk']),
  simpleParser(['instances']),
  simpleParser(['cmd']),
  environmentVariables,
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
