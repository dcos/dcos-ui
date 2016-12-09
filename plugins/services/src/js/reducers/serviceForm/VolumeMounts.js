import {ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

/*
 * transformContainers
 * converts nested container - volumeMounts structure into flat array of tuples
 */
function transformContainers(memo, container, containerIndex) {
  if (container.volumeMounts == null) {
    return memo;
  }

  const tuples =
    container.volumeMounts.map((mount) => ([containerIndex, mount]));

  return memo.concat(tuples);
}

module.exports = {
  JSONReducer(state = [], {type, path, value}) {
    const [base, index, name] = path;

    if (base !== 'volumeMounts') {
      return state;
    }

    let newState = state.slice();

    switch (type) {
      case ADD_ITEM:
        newState.push({});
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => index !== value);
        break;
    }

    if (name === 'name') {
      newState[index].name = value;
    }

    return newState;
  },

  JSONParser(state) {
    if (state == null) {
      return [];
    }

    let volumes = [];
    let mountMap = {};

    let transactions = [];

    if (state.volumes != null) {
      const volumeTransaction = state.volumes.reduce((memo, volume) => {
        if (volume.name == null) {
          return memo;
        }
        mountMap[volume.name] = volumes.push(volume.name) - 1;
        memo.push(new Transaction(['volumeMounts'], mountMap[volume.name], ADD_ITEM));
        memo.push(new Transaction([
          'volumeMounts',
          mountMap[volume.name],
          'name'
        ], volume.name));

        return memo;
      }, []);

      transactions = transactions.concat(volumeTransaction);
    }

    const containerVolumesTransactions =
      state.containers
        .reduce(transformContainers, [])
        .reduce((memo, [containerIndex, volumeMount]) => {
          const {name, mountPath} = volumeMount;

          if (mountMap[name] == null) {
            mountMap[name] = volumes.push(name) - 1;
            memo.push(new Transaction(['volumeMounts'], mountMap[name], ADD_ITEM));
            memo.push(new Transaction([
              'volumeMounts',
              mountMap[name],
              'name'
            ], name));
          }

          memo.push(new Transaction([
            'volumeMounts',
            mountMap[name],
            'mountPath',
            containerIndex
          ], mountPath));

          return memo;
        }, []);

    return transactions.concat(containerVolumesTransactions);
  },

  FormReducer(state = [], {type, path, value}) {
    const [base, index, name, secondIndex] = path;

    let newState = state.slice();

    if (base === 'containers') {
      switch (type) {
        case ADD_ITEM:
          newState = newState.map((volumeMount) => {
            volumeMount.mountPath.push('');
            return volumeMount;
          });
          break;
        case REMOVE_ITEM:
          newState = newState.map((volumeMount) => {
            volumeMount.mountPath =
              volumeMount.mountPath.filter((item, index) => index !== value);
            return volumeMount;
          });
          break;
      }
    }

    if (base !== 'volumeMounts') {
      return newState;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({mountPath: []});
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => index !== value);
        break;
    }

    if (name === 'name') {
      newState[index].name = value;
    }
    if (name === 'mountPath') {
      newState[index].mountPath[secondIndex] = value;
    }

    return newState;
  }
};
