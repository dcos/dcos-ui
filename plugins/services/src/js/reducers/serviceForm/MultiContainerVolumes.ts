import { ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import VolumeConstants from "../../constants/VolumeConstants";

const VolumeType = VolumeConstants.type;

/*
 * transformContainers
 * converts nested container - volumeMounts structure into flat array of tuples
 */
function transformContainers(memo, container, containerIndex) {
  if (container.volumeMounts == null) {
    return memo;
  }

  const tuples = container.volumeMounts.map((mount) => [containerIndex, mount]);

  return memo.concat(tuples);
}

export function MultiContainerVolumeMountsJSONReducer(
  _,
  { type, path, value }
) {
  const [base, index, name] = path;

  if (this.hostPaths == null) {
    this.hostPaths = [];
  }
  if (this.localSize == null) {
    this.localSize = [];
  }
  if (this.volumes == null) {
    this.volumes = [];
  }

  if (base !== "volumeMounts") {
    return this.volumes.slice();
  }

  switch (type) {
    case ADD_ITEM:
      this.volumes.push({ ...value });
      break;
    case REMOVE_ITEM:
      this.volumes = this.volumes.filter((item, index) => index !== value);
      this.hostPaths = this.hostPaths.filter((item, index) => index !== value);
      this.localSize = this.localSize.filter((item, index) => index !== value);
      break;
  }

  if (name === "type") {
    if (value !== VolumeType.host) {
      delete this.volumes[index].host;
    }
    if (value !== VolumeType.localPersistent && value !== VolumeType.dss) {
      delete this.volumes[index].persistent;
    }
    if (value === VolumeType.host) {
      this.volumes[index].host = this.hostPaths[index];
    }
    if (value === VolumeType.localPersistent) {
      this.volumes[index].persistent = { size: this.localSize[index] };
    }
    if (value === VolumeType.dss) {
      this.volumes[index].persistent = {
        size: this.localSize[index],
        type: "mount",
      };
    }
  }
  if (name === "size") {
    this.localSize[index] = value;
    this.volumes[index].persistent.size = parseInt(value, 10);
  }
  if (name === "profileName") {
    this.volumes[index].persistent.profileName = value;
  }
  if (name === "persistent") {
    if (value.size != null) {
      this.localSize[index] = value.size;
    }

    this.volumes[index].persistent = value;
  }
  if (name === "name") {
    this.volumes[index].name = value;
  }
  if (name === "hostPath") {
    this.hostPaths[index] = value;
    this.volumes[index].host = value;
  }

  return this.volumes.slice();
}

export function MultiContainerVolumeMountsJSONParser(state) {
  if (state == null) {
    return [];
  }

  const volumes = [];
  const volumeIndexMap = {};

  let transactions = [];

  if (state.volumes != null) {
    const volumeTransaction = state.volumes.reduce((memo, volume) => {
      if (volume.name == null) {
        return memo;
      }
      volumeIndexMap[volume.name] = volumes.push(volume.name) - 1;
      const path = (lastFragment) => [
        "volumeMounts",
        volumeIndexMap[volume.name],
        lastFragment,
      ];

      let volumeTypeTransactions = [
        new Transaction(path("type"), VolumeType.unknown),
      ];

      // Ephemeral Volumes have only name
      if (Object.keys(volume).length === 1 && volume.name != null) {
        volumeTypeTransactions = [
          new Transaction(path("type"), VolumeType.ephemeral),
        ];
      }

      if (volume.host != null) {
        volumeTypeTransactions = [
          new Transaction(path("type"), VolumeType.host),
          new Transaction(path("hostPath"), volume.host),
        ];
      }

      if (volume.persistent != null) {
        if (volume.persistent.profileName == null) {
          volumeTypeTransactions = [
            new Transaction(path("type"), VolumeType.localPersistent),
            new Transaction(path("persistent"), volume.persistent),
          ];
        } else {
          volumeTypeTransactions = [
            new Transaction(path("type"), VolumeType.dss),
            new Transaction(path("persistent"), volume.persistent),
            new Transaction(path("profileName"), volume.persistent.profileName),
          ];
        }
      }

      return memo.concat(
        new Transaction(["volumeMounts"], volume, ADD_ITEM),
        new Transaction(path("name"), volume.name),
        volumeTypeTransactions
      );
    }, []);

    transactions = transactions.concat(volumeTransaction);
  }

  const containers = state.containers || [];
  const containerVolumesTransactions = containers
    .reduce(transformContainers, [])
    .reduce((memo, [containerIndex, volumeMount]) => {
      const { name, mountPath } = volumeMount;

      if (volumeIndexMap[name] == null) {
        volumeIndexMap[name] = volumes.push(name) - 1;
        memo = memo.concat(
          new Transaction(["volumeMounts"], { name }, ADD_ITEM),
          new Transaction(["volumeMounts", volumeIndexMap[name], "name"], name)
        );
      }

      memo.push(
        new Transaction(
          ["volumeMounts", volumeIndexMap[name], "mountPath", containerIndex],
          mountPath
        )
      );

      return memo;
    }, []);

  return transactions.concat(containerVolumesTransactions);
}

export function FormReducer(state = [], { type, path, value }) {
  const [base, index, name, secondIndex] = path;

  let newState = state.slice();

  if (base === "containers") {
    switch (type) {
      case ADD_ITEM:
        newState = newState.map((volumeMount) => {
          volumeMount.mountPath.push("");

          return volumeMount;
        });
        break;
      case REMOVE_ITEM:
        newState = newState.map((volumeMount) => {
          volumeMount.mountPath = volumeMount.mountPath.filter(
            (item, index) => index !== value
          );

          return volumeMount;
        });
        break;
    }
  }

  if (base !== "volumeMounts") {
    return newState;
  }

  switch (type) {
    case ADD_ITEM:
      newState.push({
        mountPath: [],
        ...value,
      });
      break;
    case REMOVE_ITEM:
      newState = newState.filter((item, index) => index !== value);
      break;
  }

  if (name === "type") {
    newState[index].type = String(value);
  }
  if (name === "hostPath") {
    newState[index].hostPath = String(value);
  }
  if (name === "profileName") {
    newState[index].profileName = String(value);
  }
  if (name === "name") {
    newState[index].name = String(value);
  }
  if (name === "size") {
    newState[index].size = parseFloat(value);
  }
  if (name === "persistent") {
    newState[index].size = parseFloat(value.size);
  }
  if (name === "mountPath") {
    newState[index].mountPath[secondIndex] = String(value);
  }

  return newState;
}
