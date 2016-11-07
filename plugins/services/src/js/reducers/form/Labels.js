import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (this.labels == null) {
      this.labels = [];
    }

    if (path != null && path.join('.').search('labels') !== -1) {
      if (path.join('.') === 'labels') {
        switch (type) {
          case ADD_ITEM:
            this.labels.push({key: null, value: null});
            break;
          case REMOVE_ITEM:
            this.labels = this.labels.filter((item, index) => {
              return index !== value;
            });
            if (this.labels.length === 0) {
              this.labels.push({key: null, value: null});
            }
            break;
        }

        return this.labels.reduce((memo, item) => {
          if (item.key != null || item.value != null) {
            memo[item.key] = item.value;
          }
          return memo;
        }, {});
      }

      const joinedPath = path.join('.');
      const index = joinedPath.match(/\d+/)[0];
      switch (true) {
        case (type === SET && `labels.${index}.key` === joinedPath):
          this.labels[index].key = value;
          break;
        case (type === SET && `labels.${index}.value` === joinedPath):
          this.labels[index].value = value;
          break;
      }
    }
    return this.labels.reduce((memo, item) => {
      memo[item.key] = item.value;
      return memo;
    }, {});
  },
  JSONParser(state) {
    return Object.keys(state.labels).reduce(function (memo, key, index) {
      memo.push(new Transaction(['labels'], index, ADD_ITEM));
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
  },
  FormReducer(state = [], {type, path, value}) {
    if (path != null && path.join('.').search('labels') !== -1) {
      if (path.join('.') === 'labels') {
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
        `labels.${index}.key` === joinedPath):
          state[index].key = value;
          break;
        case (type === SET &&
        `labels.${index}.value` === joinedPath):
          state[index].value = value;
          break;
      }
    }
    return state;
  }
};
