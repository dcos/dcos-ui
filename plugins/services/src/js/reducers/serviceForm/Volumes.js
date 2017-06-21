import { parseIntValue } from "../../../../../../src/js/utils/ReducerUtil";
import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../src/js/constants/TransactionTypes";

const mapLocalVolumes = function(volume) {
  if (volume.type === "PERSISTENT") {
    return {
      persistent: volume.persistent,
      mode: volume.mode,
      containerPath: volume.containerPath
    };
  }

  return {
    containerPath: volume.containerPath,
    hostPath: volume.hostPath,
    mode: volume.mode
  };
};

const mapExternalVolumes = function(volume) {
  if (
    this.docker &&
    this.dockerType === "DOCKER" &&
    volume.external.size != null
  ) {
    return Object.assign({}, volume, {
      external: Object.assign({}, volume.external, { size: null })
    });
  }

  return volume;
};

const filterHostVolumes = function(volume) {
  return volume.type !== "HOST" || this.docker;
};

// NB: This is being used as FormReducer and JSONReducer
function reduceVolumes(state, { type, path, value }) {
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

  if (this.docker == null) {
    this.docker = false;
  }

  if (this.dockerType == null) {
    this.dockerType = "DOCKER";
  }

  const joinedPath = path.join(".");

  if (joinedPath === "container.docker.image") {
    this.docker = value !== "";
  }

  if (joinedPath === "container.type") {
    this.docker = value !== "NONE";
    this.dockerType = value;
  }

  if (path[0] === "externalVolumes") {
    if (joinedPath === "externalVolumes") {
      switch (type) {
        case ADD_ITEM:
          this.externalVolumes.push({
            containerPath: null,
            external: {
              name: null,
              provider: "dvdi",
              options: { "dvdi/driver": "rexray" }
            },
            mode: "RW"
          });
          break;
        case REMOVE_ITEM:
          this.externalVolumes = this.externalVolumes.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      /**
       * localVolumes and externalVolumes share the same reducer and
       * the section in the form but representing quite different things.
       *
       * Reducer should use the same format therefore we need to pick either
       * localVolumes format or externalVolumes format.
       * We picked externalVolumes format. External Volumes are just external
       * volumes.
       *
       * The following code converts localVolumes by filtering HOST volumes and
       * mapping them to the common structure
       */
      return [].concat(
        this.localVolumes
          .filter(filterHostVolumes.bind(this))
          .map(mapLocalVolumes),
        this.externalVolumes
      );
    }

    const index = path[1];
    if (type === SET && `externalVolumes.${index}.provider` === joinedPath) {
      this.externalVolumes[index].external.provider = String(value);
    }
    if (type === SET && `externalVolumes.${index}.options` === joinedPath) {
      // Options is of type object, so we are not processing it
      this.externalVolumes[index].external.options = value;
    }
    if (type === SET && `externalVolumes.${index}.name` === joinedPath) {
      this.externalVolumes[index].external.name = String(value);
    }
    if (
      type === SET &&
      `externalVolumes.${index}.containerPath` === joinedPath
    ) {
      this.externalVolumes[index].containerPath = String(value);
    }
    if (type === SET && `externalVolumes.${index}.size` === joinedPath) {
      this.externalVolumes[index].external.size = parseIntValue(value);
    }
    if (type === SET && `externalVolumes.${index}.mode` === joinedPath) {
      this.externalVolumes[index].mode = String(value);
    }
  }

  if (joinedPath.search("localVolumes") !== -1) {
    if (joinedPath === "localVolumes") {
      switch (type) {
        case ADD_ITEM:
          this.localVolumes.push({
            containerPath: null,
            persistent: { size: null },
            mode: "RW"
          });
          break;
        case REMOVE_ITEM:
          this.localVolumes = this.localVolumes.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return [].concat(
        this.localVolumes
          .filter(filterHostVolumes.bind(this))
          .map(mapLocalVolumes),
        this.externalVolumes
      );
    }

    const index = path[1];
    if (type === SET && `localVolumes.${index}.size` === joinedPath) {
      this.localVolumes[index].persistent.size = parseIntValue(value);
    }
    if (type === SET && `localVolumes.${index}.type` === joinedPath) {
      this.localVolumes[index].type = String(value);
    }
    if (type === SET && `localVolumes.${index}.mode` === joinedPath) {
      this.localVolumes[index].mode = String(value);
    }
    if (type === SET && `localVolumes.${index}.hostPath` === joinedPath) {
      this.localVolumes[index].hostPath = String(value);
    }
    if (type === SET && `localVolumes.${index}.containerPath` === joinedPath) {
      this.localVolumes[index].containerPath = String(value);
    }
  }

  return [].concat(
    this.localVolumes.filter(filterHostVolumes.bind(this)).map(mapLocalVolumes),
    this.externalVolumes.map(mapExternalVolumes.bind(this))
  );
}

module.exports = {
  JSONReducer: reduceVolumes,
  FormReducer: reduceVolumes
};
