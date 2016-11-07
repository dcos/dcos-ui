import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (this.env == null) {
      this.env = [];
    }

    if (path != null && path.join('.').search('env') !== -1) {
      if (path.join('.') === 'env') {
        switch (type) {
          case ADD_ITEM:
            this.env.push({key: null, value: null});
            break;
          case REMOVE_ITEM:
            this.env = this.env.filter((item, index) => {
              return index !== value;
            });
            if (this.env.length === 0) {
              this.env.push({key: null, value: null});
            }
            break;
        }

        return this.env.reduce((memo, item) => {
          if (item.key != null || item.value != null) {
            memo[item.key] = item.value;
          }
          return memo;
        }, {});
      }

      const joinedPath = path.join('.');
      const index = joinedPath.match(/\d+/)[0];
      switch (true) {
        case (type === SET && `env.${index}.key` === joinedPath):
          this.env[index].key = value;
          break;
        case (type === SET && `env.${index}.value` === joinedPath):
          this.env[index].value = value;
          break;
      }
    }
    return this.env.reduce((memo, item) => {
      memo[item.key] = item.value;
      return memo;
    }, {});
  },
  JSONParser(state) {
    if (state.env == null) {
      return [];
    }

    return Object.keys(state.env).reduce(function (memo, key, index) {
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
  FormReducer(state = [], {type, path, value}) {
    if (path != null && path.join('.').search('env') !== -1) {
      if (path.join('.') === 'env') {
        switch (type) {
          case ADD_ITEM:
            state.push({key: null, value: null});
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }
        return state;
      }

      let joinedPath = path.join('.');
      let index = joinedPath.match(/\d+/)[0];
      switch (true) {
        case (type === SET &&
        `env.${index}.key` === joinedPath):
          state[index].key = value;
          break;
        case (type === SET &&
        `env.${index}.value` === joinedPath):
          state[index].value = value;
          break;
      }
    }
    return state;
  }
};
