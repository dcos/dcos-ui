import { parseIntValue } from "#SRC/js/utils/ReducerUtil";
import { omit } from "#SRC/js/utils/Util";
import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

import ContainerConstants from "../../../constants/ContainerConstants";

const {
  type: { MESOS, DOCKER }
} = ContainerConstants;

const mapVolumes = function(volume) {
  if (volume.type === "EXTERNAL") {
    if (
      this.runtimeType === DOCKER &&
      volume.external != null &&
      volume.external.size != null
    ) {
      return {
        external: omit(volume.external, ["size"]),
        mode: volume.mode,
        containerPath: volume.containerPath
      };
    }

    return {
      external: volume.external,
      mode: volume.mode,
      containerPath: volume.containerPath
    };
  }
  if (volume.type === "PERSISTENT") {
    return {
      persistent: omit(volume.persistent, ["profileName"]),
      mode: volume.mode,
      containerPath: volume.containerPath
    };
  }

  if (volume.type === "DSS") {
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
          this.volumes.push(
            Object.assign(
              {},
              {
                containerPath: null,
                persistent: { size: null, profileName: null },
                external: {
                  name: null,
                  provider: "dvdi",
                  options: { "dvdi/driver": "rexray" }
                },
                mode: "RW"
              },
              value
            )
          );
          break;
        case REMOVE_ITEM:
          this.volumes = this.volumes.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return [].concat(
        this.volumes.map(mapVolumes.bind(this)),
        this.unknownVolumes
      );
    }

    const index = path[1];
    if (type === SET && `volumes.${index}.size` === joinedPath) {
      if (this.volumes[index].persistent == null) {
        this.volumes[index].persistent = { size: null, profileName: null };
      }
      if (this.volumes[index].external == null) {
        this.volumes[index].external = { size: null };
      }
      this.volumes[index].persistent.size = parseIntValue(value);
      this.volumes[index].external.size = parseIntValue(value);
    }
    if (type === SET && `volumes.${index}.profileName` === joinedPath) {
      if (this.volumes[index].persistent == null) {
        this.volumes[index].persistent = { size: null, profileName: null };
      }
      this.volumes[index].persistent.profileName = String(value);
    }
    if (type === SET && `volumes.${index}.type` === joinedPath) {
      this.volumes[index].type = String(value);
    }
    if (type === SET && `volumes.${index}.name` === joinedPath) {
      if (this.volumes[index].external == null) {
        this.volumes[index].external = { name: null, size: null };
      }
      this.volumes[index].external.name = String(value);
    }
    if (type === SET && `volumes.${index}.provider` === joinedPath) {
      this.volumes[index].external.provider = String(value);
    }
    if (type === SET && `volumes.${index}.options` === joinedPath) {
      // Options is of type object, so we are not processing it
      this.volumes[index].external.options = value;
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
    this.volumes.map(mapVolumes.bind(this)),
    this.unknownVolumes
  );
}

module.exports = {
  JSONReducer: reduceVolumes,
  JSONParser(state) {
    if (state.container == null || state.container.volumes == null) {
      return [];
    }

    return state.container.volumes
      .filter(function(item) {
        return (
          item.persistent != null ||
          item.external != null ||
          item.hostPath != null ||
          item.mode != null
        );
      })
      .reduce(function(memo, item, index) {
        /**
         * For the volumes we have a special case as all the volumes
         * are present in the `container.volumes` But in this parser we only
         * want to parse the local volumes. which means that we first filter
         * those and only keep local volumes (decision based on if
         * persistent or hostPath is set). After that we do get all the values even
         * stuff which we do not handle in the form yet. These steps are:
         * 1) Add a new Item to the path with the index equal to index.
         * 2) Set the size from `volume.persistent.size`on the path
         *    `volumes.${index}.size`.
         * 3) Set the containerPath from `volume.containerPath on the path
         *    `volumes.${index}.containerPath`
         * 4) Set the mode from `volume.mode` on the path
         *    `volumes.${index}.mode`
         */
        memo.push(new Transaction(["volumes"], item, ADD_ITEM));

        if (item.persistent != null && item.persistent.size != null) {
          if (item.persistent.profileName == null) {
            memo.push(
              new Transaction(["volumes", index, "type"], "PERSISTENT", SET)
            );
          } else {
            memo.push(new Transaction(["volumes", index, "type"], "DSS", SET));

            memo.push(
              new Transaction(
                ["volumes", index, "profileName"],
                item.persistent.profileName,
                SET
              )
            );
          }

          memo.push(
            new Transaction(
              ["volumes", index, "size"],
              item.persistent.size,
              SET
            )
          );
        } else if (item.external != null && item.external.name != null) {
          memo.push(
            new Transaction(["volumes", index, "type"], "EXTERNAL", SET)
          );

          if (item.external.name != null) {
            memo.push(
              new Transaction(
                ["volumes", index, "name"],
                item.external.name,
                SET
              )
            );
          }

          if (item.external.size != null) {
            memo.push(
              new Transaction(
                ["volumes", index, "size"],
                item.external.size,
                SET
              )
            );
          }

          if (item.external.options != null) {
            memo.push(
              new Transaction(
                ["volumes", index, "options"],
                item.external.options,
                SET
              )
            );
          }

          if (item.external.provider != null) {
            memo.push(
              new Transaction(
                ["volumes", index, "provider"],
                item.external.provider,
                SET
              )
            );
          }
        } else if (item.hostPath != null) {
          memo.push(new Transaction(["volumes", index, "type"], "HOST", SET));

          memo.push(
            new Transaction(
              ["volumes", index, "hostPath"],
              item.hostPath || "",
              SET
            )
          );
        }

        if (item.containerPath != null) {
          memo.push(
            new Transaction(
              ["volumes", index, "containerPath"],
              item.containerPath,
              SET
            )
          );
        }

        if (item.mode != null) {
          memo.push(
            new Transaction(["volumes", index, "mode"], item.mode, SET)
          );
        }

        return memo;
      }, []);
  }
};
