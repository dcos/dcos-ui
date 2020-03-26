import { ADD_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

import {
  processSecretTransaction,
  processPodSecretTransaction,
  defaultSecretVolumeKey,
} from "./Secrets";
import {
  SingleContainerServiceJSON,
  SingleContainerReducerContext,
  Volume,
  ContainerDefinition,
  MultiContainerReducerContext,
  MultiContainerVolume,
} from "./types";

function JSONSingleContainerReducer(
  this: SingleContainerReducerContext,
  _: ContainerDefinition,
  { type, path, value }: Transaction
): Volume[] {
  if (path == null) {
    return [];
  }
  if (this.secrets == null) {
    this.secrets = [];
  }

  this.secrets = processSecretTransaction(this.secrets, {
    type,
    path,
    value,
  });
  const secretVolumes: Volume[] = [];

  return this.secrets.reduce((memo, item, index) => {
    const key = item.key || `secret${index}`;

    if (Array.isArray(item.exposures) && key != null) {
      item.exposures
        .filter((exposure) => exposure.type === "file" && exposure.value)
        .map((exposure) => exposure.value)
        .forEach((containerPath) => {
          memo.push({
            containerPath,
            secret: key,
          });
        });
    }
    return memo;
  }, secretVolumes);
}

function UnknownVolumesParser(
  state: SingleContainerServiceJSON
): Transaction[] {
  const result: Transaction[] = [];
  if (state.container == null || state.container.volumes == null) {
    return result;
  }

  return state.container.volumes
    .filter((item) => {
      return (
        item.persistent == null &&
        item.external == null &&
        item.hostPath == null &&
        item.mode == null &&
        item.secret == null
      );
    })
    .reduce((memo, item) => {
      return memo.concat(new Transaction(["unknownVolumes"], item, ADD_ITEM));
    }, result);
}

function JSONMultiContainerReducer(
  this: MultiContainerReducerContext,
  state: MultiContainerVolume[],
  { type, path, value }: Transaction
): MultiContainerVolume[] {
  if (path == null) {
    return state;
  }
  if (this.secrets == null) {
    this.secrets = [];
  }

  this.secrets = processPodSecretTransaction(this.secrets, {
    type,
    path,
    value,
  });
  let secretVolumes: MultiContainerVolume[] = [];

  secretVolumes = this.secrets.reduce((memo, item, secretIndex) => {
    const secretKey = item.key || `secret${secretIndex}`;

    if (
      Array.isArray(item.exposures) &&
      secretKey != null &&
      secretKey.length > 0
    ) {
      item.exposures
        .filter((exposure) => exposure.type === "file")
        .forEach((exposure) => {
          if (!exposure.mounts) {
            return;
          }
          const hasMounts = exposure.mounts.reduce(
            (result, mountPath) => result || mountPath.length > 0,
            false
          );
          if (!hasMounts) {
            return;
          }
          memo.push({
            name:
              exposure.value || defaultSecretVolumeKey(secretKey, secretIndex),
            secret: secretKey,
          });
        });
    }

    return memo;
  }, secretVolumes);

  return state.concat(secretVolumes);
}

export {
  defaultSecretVolumeKey,
  JSONSingleContainerReducer,
  UnknownVolumesParser,
  JSONMultiContainerReducer,
};
