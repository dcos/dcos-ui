import {ADD_ITEM, REMOVE_ITEM} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer(state = [], {type, path, value}) {
    if (path[0] !== 'volumeMounts') {
      return state;
    }

    let newState = state.slice();

    switch (type) {
      case ADD_ITEM:
        newState.push({});
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => {
          return index !== value;
        });
        break;
    }

    if (path[2] === 'name') {
      newState[path[1]].name = value;
    }

    return newState;
  },
  JSONParser(state) {
    if (state == null) {
      return [];
    }

    let volumes = [];
    let mountMap = {};

    let memo = [];
    if (state.volumes != null) {
      memo.push(...state.volumes.reduce((memo, volume) => {
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
      }, []));
    }

    memo.push(...state.containers.reduce((memo, container, containerIndex) => {
      if (container.volumeMounts == null) {
        return memo;
      }

      memo.push(...container.volumeMounts.reduce((memo, mount) => {
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
      }, []));

      return memo;
    }, []));

    return memo;
  },
  FormReducer(state = [], {type, path, value}) {
    let newState = state.slice();

    if (path[0] === 'containers') {
      switch (type) {
        case ADD_ITEM:
          newState = newState.map((volumeMount) => {

            volumeMount.mountPath.push('');
            return volumeMount;
          });
          break;
        case REMOVE_ITEM:
          newState = newState.map((volumeMount) => {
            volumeMount.mountPath = volumeMount.mountPath.filter((item, index) => {
              return index !== value;
            });
            return volumeMount;
          });
          break;
      }
    }

    if (path[0] !== 'volumeMounts') {
      return newState;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({mountPath: []});
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => {
          return index !== value;
        });
        break;
    }

    if (path[2] === 'name') {
      newState[path[1]].name = value;
    }
    if (path[2] === 'mountPath') {
      newState[path[1]].mountPath[path[3]] = value;
    }

    return newState;
  }
};
