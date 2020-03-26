import * as React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import Util from "#SRC/js/utils/Util";

import ServiceConfigSecretsExposedAsEnvironmentVariable, {
  SecretEnvExposure,
} from "./ServiceConfigSecretsExposedAsEnvironmentVariable";

import ServiceConfigSecretsExposedAsFile, {
  SecretFileExposure,
} from "./ServiceConfigSecretsExposedAsFile";

interface Props {
  appConfig: any;
  onEditClick: () => void;
}

function getEnvExposures(appConfig: any): SecretEnvExposure[] {
  return Object.keys(appConfig.env || {}).reduce(
    (acc: SecretEnvExposure[], envName: string) => {
      const key = appConfig.env[envName].secret;
      if (key && appConfig.secrets[key]) {
        const existing = acc.find(
          (exp) => exp.secretPath === appConfig.secrets[key].source
        );
        if (existing) {
          existing.exposures.push(envName);
        } else {
          acc.push({
            secretPath: appConfig.secrets[key].source,
            exposures: [envName],
          });
        }
      }
      return acc;
    },
    []
  );
}

interface SecretVolume {
  containerPath: string;
  secret: string;
}

function secretContainerVolumes(container: any): SecretVolume[] {
  return (Util.findNestedPropertyInObject(container, "volumes") || []).filter(
    (v: any) => v.secret
  );
}

function getFileExposures(appConfig: any): SecretFileExposure[] {
  return secretContainerVolumes(appConfig.container).reduce(
    (acc: SecretFileExposure[], volume: SecretVolume) => {
      if (appConfig.secrets && appConfig.secrets[volume.secret]) {
        const secretPath = appConfig.secrets[volume.secret].source;
        const existing = acc.find((exp) => exp.secretPath === secretPath);

        if (existing) {
          existing.paths.push(volume.containerPath);
        } else {
          acc.push({
            secretPath,
            paths: [volume.containerPath],
          });
        }
      }

      return acc;
    },
    []
  );
}

function ServiceConfigSecretsSectionDisplay(props: Props) {
  return (
    <ConfigurationMap>
      <ServiceConfigSecretsExposedAsEnvironmentVariable
        secretExposures={getEnvExposures(props.appConfig)}
        onEditClick={props.onEditClick}
      />

      <ServiceConfigSecretsExposedAsFile
        secretExposures={getFileExposures(props.appConfig)}
        onEditClick={props.onEditClick}
      />
    </ConfigurationMap>
  );
}

export { ServiceConfigSecretsSectionDisplay as default };
