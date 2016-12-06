import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Util from '../../../../../../src/js/utils/Util';

function mapHealthChecks(item) {
  const newItem = Util.omit(item, ['command', 'protocol']);

  if (item.protocol != null) {
    newItem.protocol = item.protocol;
    if (item.protocol.toUpperCase() === 'COMMAND' && item.command != null) {
      newItem.command = {
        command: item.command
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
      // `this` is a context which is given to every reducer so it could
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
            this.healthChecks.push({protocol: 'COMMAND'});
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
        if (`healthChecks.${index}.command` === joinedPath) {
          this.healthChecks[index].command = value;
        }
        if (`healthChecks.${index}.path` === joinedPath) {
          this.healthChecks[index].path = value;
        }
        if (`healthChecks.${index}.gracePeriodSeconds` === joinedPath) {
          this.healthChecks[index].gracePeriodSeconds = parseInt(value, 10);
        }
        if (`healthChecks.${index}.intervalSeconds` === joinedPath) {
          this.healthChecks[index].intervalSeconds = parseInt(value, 10);
        }
        if (`healthChecks.${index}.timeoutSeconds` === joinedPath) {
          this.healthChecks[index].timeoutSeconds = parseInt(value, 10);
        }
        if (`healthChecks.${index}.maxConsecutiveFailures` === joinedPath) {
          this.healthChecks[index].maxConsecutiveFailures = parseInt(value, 10);
        }
      }
    }

    return this.healthChecks.map(mapHealthChecks);
  }
};
