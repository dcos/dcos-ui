import { i18nMark } from "@lingui/react";

import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import {
  JobOutput,
  FormError,
  JobSpec,
  SecretVolume,
  EnvModel,
  JobSecretExposure,
  JobVolume
} from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

import { isSecretVolume } from "../reducers/JobSecrets";

import SecretsValidators from "./SecretsValidators";

type EnvSecrets = Array<[string, { secret: string }]>;
type Secrets = Array<[string, { source: string }]>;
type SecretMap = { [key: string]: { env: number; volumes: number } };
type SecretIndexMap = { [key: string]: { env?: number[]; secrets?: number[] } };

export const JobSecretsValidators = {
  // If a secret is given a environment variable name in the form, it must have an associated secret
  envHasMatchingSecret(formData: JobOutput): FormError[] {
    const errors: FormError[] = [];
    const env = findNestedPropertyInObject(formData, "run.env");
    if (env) {
      const envSecrets = (Object.entries(env) as EnvSecrets).filter(
        e => typeof e[1] === "object" && e[1].secret
      );
      const secrets: { [key: string]: string } = (Object.entries(
        findNestedPropertyInObject(formData, "run.secrets") || {}
      ) as Secrets).reduce(
        (acc, [secretKey, { source }]) => ({ ...acc, [secretKey]: source }),
        {}
      );
      envSecrets.forEach(([_, { secret }]) => {
        if (secrets[secret] == null || secrets[secret] === "") {
          errors.push({
            path: ["run", "secrets", secret],
            message: i18nMark("The secret cannot be empty")
          });
        }
      });
    }
    return errors;
  },

  // If a file based secret is given a container path in the form, it must have an associated secret
  volumeHasMatchingSecret(formData: JobOutput): FormError[] {
    const errors: FormError[] = [];
    const volumes = findNestedPropertyInObject(formData, "run.volumes");
    if (volumes && Array.isArray(volumes)) {
      const secretVolumes = volumes.filter((volume: JobVolume) =>
        volume.hasOwnProperty("secret")
      );
      const secrets: { [key: string]: string } = (Object.entries(
        findNestedPropertyInObject(formData, "run.secrets") || {}
      ) as Secrets).reduce(
        (acc, [secretKey, { source }]) => ({ ...acc, [secretKey]: source }),
        {}
      );
      secretVolumes.forEach(({ secret }: SecretVolume) => {
        if (secrets[secret] == null || secrets[secret] === "") {
          errors.push({
            path: ["run", "secrets", secret],
            message: i18nMark("The secret cannot be empty")
          });
        }
      });
    }
    return errors;
  },

  // Any secret added to the `secrets` object MUST be provided as an environment variable or file
  namedSecretsAreProvided(formData: JobOutput): FormError[] {
    const errors: FormError[] = [];
    const env = findNestedPropertyInObject(formData, "run.env") || {};
    const secrets = findNestedPropertyInObject(formData, "run.secrets");
    const volumes: SecretVolume[] =
      findNestedPropertyInObject(formData, "run.volumes") || [];
    if (secrets) {
      const map: SecretMap = {};
      Object.keys(secrets).forEach(secret => {
        map[secret] = {
          env: 0,
          volumes: 0
        };
      });
      (Object.entries(env) as EnvSecrets)
        .filter(e => typeof e[1] === "object" && e[1].secret)
        .forEach(([_, { secret }]) => {
          if (map[secret] != null) {
            map[secret].env++;
          }
        });
      volumes
        .filter(({ secret }) => secret != null && secret !== "")
        .forEach(({ secret }) => {
          if (map[secret] != null) {
            map[secret].volumes++;
          }
        });
      Object.keys(map).forEach(secret => {
        if (!map[secret].env && !map[secret].volumes) {
          errors.push({
            path: ["run", "secrets", `${secret}`],
            message: i18nMark(
              "Secret must be provided as an environment variable or file"
            )
          });
        }
      });
    }
    return errors;
  },

  envSecretsAreStrings(formData: JobOutput): FormError[] {
    const errors: FormError[] = [];
    const env = findNestedPropertyInObject(formData, "run.env");
    if (env) {
      Object.keys(env).forEach(key => {
        if (
          typeof env[key] === "object" &&
          (!env[key].secret || typeof env[key].secret !== "string")
        ) {
          errors.push({
            path: ["run", "env", key],
            message: i18nMark("Secret must be a non-empty string")
          });
        }
      });
    }
    return errors;
  },

  fileSecretsHaveValidPaths(formData: JobOutput): FormError[] {
    const errors: FormError[] = [];
    const volumes = findNestedPropertyInObject(formData, "run.volumes");

    if (volumes) {
      volumes.filter(isSecretVolume).forEach((volume: SecretVolume) => {
        if (volume.containerPath && volume.containerPath.length > 0) {
          // Test value
          if (
            !SecretsValidators.validSecretContainerPath(volume.containerPath)
          ) {
            errors.push({
              path: ["run", "secrets", volume.secret, "file"],
              message: i18nMark("Invalid path.")
            });
          }
        }
      });
    }

    return errors;
  }
};

export function JobSpecValidator(errors: FormError[], jobSpec: JobSpec) {
  const secretErrors: FormError[] = [];
  const env: EnvModel =
    findNestedPropertyInObject(jobSpec, "job.run.env") || [];
  const secrets: JobSecretExposure[] = findNestedPropertyInObject(
    jobSpec,
    "job.run.secrets"
  );

  if (secrets) {
    const map: SecretIndexMap = {};
    env.forEach(([key], index) => {
      if (!map[key]) {
        map[key] = { env: [] };
      }
      if (!map[key].env) {
        map[key].env = [];
      }
      (map[key].env as number[]).push(index);
    });
    secrets.forEach(({ exposureValue }, index) => {
      if (exposureValue) {
        if (!map[exposureValue]) {
          map[exposureValue] = { secrets: [] };
        }
        if (!map[exposureValue].secrets) {
          map[exposureValue].secrets = [];
        }
        (map[exposureValue].secrets as number[]).push(index);
      }
    });
    for (const key in map) {
      if (!map.hasOwnProperty(key)) {
        continue;
      }

      // Multiple secrets with same variable name
      if (map[key].secrets && (map[key].secrets as number[]).length > 1) {
        (map[key].secrets as number[]).forEach(i => {
          secretErrors.push({
            path: ["run", "secrets", `${i}`],
            message: i18nMark("Cannot have duplicate variable names")
          });
        });
      }
      // Secret names collide with environment variables
      if (
        map[key].secrets &&
        map[key].env &&
        (map[key].secrets as number[]).length &&
        (map[key].env as number[]).length
      ) {
        (map[key].secrets as number[]).forEach(i => {
          secretErrors.push({
            path: ["run", "secrets", `${i}`],
            message: i18nMark(
              "Variable name is already being used as an environment variable key"
            )
          });
        });
      }
    }
  }

  return errors.concat(secretErrors);
}
