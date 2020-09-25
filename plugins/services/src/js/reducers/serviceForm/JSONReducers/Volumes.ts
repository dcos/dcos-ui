import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import { omit } from "#SRC/js/utils/Util";
import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

import ContainerConstants from "../../../constants/ContainerConstants";

const { MESOS, DOCKER } = ContainerConstants.type;

const mapVolumes = function (volume) {
  if (volume.type === "EXTERNAL") {
    if (this.runtimeType === DOCKER && volume.external?.size != null) {
      return {
        external: omit(volume.external, ["size"]),
        mode: volume.mode,
        containerPath: volume.containerPath,
      };
    }

    return {
      external: volume.external,
      mode: volume.mode,
      containerPath: volume.containerPath,
    };
  }
  if (volume.type === "PERSISTENT") {
    return {
      persistent: omit(volume.persistent, ["profileName"]),
      mode: volume.mode,
      containerPath: volume.containerPath,
    };
  }

  if (volume.type === "DSS") {
    return {
      persistent: { type: "mount", ...volume.persistent },
      mode: volume.mode,
      containerPath: volume.containerPath,
    };
  }

  return {
    containerPath: volume.containerPath,
    hostPath: volume.hostPath,
    mode: volume.mode,
  };
};

function reduceVolumes(state, { type, path, value }) {
  if (path == null) {
    return state;
  }

  // `this` is a context which is given to every reducer so it could
  // cache information.
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

  if (joinedPath.search("volumes") !== -1) {
    if (joinedPath === "volumes") {
      switch (type) {
        case ADD_ITEM:
          this.volumes.push({
            containerPath: null,
            persistent: { size: null, profileName: null },

            external: {
              name: null,
              provider: "dvdi",
              options: { "dvdi/driver": "rexray" },
            },

            mode: "RW",
            ...value,
          });
          break;
        case REMOVE_ITEM:
          this.volumes = this.volumes.filter((_, index) => index !== value);
          break;
      }

      return [].concat(
        this.volumes.map(mapVolumes.bind(this)),
        this.unknownVolumes
      );
    }

    const index = path[1];
    const volume = this.volumes[index];
    if (type === SET) {
      if (`volumes.${index}.size` === joinedPath) {
        if (volume.persistent == null) {
          volume.persistent = { size: null, profileName: null };
        }
        if (volume.external == null) {
          volume.external = { size: null };
        }
        volume.persistent.size = parseIntValue(value);
        volume.external.size = parseIntValue(value);
      }
      if (`volumes.${index}.profileName` === joinedPath) {
        if (volume.persistent == null) {
          volume.persistent = { size: null, profileName: null };
        }
        volume.persistent.profileName = String(value);
      }
      if (`volumes.${index}.type` === joinedPath) {
        volume.type = String(value);
      }
      if (`volumes.${index}.name` === joinedPath) {
        if (volume.external == null) {
          volume.external = { name: null, size: null };
        }
        volume.external.name = String(value);
      }
      if (`volumes.${index}.provider` === joinedPath) {
        volume.external.provider = String(value);
      }
      if (`volumes.${index}.options` === joinedPath) {
        // Options is of type object, so we are not processing it
        volume.external.options = value;
      }
      if (`volumes.${index}.mode` === joinedPath) {
        volume.mode = String(value);
      }
      if (`volumes.${index}.hostPath` === joinedPath) {
        volume.hostPath = String(value);
      }
      if (`volumes.${index}.containerPath` === joinedPath) {
        volume.containerPath = String(value);
      }
    }
  }

  return [].concat(
    this.volumes.map(mapVolumes.bind(this)),
    this.unknownVolumes
  );
}

export const JSONReducer = reduceVolumes;
export function JSONParser(state) {
  if (state.container == null || state.container.volumes == null) {
    return [];
  }

  return state.container.volumes
    .filter(
      (item) =>
        item.persistent != null ||
        item.external != null ||
        item.hostPath != null ||
        item.mode != null
    )
    .reduce((memo, item, index) => {
      memo.push(new Transaction(["volumes"], item, ADD_ITEM));
      const setVolumeProp = (prop, val) => {
        if (val != null) {
          memo.push(new Transaction(["volumes", index, prop], val, SET));
        }
      };

      if (item.persistent != null) {
        const { profileName, size } = item.persistent;
        const type = profileName == null ? "PERSISTENT" : "DSS";
        setVolumeProp("type", type);
        if (type === "DSS") {
          setVolumeProp("profileName", profileName);
        }
        setVolumeProp("size", size);
      } else if (item.external != null) {
        setVolumeProp("type", "EXTERNAL");
        setVolumeProp("name", item.external.name);
        setVolumeProp("size", item.external.size);
        setVolumeProp("options", item.external.options);
        setVolumeProp("provider", item.external.provider);
      } else if (item.hostPath != null) {
        setVolumeProp("type", "HOST");
        setVolumeProp("hostPath", item.hostPath || "");
      }

      setVolumeProp("containerPath", item.containerPath);
      setVolumeProp("mode", item.mode);

      return memo;
    }, []);
}
