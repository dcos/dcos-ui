import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Util from '../../../../../../src/js/utils/Util';
import Transaction from '../../../../../../src/js/structs/Transaction';

function mapHealthChecks(item) {
  const newItem = Util.omit(item, ['path', 'command', 'protocol']);

  if (item.protocol != null) {
    newItem.protocol = item.protocol;
    if (item.protocol.toUpperCase() === 'COMMAND' && item.command != null) {
      newItem.command = {
        value: item.command
      };
    }

    if (item.protocol.toUpperCase().replace('HTTPS', 'HTTP') === 'HTTP') {
      newItem.path = item.path;
    }
  }

  return newItem;
}

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (path == null) {
      return state;
    }

    if (this.healthChecks == null) {
      // `this` is a context which is givven to every reducer so it could
      // cache information.
      // In this case we are caching an array structure and although the
      // output structure is a object. But this enables us to not overwrite
      // values if there are two values with the same key temporarily.
      this.healthChecks = [];
    }

    const joinedPath = path.join('.');

    if (joinedPath.search('healthChecks') !== -1) {
      if (joinedPath === 'healthChecks') {
        switch (type) {
          case ADD_ITEM:
            this.healthChecks.push({});
            break;
          case REMOVE_ITEM:
            this.healthChecks = this.healthChecks.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return this.healthChecks.map(mapHealthChecks);
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET) {
        if (`healthChecks.${index}.protocol` === joinedPath) {
          this.healthChecks[index].protocol = value;
        }
        if (`healthChecks.${index}.command` === joinedPath) {
          this.healthChecks[index].command = value;
        }
        if (`healthChecks.${index}.path` === joinedPath) {
          this.healthChecks[index].path = value;
        }
        if (`healthChecks.${index}.gracePeriodSeconds` === joinedPath) {
          this.healthChecks[index].gracePeriodSeconds = value;
        }
        if (`healthChecks.${index}.intervalSeconds` === joinedPath) {
          this.healthChecks[index].intervalSeconds = value;
        }
        if (`healthChecks.${index}.timeoutSeconds` === joinedPath) {
          this.healthChecks[index].timeoutSeconds = value;
        }
        if (`healthChecks.${index}.maxConsecutiveFailures` === joinedPath) {
          this.healthChecks[index].maxConsecutiveFailures = value;
        }
        if (`healthChecks.${index}.https` === joinedPath) {
          if (value === true) {
            this.healthChecks[index].protocol = 'HTTPS';
          } else {
            this.healthChecks[index].protocol = 'HTTP';
          }
        }
      }
    }

    return this.healthChecks.map(mapHealthChecks);
  },
  JSONParser(state) {
    if (state.healthChecks == null) {
      return [];
    }

    return state.healthChecks.reduce(function (memo, item, index) {
      if (item.protocol == null) {
        return memo;
      }
      memo.push(new Transaction(['healthChecks'], index, ADD_ITEM));
      memo.push(new Transaction([
        'healthChecks',
        index,
        'protocol'
      ], item.protocol.toUpperCase(), SET));
      if (item.protocol.toUpperCase() === 'COMMAND') {
        if (item.command != null && item.command.value != null) {
          memo.push(new Transaction([
            'healthChecks',
            index,
            'command'
          ], item.command.value, SET));
        }
      }
      if (item.protocol.toUpperCase().replace('HTTPS', 'HTTP') === 'HTTP') {
        if (item.protocol === 'HTTPS') {
          memo.push(new Transaction([
            'healthChecks',
            index,
            'https'
          ], true, SET));
        }
        memo.push(new Transaction([
          'healthChecks',
          index,
          'path'
        ], item.path, SET));
      }
      [
        'gracePeriodSeconds',
        'intervalSeconds',
        'timeoutSeconds',
        'maxConsecutiveFailures'
      ].forEach((key) => {
        if (item[key] != null) {
          memo.push(new Transaction([
            'healthChecks',
            index,
            key
          ], item[key], SET));
        }
      });

      return memo;
    }, []);
  },
  FormReducer(state = [], {type, path, value}) {
    if (path == null) {
      return state;
    }

    let joinedPath = path.join('.');

    if (joinedPath.search('healthChecks') !== -1) {
      if (joinedPath === 'healthChecks') {
        switch (type) {
          case ADD_ITEM:
            state.push({});
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }
        return state;
      }

      let index = joinedPath.match(/\d+/)[0];
      if (type === SET) {
        if (`healthChecks.${index}.protocol` === joinedPath) {
          state[index].protocol = value;
        }
        if (`healthChecks.${index}.command` === joinedPath) {
          state[index].command = value;
        }
        if (`healthChecks.${index}.path` === joinedPath) {
          state[index].path = value;
        }
        if (`healthChecks.${index}.gracePeriodSeconds` === joinedPath) {
          state[index].gracePeriodSeconds = value;
        }
        if (`healthChecks.${index}.intervalSeconds` === joinedPath) {
          state[index].intervalSeconds = value;
        }
        if (`healthChecks.${index}.timeoutSeconds` === joinedPath) {
          state[index].timeoutSeconds = value;
        }
        if (`healthChecks.${index}.maxConsecutiveFailures` === joinedPath) {
          state[index].maxConsecutiveFailures = value;
        }
        if (`healthChecks.${index}.https` === joinedPath) {
          if (value === true) {
            state[index].protocol = 'HTTPS';
          } else {
            state[index].protocol = 'HTTP';
          }
        }
      }
    }
    return state;
  }
};
