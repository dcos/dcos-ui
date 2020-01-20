export interface SingleContainerSecretExposure {
  type: string;
  value: string;
}

export interface SingleContainerSecretContext {
  key: string | null;
  value: string | null;
  exposures: SingleContainerSecretExposure[];
}

export interface ContainerInputReducerContext {
  type?: "MESOS" | "DOCKER";
  volumes: unknown[];
}

export interface SingleContainerReducerContext {
  container?: ContainerInputReducerContext;
  secrets?: SingleContainerSecretContext[];
}

export interface ServiceSecret {
  source: string;
}

export interface EnvironmentSecret {
  secret: string;
}

export interface Volume {
  persistent?: {
    size: number;
    profileName?: string;
  };
  external?: unknown;
  hostPath?: unknown;
  mode?: string;
  containerPath?: string;
  secret?: string;
}

export interface SingleContainerSecretVolume {
  containerPath: string;
  secret: string;
}

export interface ContainerDefinition {
  type: "MESOS" | "DOCKER";
  volumes?: Volume[];
}

export interface SingleContainerServiceJSON {
  container?: ContainerDefinition;
  env?: Record<string, EnvironmentSecret>;
  environment?: Record<string, EnvironmentSecret>;
  secrets?: Record<string, ServiceSecret>;
}

export interface MultiContainerSecretExposure {
  type: string;
  value: string;
  mounts?: string[];
}

export interface MultiContainerSecretContext {
  key: string | null;
  value: string | null;
  exposures: MultiContainerSecretExposure[];
}

export interface PodContainerVolumeMountContext {
  name: string;
  mountPath: string[];
}

export interface MultiContainerReducerContext {
  secrets?: MultiContainerSecretContext[];
  secretVolumeMounts?: MultiContainerVolumeMount[][];
  volumeMounts?: PodContainerVolumeMountContext[];
}

export interface MultiContainerVolume {
  name?: string;
  secret?: string;
}

export interface MultiContainerSecretVolume {
  name: string;
  secret: string;
}

export interface MultiContainerVolumeMount {
  name: string;
  mountPath: string;
}

export interface PodContainer {
  name: string;
  type?: string;
  volumeMounts?: MultiContainerVolumeMount[];
}

export interface MultiContainerServiceJSON {
  containers?: PodContainer[];
  env?: Record<string, EnvironmentSecret>;
  environment?: Record<string, EnvironmentSecret>;
  secrets?: Record<string, ServiceSecret>;
  volumes?: MultiContainerVolume[];
}
