import {
  ADD_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

let reducer = (state, {type, path, value}) => {
  let joinedPath = path && path.join('.');

  if (type === SET && joinedPath === 'networking.type') {
    let newState = Object.assign({}, state);
    newState.type = value;

    return newState;
  }

  return state;
};

module.exports = {
  JSONReducer: reducer,

  JSONParser(state) {
    if (state.env == null) {
      return [];
    }

    return Object.keys(state.env).reduce(function (memo, key, index) {
      /**
       * For the environment variables which are a key => value based object
       * we want to create a new item and fill it with the key and the
       * value. So we need 3 transactions for each key value pair.
       * 1) Add a new Item to the path with the index equal to index.
       * 2) Set the key on the path `env.${index}.key`
       * 3) Set the value on the path `env.${index}.value`
       */
      memo.push(new Transaction(['env'], index, ADD_ITEM));
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

  FormReducer: reducer
};
