import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from '../../../../../src/js/utils/ReducerUtil';
import {
  JSONReducer as env
} from './form/EnvironmentVariables';
import {
  SET,
  ADD_ROW,
  REMOVE_ROW
} from '../../../../../src/js/constants/TransactionTypes';

module.exports = {
  id: simpleReducer('id', '/'),
  cpus: simpleFloatReducer('cpus', 0.01),
  mem: simpleIntReducer('mem', 128),
  disk: simpleIntReducer('disk', 0),
  instances: simpleIntReducer('instances', 1),
  cmd: simpleReducer('cmd', ''),
  env,
  labels(state, {type, path, value}) {
    if (this.labels == null) {
      this.labels = [];

      if (state != null) {
        this.labels = Object.keys(state).reduce((memo, key) => {
          memo.push({
            key: key.toUpperCase(),
            value: state[key]
          });
          return memo;
        }, []);
      }
    }

    if (path != null && path.join('.').search('labels') !== -1) {
      if (path.join('.') === 'labels') {
        switch (type) {
          case ADD_ROW:
            this.labels.push({key: null, value: null});
            break;
          case REMOVE_ROW:
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
  }
};
