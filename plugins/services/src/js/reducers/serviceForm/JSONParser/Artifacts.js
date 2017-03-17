import {
  ADD_ITEM,
  SET
} from '../../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONParser(state) {
    if (state.fetch == null) {
      return [];
    }

    return state.fetch.reduce(function (memo, item, index) {
      memo.push(new Transaction( ['fetch'], index, ADD_ITEM ));
      Object.keys(item).forEach(function (key) {
        memo.push(new Transaction( ['fetch', index, key], item[key], SET));
      });

      return memo;
    }, []);
  }
};
