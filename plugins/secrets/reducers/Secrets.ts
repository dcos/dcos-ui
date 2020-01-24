import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import { deepCopy } from "#SRC/js/utils/Util";

import {
  MultiContainerReducerContext,
  MultiContainerSecretContext,
  MultiContainerServiceJSON,
  ServiceSecret,
  SingleContainerReducerContext,
  SingleContainerSecretExposure,
  SingleContainerSecretContext,
  SingleContainerServiceJSON,
  MultiContainerVolume,
  MultiContainerSecretExposure
} from "./types";

function defaultSecretVolumeKey(secretKey: string, index: number) {
  return `${secretKey}volume${index}`;
}

function emptySingleContainerSecret(): SingleContainerSecretContext {
  return { key: null, value: null, exposures: [] };
}

function emptyMultiContainerSecret(): MultiContainerSecretContext {
  return { key: null, value: null, exposures: [] };
}
// tslint:disable-next-line
function processSecretTransaction(
  secrets: SingleContainerSecretContext[],
  { type, path, value }: Transaction
): SingleContainerSecretContext[] {
  const base: string = path[0] as string;
  if (base !== "secrets") {
    return secrets;
  }
  let newSecrets: SingleContainerSecretContext[] = deepCopy(secrets);
  const index: number | undefined =
    path.length > 1 ? (path[1] as number) : undefined;
  const field: string | undefined =
    path.length > 2 ? (path[2] as string) : undefined;
  const secondaryIndex: number | undefined =
    path.length > 3 ? (path[3] as number) : undefined;

  switch (type) {
    case ADD_ITEM:
      if (index == null) {
        const item: SingleContainerSecretContext = value
          ? (value as SingleContainerSecretContext)
          : emptySingleContainerSecret();
        newSecrets.push(item);
      } else if (field === "exposures") {
        if (
          typeof value === "object" &&
          value != null &&
          "type" in value &&
          "value" in value
        ) {
          newSecrets[index].exposures.push(
            value as SingleContainerSecretExposure
          );
        } else if (typeof value === "string") {
          newSecrets[index].exposures.push({ type: "envVar", value });
        } else {
          newSecrets[index].exposures.push({ type: "envVar", value: "" });
        }
      }
      break;
    case REMOVE_ITEM:
      if (!field) {
        newSecrets = newSecrets.filter((_, index) => {
          return index !== value;
        });
      } else if (index !== undefined && field === "exposures") {
        newSecrets[index].exposures = newSecrets[index].exposures.filter(
          (_, index) => index !== value
        );
      }
      break;
    case SET:
      if (index !== undefined) {
        if (field === "key" || field === "value") {
          newSecrets[index][field] = value as string;
        } else if (field === "exposures" && secondaryIndex != null) {
          // initialize empty exposure values up to the index we're setting
          if (secondaryIndex >= newSecrets[index].exposures.length) {
            for (
              let i = newSecrets[index].exposures.length;
              i <= secondaryIndex;
              i++
            ) {
              newSecrets[index].exposures[i] = { type: "", value: "" };
            }
          }
          const exposureField: string | null =
            path.length > 4 ? (path[4] as string) : null;
          if (exposureField == null) {
            newSecrets[index].exposures[
              secondaryIndex
            ] = value as SingleContainerSecretExposure;
          } else if (exposureField === "value") {
            newSecrets[index].exposures[secondaryIndex].value = value as string;
          } else if (exposureField === "type") {
            const currentType =
              newSecrets[index].exposures[secondaryIndex].type;
            const newType = value as string;
            if (currentType !== newType) {
              newSecrets[index].exposures[secondaryIndex].type = newType;
              newSecrets[index].exposures[secondaryIndex].value = "";
            }
          }
        }
      }
      break;
  }
  return newSecrets;
}

