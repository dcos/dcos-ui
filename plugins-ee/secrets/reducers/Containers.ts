import Transaction from "#SRC/js/structs/Transaction";

import { processPodSecretTransaction } from "./Secrets";
import {
  MultiContainerReducerContext,
  MultiContainerVolumeMount,
  PodContainer
} from "./types";
import { defaultSecretVolumeKey } from "./Volumes";

function JSONReducer(
  this: MultiContainerReducerContext,
  state: PodContainer[],
  action: Transaction
): PodContainer[] {
  if (action.path == null) {
    return state;
  }
  if (this.secrets == null) {
    this.secrets = [];
  }
  if (this.secretVolumeMounts == null) {
    this.secretVolumeMounts = [];
  }
  if (this.volumeMounts == null) {
    this.volumeMounts = [];
  }
  let newState = state.slice();
  this.secretVolumeMounts = newState.map(() => []);

  this.secrets = processPodSecretTransaction(this.secrets, action);

  this.secretVolumeMounts = this.secrets.reduce(
    (containerVolumes, secret, secretIndex) => {
      const secretKey = secret.key || `secret${secretIndex}`;
      secret.exposures.forEach(exposure => {
        if (!exposure.mounts || exposure.type !== "file") {
          return;
        }
        exposure.mounts.forEach((mountPath, containerIndex) => {
          if (mountPath == null || mountPath.length === 0) {
            return;
          }
          const name =
            exposure.value || defaultSecretVolumeKey(secretKey, secretIndex);
          containerVolumes[containerIndex].push({
            name,
            mountPath
          });
        });
      });
      return containerVolumes;
    },
    this.secretVolumeMounts
  );

  newState = state.map((container, index) => {
    const numVolMounts = this.volumeMounts ? this.volumeMounts.length : 0;
    const numSecretVolMounts =
      this.secretVolumeMounts && this.secretVolumeMounts.length > index
        ? this.secretVolumeMounts[index].length
        : 0;
    const totalVolumeMounts = numVolMounts + numSecretVolMounts;
    if (totalVolumeMounts === 0) {
      if (container.volumeMounts) {
        delete container.volumeMounts;
      }
      return container;
    }
    let volumeMounts: MultiContainerVolumeMount[] = [];
    if (this.volumeMounts && this.volumeMounts.length > 0) {
      volumeMounts = this.volumeMounts
        .filter(volumeMount => {
          return volumeMount.name != null && volumeMount.mountPath[index];
        })
        .map(volumeMount => {
          return {
            name: volumeMount.name,
            mountPath: volumeMount.mountPath[index]
          };
        });
    }
    // @ts-ignore
    const secretMounts = this.secretVolumeMounts[index];
    container.volumeMounts = volumeMounts.concat(secretMounts);

    return container;
  });

  return newState;
}

export { JSONReducer };
