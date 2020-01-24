import { i18nMark } from "@lingui/react";
import {
  SingleContainerServiceJSON,
  SingleContainerSecretVolume,
  EnvironmentSecret,
  MultiContainerServiceJSON,
  MultiContainerSecretVolume
} from "../reducers/types";

interface ServiceError {
  path: Array<string | number>;
  message: string;
  type: string;
  variables?: Record<string, any>;
}

const secretPathInvalidCharacters = /[\0<>|:&]/;
const secretPathParentDirReference = /(\.\.)/;

function isRelativeFilePath(path: string) {
  return !(
    path[0] === "/" ||
    path[path.length - 1] === "/" ||
    path[0] === "\\" ||
    path[path.length - 1] === "\\"
  );
}

export default {
  validSecretContainerPath(path: string): boolean {
    if (path == null || path.length === 0) {
      return false;
    }
    if (!isRelativeFilePath(path)) {
      return false;
    }
    if (
      secretPathParentDirReference.test(path) ||
      secretPathInvalidCharacters.test(path)
    ) {
      return false;
    }

    return true;
  },
  envMustHaveSecretPart(app: SingleContainerServiceJSON): ServiceError[] {
    let env: Record<string, EnvironmentSecret>;
    if (app.env) {
      env = app.env;
    } else if (app.environment) {
      env = app.environment;
    } else {
      return [];
    }

    const secrets = Object.keys(app.secrets || {});

    return Object.keys(env)
      .filter(key => {
        return typeof env[key] === "object";
      })
      .reduce((memo, key) => {
        const hasSecret = secrets.includes(env[key].secret);

        if (!hasSecret) {
          memo.push({
            path: ["secrets", env[key].secret],
            message: i18nMark("The secret cannot be empty"),
            type: "SECRET_MISSING"
          });
        }

        return memo;
      }, [] as ServiceError[]);
  },
  appVolumeMustHaveSecretPart(app: SingleContainerServiceJSON): ServiceError[] {
    if (
      !app.container ||
      !app.container.volumes ||
      app.container.volumes.length === 0
    ) {
      return [];
    }
    const secretVolumes: SingleContainerSecretVolume[] = app.container.volumes.filter(
      vol => vol.secret
    ) as SingleContainerSecretVolume[];
    if (secretVolumes.length === 0) {
      return [];
    }
    const secrets = Object.keys(app.secrets || {});

    return secretVolumes
      .filter(vol => !secrets.includes(vol.secret))
      .map(vol => ({
        path: ["secrets", vol.secret],
        type: "SECRET_MISSING",
        message: i18nMark("The secret cannot be empty")
      }));
  },
  appSecretVolumesSupported(app: SingleContainerServiceJSON): ServiceError[] {
    const errors: ServiceError[] = [];
    if (
      !app.container ||
      app.container.type === "MESOS" ||
      !app.container.volumes ||
      app.container.volumes.length === 0
    ) {
      return errors;
    }
    app.container.volumes.forEach((volume, index) => {
      if (volume.secret) {
        errors.push({
          path: ["container", "volumes", index, "secret"],
          type: "NOT_SUPPORTED",
          message: i18nMark(
            "Secret volumes are not supported when using Docker Engine Container Runtime"
          )
        });
      }
    });
    return errors;
  },
  podVolumeMustHaveSecretPart(pod: MultiContainerServiceJSON): ServiceError[] {
    if (!pod.volumes || pod.volumes.length === 0) {
      return [];
    }
    const secretVolumes = pod.volumes.filter(
      vol => vol.secret
    ) as MultiContainerSecretVolume[];
    const secrets = Object.keys(pod.secrets || {});

    return secretVolumes
      .filter(vol => !secrets.includes(vol.secret))
      .map(vol => ({
        path: ["secrets", vol.secret],
        type: "SECRET_MISSING",
        message: i18nMark("The secret cannot be empty")
      }));
  }
};