// tslint:disable-next-line
function processPodSecretTransaction(
  secrets: MultiContainerSecretContext[],
  { type, path, value }: Transaction
): MultiContainerSecretContext[] {
  const base: string = path[0] as string;
  if (base !== "secrets") {
    return secrets;
  }
  let newSecrets: MultiContainerSecretContext[] = deepCopy(secrets);

  const index: number | undefined =
    path.length > 1 ? (path[1] as number) : undefined;
  const field: string | undefined =
    path.length > 2 ? (path[2] as string) : undefined;
  const secondaryIndex: number | undefined =
    path.length > 3 ? (path[3] as number) : undefined;

  switch (type) {
    case ADD_ITEM:
      if (index == null) {
        const item: MultiContainerSecretContext = value
          ? (value as MultiContainerSecretContext)
          : emptyMultiContainerSecret();
        newSecrets.push(item);
      } else if (field === "exposures") {
        if (
          typeof value === "object" &&
          value != null &&
          "type" in value &&
          "value" in value
        ) {
          newSecrets[index].exposures.push(
            value as MultiContainerSecretExposure
          );
        } else if (typeof value === "string") {
          newSecrets[index].exposures.push({ type: "envVar", value });
        } else {
          newSecrets[index].exposures.push({ type: "envVar", value: "" });
        }
      }
      break;
    case REMOVE_ITEM:
      if (!field) {
        newSecrets = newSecrets.filter((_, index) => index !== value);
      } else if (index != null && field === "exposures") {
        newSecrets[index].exposures = newSecrets[index].exposures.filter(
          (_, index) => index !== value
        );
      }
      break;
    case SET:
      if (index != null) {
        if (field === "key" || field === "value") {
          newSecrets[index][field] = value as string;
        } else if (field === "exposures" && secondaryIndex != null) {
          // initialize empty exposure values up to the index we're setting
          if (secondaryIndex >= newSecrets[index].exposures.length) {
            for (
              let i = newSecrets[index].exposures.length;
              i <= secondaryIndex;
              i++
            ) {
              newSecrets[index].exposures[i] = { type: "", value: "" };
            }
          }
          const exposureField: string | null =
            path.length > 4 ? (path[4] as string) : null;
          if (exposureField == null) {
            newSecrets[index].exposures[
              secondaryIndex
            ] = value as MultiContainerSecretExposure;
          } else if (exposureField === "value") {
            newSecrets[index].exposures[secondaryIndex].value = value as string;
          } else if (exposureField === "type") {
            const newType = value as string;
            newSecrets[index].exposures[secondaryIndex].type = newType;
            newSecrets[index].exposures[secondaryIndex].value = "";
            if (
              newType === "envVar" &&
              newSecrets[index].exposures[secondaryIndex].mounts
            ) {
              delete newSecrets[index].exposures[secondaryIndex].mounts;
            }
            if (
              newType === "file" &&
              !newSecrets[index].exposures[secondaryIndex].mounts
            ) {
              newSecrets[index].exposures[secondaryIndex].mounts = [];
            }
          } else if (exposureField === "mounts") {
            const mountsIndex: number | null =
              path.length > 5 ? (path[5] as number) : null;
            if (mountsIndex != null) {
              const exposure = newSecrets[index].exposures[secondaryIndex];
              // initialize the mounts array if it doesn't exist on the exposure
              if (!exposure.mounts) {
                exposure.mounts = [];
              }
              // initialize empty mount values up to the index we're setting
              if (mountsIndex >= exposure.mounts.length) {
                for (let i = exposure.mounts.length; i <= mountsIndex; i++) {
                  exposure.mounts[i] = "";
                }
              }
              exposure.mounts[mountsIndex] = value as string;
            }
          }
        }
      }
      break;
  }
  return newSecrets;
}
/**
 * JSONSingleContainerReducer - generates JSON fragment of a `secrets` field of a definition
 *
 * Secret declaration is split between `env`, `secrets` & `container.volumes` fields
 * Secrets.JSONReducer can return only `secrets` part
 * `env` part of a secret will be generated by
 * EnvironmentVariables.JSONReducer
 * `container.volumes` part of a secret will be generated by
 * Volumes.JSONSingleContainerReducer
 *
 * @param  {Object} state current state of `secrets` field
 * @param  {Object} transaction
 * @param  {String} transaction.type
 * @param  {String[]} transaction.path
 * @param  {*} transaction.value
 * @return {Object} new state for the `secrets` field
 */
