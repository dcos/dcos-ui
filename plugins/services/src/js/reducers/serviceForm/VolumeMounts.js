import {ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

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
      state.containers.reduce((memo, container, containerIndex) => {
        if (container.volumeMounts == null) {
          return memo;
        }

        const mountTransactions =
          container.volumeMounts.reduce((memo, mount) => {
            if (mountMap[mount.name] == null) {
              mountMap[mount.name] = volumes.push(mount.name) - 1;
              memo.push(new Transaction(['volumeMounts'], mountMap[mount.name], ADD_ITEM));
              memo.push(new Transaction([
                'volumeMounts',
                mountMap[mount.name],
                'name'
              ], mount.name));
            }

            memo.push(new Transaction([
              'volumeMounts',
              mountMap[mount.name],
              'mountPath',
              containerIndex
            ], mount.mountPath));

            return memo;
          }, []);

        return memo.concat(mountTransactions);
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
