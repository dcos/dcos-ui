import Networking from '../../../../../../src/js/constants/Networking';
import {SET, ADD_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer(state = [{mode: 'host'}], {type, path, value}) {
    const index = path[1] || 0;

    let newState = state.slice();
    if (path[0] === 'network') {

      if (type === ADD_ITEM) {
        newState.push({mode: Networking.type.HOST.toLowerCase()});
        return newState;
      }

      if (type === SET) {
        const [mode, name] = value.split('.');

        if (mode === Networking.type.CONTAINER) {
          newState[index] = {
            name,
            mode: mode.toLowerCase()
          };
          return newState;
        }

        newState[index] = {
          mode: mode.toLowerCase()
        };
      }
    }

    return newState;
  },

  JSONParser(state) {
    if (state == null || state.networks == null || !Array.isArray(state.networks)) {
      return [];
    }

    return state.networks.reduce((memo, network, index) => {
      memo.push(new Transaction(['network'], index, ADD_ITEM));

      if (network.mode == null) {
        return memo;
      }

      if (network.mode === Networking.type.CONTAINER.toLowerCase()) {
        const mode = Networking.type.CONTAINER;
        const name = network.name;

        memo.push(new Transaction(['network', index], `${mode}.${name}`));
        return memo;
      }

      memo.push(new Transaction(['network', index], network.mode.toUpperCase()));
      return memo;
    }, []);
  },

  FormReducer(state = {mode: Networking.type.HOST}, {type, path, value}) {
    const joinedPath = path.join('.');

    if (joinedPath === 'network.0' && type === SET) {
      const [mode, name] = value.split('.');

      if (mode === Networking.type.CONTAINER) {
        return {mode, name};
      }

      return {mode};
    }

    return state;
  }
};