function JSONSingleContainerReducer(
  this: SingleContainerReducerContext,
  state: object,
  { type, path, value }: Transaction
): Record<string, ServiceSecret> | object {
  if (path == null) {
    return state;
  }

  if (this.secrets == null) {
    this.secrets = [];
  }

  const base: string = path[0] as string;
  if (base === "secrets") {
    this.secrets = processSecretTransaction(this.secrets, {
      type,
      path,
      value
    });
  }

  const result: Record<string, ServiceSecret> = {};

  return this.secrets.reduce((memo, item, index) => {
    const key = item.key || `secret${index}`;

    if (key != null && item.value != null) {
      memo[key] = { source: item.value };
    }

    return memo;
  }, result);
}

function JSONSingleContainerParser(
  state: SingleContainerServiceJSON
): Transaction[] {
  if (state.secrets == null) {
    return [];
  }

  const secretsState = state.secrets;
  const env = state.env || state.environment;
  const volumes =
    state.container &&
    state.container.volumes &&
    Array.isArray(state.container.volumes)
      ? state.container.volumes.filter(vol => vol.secret)
      : [];

  const result: Transaction[] = [];
  // Secrets are two folds and one can not exist without another:
  // 1. Special format Env variable
  // 2. Secret declaration
  return Object.keys(secretsState).reduce((memo, key, index) => {
    const emptySecret = emptySingleContainerSecret();
    const source = secretsState[key].source;

    memo.push(new Transaction(["secrets"], emptySecret, ADD_ITEM));
    memo.push(new Transaction(["secrets", index, "key"], key, SET));
    memo.push(new Transaction(["secrets", index, "value"], source, SET));

    if (env) {
      // Search for the secrets name in env variables
      const environmentVars = Object.keys(env).filter(name => {
        const envVar = env[name];

        return typeof envVar === "object" && envVar.secret === key;
      });

      environmentVars.forEach(name => {
        memo.push(
          new Transaction(
            ["secrets", index, "exposures"],
            { type: "envVar", value: name },
            ADD_ITEM
          )
        );
      });
    }
    if (volumes.length > 0) {
      const files = volumes
        .filter(vol => vol.secret === key)
        .map(vol => vol.containerPath);

      files.forEach(path => {
        memo.push(
          new Transaction(
            ["secrets", index, "exposures"],
            { type: "file", value: path },
            ADD_ITEM
          )
        );
      });
    }

    return memo;
  }, result);
}

function FormSingleContainerReducer(
  state: SingleContainerSecretContext[] = [],
  { type, path, value }: Transaction
): SingleContainerSecretContext[] {
  if (path == null) {
    return state;
  }

  return processSecretTransaction(state, {
    type,
    path,
    value
  });
}

/**
 * JSONMultiContainerReducer - generates JSON fragment of a `secrets` field of a definition
 *
 * Secret declaration is split between `env` and `secrets` fields
 * Secrets.JSONReducer can return only `secrets` part
 * `env` part of a secret will be generated by
 * EnvironmentVariables.JSONReducer
 *
 * @param  {Object} state current state of `secrets` field
 * @param  {Object} transaction
 * @param  {String} transaction.type
 * @param  {String[]} transaction.path
 * @param  {*} transaction.value
 * @return {Object} new state for the `secrets` field
 */
function JSONMultiContainerReducer(
  this: MultiContainerReducerContext,
  state: object,
  { type, path, value }: Transaction
): Record<string, ServiceSecret> | object {
  if (path == null) {
    return state;
  }

  if (this.secrets == null) {
    this.secrets = [];
  }

  const base: string = path[0] as string;
  if (base === "secrets") {
    this.secrets = processPodSecretTransaction(this.secrets, {
      type,
      path,
      value
    });
  }

  const result: Record<string, ServiceSecret> = {};
  return this.secrets.reduce((memo, item, index) => {
    const key = item.key || `secret${index}`;

    if (key != null && item.value != null) {
      memo[key] = { source: item.value };
    }

    return memo;
  }, result);
}

