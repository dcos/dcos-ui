export interface JobFormData {
  id: string;
  description?: string;
  labels?: JobLabels;
  run: JobRun;
}

export type ConcurrentPolicyOptions = "ALLOW" | "FORBID";

export interface JobSchedule {
  id: string;
  cron: string;
  timezone?: string;
  startingDeadlineSeconds?: number;
  concurrentPolicy?: ConcurrentPolicyOptions;
  enabled?: boolean;
}

export interface JobFormUIData {
  cmdOnly: boolean;
  container?: "ucr" | "docker" | null;
  job: JobFormData;
  schedule?: JobSchedule;
}

export interface JobLabels {
  [key: string]: string;
}

export interface JobRun {
  args?: string[];
  artifacts?: JobArtifact[];
  cmd?: string;
  cpus: number;
  gpus?: number;
  disk: number;
  ucr?: UcrContainer;
  docker?: DockerContainer;
  env?: JobEnv;
  maxLaunchDelay?: number;
  mem: number;
  placement?: JobPlacement;
  user?: string;
  taskKillGracePeriodSeconds?: number;
  restart?: JobRestart;
  volumes?: Array<JobVolume | SecretVolume>;
  secrets?: {
    [key: string]: FileBasedSecret;
  };
}

export interface JobArtifact {
  uri: string;
  executable?: boolean;
  extract?: boolean;
  cache?: boolean;
}

export interface UcrContainer {
  image: UcrImage;
  privileged?: boolean;
}

export interface UcrImage {
  id: string;
  kind?: "docker" | "appc";
  forcePull?: boolean;
}

export interface DockerContainer {
  image: string;
  forcePullImage?: boolean;
  privileged?: boolean;
  parameters?: DockerParameter[];
}

export interface DockerParameter {
  key: string;
  value: string;
}

export interface JobEnv {
  [key: string]: string | EnvBasedSecret;
}

export interface EnvBasedSecret {
  secret: string;
}

export interface JobPlacement {
  constraints: PlacementConstraint[];
}

export interface PlacementConstraint {
  attribute: string;
  operator: "EQ" | "LIKE" | "UNLIKE";
  value?: string;
}

export type RestartPolicyOptions = "NEVER" | "ON_FAILURE";

export interface JobRestart {
  policy: RestartPolicyOptions;
  activeDeadlineSeconds?: number;
}

export interface JobVolume {
  containerPath: string;
  hostPath: string;
  mode?: "RO" | "RW";
}

export interface SecretVolume {
  containerPath: string;
  secret: string;
}

export interface FileBasedSecret {
  source: string;
}

export interface FormError {
  message: string;
  path: string[];
  isPermissive?: boolean;
}
