import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONParser(state) {
    if (state.container == null || state.container.volumes == null) {
      return [];
    }

    return state.container.volumes.filter((item) => item.external != null)
    .reduce(function (memo, item, index) {
      /**
       * For the externalVolumes we have a special case as all the volumes
       * are present in the `container.volumes` But in this parser we only
       * want to parse the external volumes. Which means that we first filter
       * those and only keep external volumes (decision based on if
       * external is set). After that we do get all the values even
       * stuff which we do not handle in the form yet. These steps are:
       * 1) Add a new Item to the path with the index equal to index.
       * 2) Set the neame from `volume.external.name`on the path
       *    `externalVolumes.${index}.name`.
       * 3) Set the containerPath from `volume.containerPath on the path
       *    `externalVolumes.${index}.containerPath`
       * 4) Set the provider from `volume.external.provider` on the path
       *    `externalVolumes.${index}.provider`
       * 5) Set the options from `volume.external.options` on the path
       *    `externalVolumes.${index}.options`
       * 6) Set the mode from `volume.mode` on the path
       *    `externalVolumes.${index}.mode`
       */
      memo.push(new Transaction(['externalVolumes'], index, ADD_ITEM));

      if (item.external.name != null) {
        memo.push(new Transaction([
          'externalVolumes',
          index,
          'name'
        ], item.external.name, SET));
      }

      if (item.containerPath != null) {
        memo.push(new Transaction([
          'externalVolumes',
          index,
          'containerPath'
        ], item.containerPath, SET));
      }

      if (item.external.provider != null) {
        memo.push(new Transaction([
          'externalVolumes',
          index,
          'provider'
        ], item.external.provider, SET));
      }

      if (item.external.options != null) {
        memo.push(new Transaction([
          'externalVolumes',
          index,
          'options'
        ], item.external.options, SET));
      }
      if (item.mode != null) {
        memo.push(new Transaction([
          'externalVolumes',
          index,
          'mode'
        ], item.mode, SET));
      }

      return memo;
    }, []);
  },

  FormReducer(state = [], {type, path, value}) {
    if (path == null) {
      return state;
    }

    let joinedPath = path.join('.');

    if (path[0] === 'externalVolumes') {
      if (joinedPath === 'externalVolumes') {
        switch (type) {
          case ADD_ITEM:
            state.push({
              containerPath: null, name: null, provider: 'dvdi',
              options: {
                'dvdi/driver': 'rexray'
              },
              mode: 'RW'
            });
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      let index = path[1];
      if (type === SET && `externalVolumes.${index}.provider` === joinedPath) {
        state[index].provider = value;
      }
      if (type === SET && `externalVolumes.${index}.options` === joinedPath) {
        state[index].options = value;
      }
      if (type === SET && `externalVolumes.${index}.name` === joinedPath) {
        state[index].name = value;
      }
      if (type === SET && `externalVolumes.${index}.containerPath` === joinedPath) {
        state[index].containerPath = value;
      }
      if (type === SET && `externalVolumes.${index}.size` === joinedPath) {
        state[index].size= value;
      }
      if (type === SET && `externalVolumes.${index}.mode` === joinedPath) {
        state[index].mode= value;
      }
    }

    return state;
  }
};