function JSONMultiContainerParser(
  state: MultiContainerServiceJSON
): Transaction[] {
  if (state.secrets == null) {
    return [];
  }

  const env = state.env || state.environment;
  const volumes =
    (state.volumes && state.volumes.filter(vol => vol.secret && vol.name)) ||
    [];
  const volumeMap: Record<string, MultiContainerVolume> = {};
  volumes.forEach(vol => {
    if (!vol.name) {
      return;
    }
    volumeMap[vol.name] = vol;
  });
  let containerVolumeMounts: Array<{
    index: number;
    mountPath: string;
    volumeName: string;
  }> = [];
  let numContainers = 0;
  if (state.containers && state.containers.length > 0) {
    numContainers = state.containers.length;
    containerVolumeMounts = state.containers.reduce(
      (mounts, container, containerIndex) => {
        if (!container.volumeMounts) {
          return mounts;
        }
        container.volumeMounts.forEach(mount => {
          if (mount.name && mount.name in volumeMap) {
            mounts.push({
              index: containerIndex,
              mountPath: mount.mountPath || "",
              volumeName: mount.name || ""
            });
          }
        });
        return mounts;
      },
      containerVolumeMounts
    );
  }

  let result: Transaction[] = [];
  result = Object.keys(state.secrets).reduce((memo, key, index) => {
    const emptySecret = emptyMultiContainerSecret();
    // @ts-ignore
    const source = state.secrets[key].source;

    memo.push(new Transaction(["secrets"], emptySecret, ADD_ITEM));
    memo.push(new Transaction(["secrets", index, "key"], key, SET));
    memo.push(new Transaction(["secrets", index, "value"], source, SET));

    if (env) {
      // Search for the secrets name in env variables
      const environmentVars = Object.keys(env).filter(name => {
        const envVar = env[name];

        return typeof envVar === "object" && envVar.secret === key;
      });

      environmentVars.forEach(name => {
        memo.push(
          new Transaction(
            ["secrets", index, "exposures"],
            { type: "envVar", value: name },
            ADD_ITEM
          )
        );
      });
    }

    if (volumes) {
      const secretVolumes = volumes.filter(vol => vol.secret === key);
      secretVolumes.forEach(volume => {
        const volumeExposure: MultiContainerSecretExposure = {
          type: "file",
          value: volume.name || defaultSecretVolumeKey(key, index),
          mounts: []
        };
        for (let i = 0; i < numContainers; i++) {
          // @ts-ignore
          volumeExposure.mounts.push("");
        }
        containerVolumeMounts.forEach(mount => {
          if (mount.volumeName === volumeExposure.value) {
            // @ts-ignore
            volumeExposure.mounts[mount.index] = mount.mountPath;
          }
        });
        memo.push(
          new Transaction(
            ["secrets", index, "exposures"],
            volumeExposure,
            ADD_ITEM
          )
        );
      });
    }

    return memo;
  }, result);

  return result;
}

function FormMultiContainerReducer(
  state: MultiContainerSecretContext[] = [],
  { type, path, value }: Transaction
): MultiContainerSecretContext[] {
  if (path == null) {
    return state;
  }

  const base: string = path[0] as string;

  if (base === "secrets") {
    return processPodSecretTransaction(state, {
      type,
      path,
      value
    });
  }

  return state;
}

function removeSecretVolumes(
  parserState: MultiContainerServiceJSON
): MultiContainerServiceJSON {
  if (
    !parserState.volumes ||
    !parserState.volumes.find(volume => volume.secret != null)
  ) {
    return parserState;
  }
  // make a copy of the state so we can sanitize it
  const sanitizedState = deepCopy(parserState) as MultiContainerServiceJSON;
  // @ts-ignore
  const secretVolumeNames: string[] = sanitizedState.volumes
    .filter(volume => volume.secret && volume.name)
    .map(volume => volume.name);
  // Remove secret volumes from state
  // @ts-ignore
  sanitizedState.volumes = sanitizedState.volumes.filter(
    volume => !volume.secret
  );
  // Remove volumeMounts for secret volumes
  if (sanitizedState.containers) {
    sanitizedState.containers = sanitizedState.containers.map(container => {
      if (!container.volumeMounts) {
        return container;
      }
      container.volumeMounts = container.volumeMounts.filter(
        mount => !secretVolumeNames.includes(mount.name)
      );

      return container;
    });
  }

  return sanitizedState;
}

export {
  processSecretTransaction,
  processPodSecretTransaction,
  emptySingleContainerSecret,
  emptyMultiContainerSecret,
  defaultSecretVolumeKey,
  removeSecretVolumes,
  JSONSingleContainerReducer,
  JSONSingleContainerParser,
  FormSingleContainerReducer,
  JSONMultiContainerReducer,
  JSONMultiContainerParser,
  FormMultiContainerReducer
};
