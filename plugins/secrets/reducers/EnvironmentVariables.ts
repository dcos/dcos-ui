import Transaction from "#SRC/js/structs/Transaction";
import {
  processSecretTransaction,
  processPodSecretTransaction,
} from "./Secrets";
import {
  EnvironmentSecret,
  MultiContainerReducerContext,
  SingleContainerReducerContext,
} from "./types";

export default {
  JSONReducer(
    this: SingleContainerReducerContext,
    state: object,
    { type, path, value }: Transaction
  ): Record<string, EnvironmentSecret> | object {
    if (path == null) {
      return state;
    }
    if (this.secrets == null) {
      this.secrets = [];
    }

    this.secrets = processSecretTransaction(this.secrets, {
      type,
      path,
      value,
    });

    const result: Record<string, EnvironmentSecret> = {};

    return this.secrets.reduce((memo, item, index) => {
      const key = item.key || `secret${index}`;

      if (Array.isArray(item.exposures) && key != null) {
        item.exposures
          .filter((exposure) => exposure.type === "envVar")
          .map((exposure) => exposure.value)
          .filter((envVar: string) => envVar != null && envVar.length > 0)
          .forEach((envVar: string) => {
            memo[envVar] = { secret: key };
          });
      }

      return memo;
    }, result);
  },
  MultiContainerJSONReducer(
    this: MultiContainerReducerContext,
    state: object,
    { type, path, value }: Transaction
  ): Record<string, EnvironmentSecret> | object {
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

    const result: Record<string, EnvironmentSecret> = {};

    return this.secrets.reduce((memo, item, index) => {
      const key = item.key || `secret${index}`;

      if (Array.isArray(item.exposures) && key != null) {
        item.exposures
          .filter((exposure) => exposure.type === "envVar")
          .map((exposure) => exposure.value)
          .filter((envVar: string) => envVar != null && envVar.length > 0)
          .forEach((envVar: string) => {
            memo[envVar] = { secret: key };
          });
      }

      return memo;
    }, result);
  },
};
