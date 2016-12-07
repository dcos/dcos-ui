import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import Networking from '../../../../../../src/js/constants/Networking';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer(state = {mode: Networking.type.HOST}, {type, path, value}) {
    const joinedPath = path.join('.');

    if (joinedPath === 'network' && type === SET) {
      const valueSplit = value.split('.');

      if (valueSplit[0] === Networking.type.CONTAINER) {

        return {
          mode: valueSplit[0].toLowerCase(),
          name: valueSplit[1]
        };
      }

      return {
        mode: valueSplit[0].toLowerCase()
      };
    }
    return state;
  },
  JSONParser(state) {
    if (state == null || state.network == null || state.network.mode == null) {
      return [];
    }
    if (state.network.mode === Networking.type.CONTAINER.toLowerCase()) {
      const mode = Networking.type.CONTAINER;
      const name = findNestedPropertyInObject(state, 'network.name');

      return new Transaction(['network'], `${mode}.${name}`);
    }

    return new Transaction(['network'], state.network.mode.toUpperCase());
  },
  FormReducer(state = {mode: Networking.type.HOST}, {type, path, value}) {
    const joinedPath = path.join('.');

    if (joinedPath === 'network' && type === SET) {
      const valueSplit = value.split('.');

      if (valueSplit[0] === Networking.type.CONTAINER) {

        return {
          mode: valueSplit[0],
          name: valueSplit[1]
        };
      }

      return {
        mode: valueSplit[0]
      };
    }
    return state;
  }
};
