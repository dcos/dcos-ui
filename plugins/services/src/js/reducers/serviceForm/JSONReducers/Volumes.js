import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import { omit } from "#SRC/js/utils/Util";
import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";

import ContainerConstants from "../../../constants/ContainerConstants";

const { type: { MESOS, DOCKER } } = ContainerConstants;

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
  // In this case we are caching an two array's one for the volumes
  // and one for externalVolumes we need this so that there index is
  // fitting with the ones in ExternalVolumes. we combine them before
  // returning.
  if (this.externalVolumes == null) {
    this.externalVolumes = [];
  }

  if (this.volumes == null) {
    this.volumes = [];
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
       * volumes and externalVolumes share the same reducer and
       * the section in the form but representing quite different things.
       *
       * Reducer should use the same format therefore we need to pick either
       * volumes format or externalVolumes format.
       * We picked externalVolumes format. External Volumes are just external volumes.
       *
       * The following code converts volumes by filtering HOST volumes and
       * mapping them to the common structure
       */
      return [].concat(
        this.volumes.map(mapLocalVolumes),
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

  if (joinedPath.search("volumes") !== -1) {
    if (joinedPath === "volumes") {
      switch (type) {
        case ADD_ITEM:
          this.volumes.push(
            value || {
              containerPath: null,
              persistent: { size: null },
              mode: "RW"
            }
          );
          break;
        case REMOVE_ITEM:
          this.volumes = this.volumes.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return [].concat(
        this.volumes.map(mapLocalVolumes),
        this.externalVolumes,
        this.unknownVolumes
      );
    }

    const index = path[1];
    if (type === SET && `volumes.${index}.size` === joinedPath) {
      if (this.volumes[index].persistent == null) {
        this.volumes[index].persistent = { size: null };
      }
      this.volumes[index].persistent.size = parseIntValue(value);
    }
    if (type === SET && `volumes.${index}.type` === joinedPath) {
      this.volumes[index].type = String(value);
    }
    if (type === SET && `volumes.${index}.mode` === joinedPath) {
      this.volumes[index].mode = String(value);
    }
    if (type === SET && `volumes.${index}.hostPath` === joinedPath) {
      this.volumes[index].hostPath = String(value);
    }
    if (type === SET && `volumes.${index}.containerPath` === joinedPath) {
      this.volumes[index].containerPath = String(value);
    }
  }

  return [].concat(
    this.volumes.map(mapLocalVolumes),
    this.externalVolumes.map(mapExternalVolumes.bind(this)),
    this.unknownVolumes
  );
}

module.exports = {
  JSONReducer: reduceVolumes
};
