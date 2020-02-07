import * as React from "react";

import ConfigurationMap from "#SRC/js/components/ConfigurationMap";

import ServiceConfigSecretsExposedAsEnvironmentVariable, {
  SecretEnvExposure
} from "./ServiceConfigSecretsExposedAsEnvironmentVariable";

import PodConfigSecretsExposedAsFile, {
  SecretPodFileExposure,
  SecretContainerFileExposure
} from "./PodConfigSecretsExposedAsFile";

interface Props {
  appConfig: any;
  onEditClick: () => void;
}

interface Volume {
  name: string;
  secret?: string;
}

interface VolumeMount {
  name: string;
  mountPath?: string;
}

interface Container {
  name: string;
  volumeMounts?: VolumeMount[];
}

function getEnvExposures(appConfig: any): SecretEnvExposure[] {
  return Object.keys(appConfig.environment || {}).reduce(
    (acc: SecretEnvExposure[], envName: string) => {
      const key = appConfig.environment[envName].secret;
      if (key && appConfig.secrets[key]) {
        const existing = acc.find(
          exp => exp.secretPath === appConfig.secrets[key].source
        );
        if (existing) {
          existing.exposures.push(envName);
        } else {
          acc.push({
            secretPath: appConfig.secrets[key].source,
            exposures: [envName]
          });
        }
      }
      return acc;
    },
    []
  );
}

function isFileSecret(appConfig: any, secretKey: string) {
  return (
    appConfig.volumes &&
    appConfig.volumes.some((v: Volume) => v.secret === secretKey)
  );
}

function containerFilePaths(appConfig: any, secretKey: string) {
  return (appConfig.containers || []).reduce(
    (acc: SecretContainerFileExposure[], container: Container) => {
      const secretVolume = appConfig.volumes.find(
        (v: Volume) => v.secret === secretKey
      );

      if (secretVolume.name && container.volumeMounts) {
        const secretMount = container.volumeMounts.find(
          (v: VolumeMount) => v.name === secretVolume.name
        );
        if (secretMount) {
          acc.push({
            containerName: container.name,
            containerPath: secretMount.mountPath as string
          });
        }
      }

      return acc;
    },
    []
  );
}

function getFileExposures(appConfig: any): SecretPodFileExposure[] {
  return Object.keys(appConfig.secrets || {}).reduce(
    (acc: SecretPodFileExposure[], key) => {
      if (!isFileSecret(appConfig, key)) {
        return acc;
      }

      acc.push({
        secretPath: appConfig.secrets[key].source,
        containers: containerFilePaths(appConfig, key)
      });
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

      <PodConfigSecretsExposedAsFile
        secretExposures={getFileExposures(props.appConfig)}
        onEditClick={props.onEditClick}
      />
    </ConfigurationMap>
  );
}

export { ServiceConfigSecretsSectionDisplay as default };
