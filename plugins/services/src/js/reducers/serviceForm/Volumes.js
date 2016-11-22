import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (path == null) {
      return state;
    }

    // `this` is a context which is given to every reducer so it could
    // cache information.
    // In this case we are caching an two array's one for the localVolumes
    // and one for externalVolumes we need this so that there index is
    // fitting with the ones in ExternalVolumes. we combine them before
    // returning.
    if (this.externalVolumes == null) {
      this.externalVolumes = [];
    }

    if (this.localVolumes == null) {
      this.localVolumes = [];
    }

    const joinedPath = path.join('.');

    if (path[0] === 'externalVolumes') {
      if (joinedPath === 'externalVolumes') {
        switch (type) {
          case ADD_ITEM:
            this.externalVolumes.push({
              containerPath: null,
              external: {
                name: null,
                provider: 'dvdi',
                options: {'dvdi/driver': 'rexray'}
              },
              mode: 'RW'
            });
            break;
          case REMOVE_ITEM:
            this.externalVolumes =
              this.externalVolumes.filter((item, index) => {
                return index !== value;
              });
            break;
        }

        return [].concat(this.externalVolumes, this.localVolumes);
      }

      const index = path[1];
      if (type === SET && `externalVolumes.${index}.provider` === joinedPath) {
        this.externalVolumes[index].external.provider = value;
      }
      if (type === SET && `externalVolumes.${index}.options` === joinedPath) {
        this.externalVolumes[index].external.options = value;
      }
      if (type === SET && `externalVolumes.${index}.name` === joinedPath) {
        this.externalVolumes[index].external.name = value;
      }
      if (type === SET && `externalVolumes.${index}.containerPath` === joinedPath) {
        this.externalVolumes[index].containerPath = value;
      }
      if (type === SET && `externalVolumes.${index}.mode` === joinedPath) {
        this.externalVolumes[index].mode = value;
      }
    }

    if (joinedPath.search('localVolumes') !== -1) {
      if (joinedPath === 'localVolumes') {
        switch (type) {
          case ADD_ITEM:
            this.localVolumes.push({
              containerPath: null,
              persistent: {size: null},
              mode: 'RW'
            });
            break;
          case REMOVE_ITEM:
            this.localVolumes = this.localVolumes.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return [].concat(this.externalVolumes, this.localVolumes);
      }

      const index = path[1];
      if (type === SET && `localVolumes.${index}.size` === joinedPath) {
        this.localVolumes[index].persistent.size = value;
      }
      if (type === SET && `localVolumes.${index}.mode` === joinedPath) {
        this.localVolumes[index].mode = value;
      }
      if (type === SET && `localVolumes.${index}.containerPath` === joinedPath) {
        this.localVolumes[index].containerPath = value;
      }
    }

    return [].concat(this.externalVolumes, this.localVolumes);
  }
};
