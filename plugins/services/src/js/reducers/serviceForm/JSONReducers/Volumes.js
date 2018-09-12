import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import { omit } from "#SRC/js/utils/Util";
import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

import ContainerConstants from "../../../constants/ContainerConstants";

const { type: { MESOS, DOCKER } } = ContainerConstants;

const mapLocalVolumes = function(volume) {
  if (volume.type === "PERSISTENT") {
    return {
      persistent: volume.persistent || {},
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
  if (this.runtimeType === DOCKER && volume.external.size != null) {
    return Object.assign({}, volume, {
      external: omit(volume.external, ["size"])
    });
  }

  return volume;
};

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

  if (this.unknownVolumes == null) {
    this.unknownVolumes = [];
  }

  if (this.dockerImage == null) {
    this.dockerImage = false;
  }

  if (this.runtimeType == null) {
    this.runtimeType = MESOS;
  }

  const joinedPath = path.join(".");

  if (joinedPath === "container.docker.image") {
    this.dockerImage = value !== "";
  }

  if (joinedPath === "container.type") {
    this.dockerImage = value !== MESOS;
    this.runtimeType = value;
  }

  if (joinedPath === "unknownVolumes" && type === ADD_ITEM) {
    this.unknownVolumes.push(value);
  }

  if (path[0] === "externalVolumes") {
    if (joinedPath === "externalVolumes") {
      switch (type) {
        case ADD_ITEM:
          this.externalVolumes.push(
            value || {
              containerPath: null,
              external: {
                name: null,
                provider: "dvdi",
                options: { "dvdi/driver": "rexray" }
              },
              mode: "RW"
            }
          );
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
       * We picked externalVolumes format. External Volumes are just external volumes.
       *
       * The following code converts localVolumes by filtering HOST volumes and
       * mapping them to the common structure
       */
      return [].concat(
        this.localVolumes.map(mapLocalVolumes),
        this.externalVolumes,
        this.unknownVolumes
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
          this.localVolumes.push(
            value || {
              containerPath: null,
              persistent: { size: 0 },
              mode: "RW"
            }
          );
          break;
        case REMOVE_ITEM:
          this.localVolumes = this.localVolumes.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return [].concat(
        this.localVolumes.map(mapLocalVolumes),
        this.externalVolumes,
        this.unknownVolumes
      );
    }

    const index = path[1];
    if (type === SET && `localVolumes.${index}.size` === joinedPath) {
      if (this.localVolumes[index].persistent == null) {
        this.localVolumes[index].persistent = { size: null };
      }
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
    this.localVolumes.map(mapLocalVolumes),
    this.externalVolumes.map(mapExternalVolumes.bind(this)),
    this.unknownVolumes
  );
}

module.exports = {
  JSONReducer: reduceVolumes
};
