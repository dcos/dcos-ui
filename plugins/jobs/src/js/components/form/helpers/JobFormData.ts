export interface Job<Labels, Env, Secrets> {
  id: string;
  description?: string;
  labels?: Labels;
  run: JobRun<Env, Secrets>;
}

export interface JobRun<Env, Secrets> {
  args?: string[];
  artifacts?: JobArtifact[];
  cmd?: string;
  cpus: number;
  gpus?: number;
  disk: number;
  ucr?: UcrContainer;
  docker?: DockerContainer;
  env?: Env;
  maxLaunchDelay?: number;
  mem: number;
  placement?: JobPlacement;
  user?: string;
  taskKillGracePeriodSeconds?: number;
  restart?: JobRestart;
  activeDeadlineSeconds?: number;
  volumes?: Array<JobVolume | SecretVolume>;
  secrets?: Secrets;
}

export type JobSpecData = Job<ArrayLabels, EnvModel, SecretModel>;

export type JobOutputData = Job<JobLabels, JobEnv, JobSecrets>;

export interface JobOutput {
  job: JobOutputData;
  schedule?: JobSchedule;
}

export enum ConcurrentPolicy {
  Allow = "ALLOW",
  Forbid = "FORBID"
}

export interface JobSchedule {
  id: string;
  cron: string;
  timezone?: string;
  startingDeadlineSeconds?: number;
  concurrencyPolicy?: ConcurrentPolicy;
  enabled?: boolean;
}

export enum Container {
  Docker = "docker",
  UCR = "ucr"
}

export interface JobSpec {
  cmdOnly: boolean;
  container?: Container | null;
  job: JobSpecData;
  schedule?: JobSchedule;
}

export type EnvModel = Array<[string, string]>;
export type SecretModel = Array<[string, string, string]>;

export interface JobSecretExposure {
  exposureType: "" | "env" | "file";
  exposureValue: string;
  key: string;
  secretPath: string;
}

export interface FormOutput {
  jobId: string;
  description?: string;
  cmdOnly: boolean;
  cmd?: string;
  container?: Container | null;
  containerImage?: string;
  imageForcePull?: boolean;
  grantRuntimePrivileges?: boolean;
  cpus: number;
  gpus?: number;
  mem: number;
  disk: number;
  dockerParams: DockerParameter[];
  args: string[];
  scheduleEnabled?: boolean;
  scheduleId?: string;
  cronSchedule?: string;
  timezone?: string;
  startingDeadline?: number;
  concurrencyPolicy?: ConcurrentPolicy;
  maxLaunchDelay?: number;
  killGracePeriod?: number;
  user?: string;
  restartPolicy?: RestartPolicy;
  retryTime?: number;
  labels?: ArrayLabels;
  env: EnvModel;
  secrets?: JobSecretExposure[];
  artifacts?: JobArtifact[];
}

// Labels used internally to track form state
export type ArrayLabels = Array<[string, string]>;

// Labels in the form expected by the API
export interface JobLabels {
  [key: string]: string;
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

export enum UcrImageKind {
  Docker = "docker",
  Appc = "appc"
}

export interface UcrImage {
  id: string;
  kind?: UcrImageKind;
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

export enum ConstraintOperator {
  Eq = "EQ",
  Like = "LIKE",
  Unlike = "UNLIKE"
}
export interface PlacementConstraint {
  attribute: string;
  operator: ConstraintOperator;
  value?: string;
}

export enum RestartPolicy {
  Never = "NEVER",
  OnFailure = "ON_FAILURE"
}

export interface JobRestart {
  policy: RestartPolicy;
  activeDeadlineSeconds?: number;
}

export enum VolumeMode {
  RO = "RO",
  RW = "RW"
}

export interface JobVolume {
  containerPath: string;
  hostPath: string;
  mode?: VolumeMode;
}

export interface SecretVolume {
  containerPath: string;
  secret: string;
}

export interface FileBasedSecret {
  source: string;
}

export interface JobSecrets {
  [key: string]: FileBasedSecret;
}

export interface FormError {
  message: string;
  path: string[];
  isPermissive?: boolean;
}

export enum JobFormActionType {
  Set = "SET",
  SetNum = "SET_NUM",
  SetBool = "SET_BOOL",
  Override = "OVERRIDE",
  AddArrayItem = "ADD_ARRAY_ITEM",
  RemoveArrayItem = "REMOVE_ARRAY_ITEM"
}

export interface Action {
  path: string;
  type: JobFormActionType;
  value: any;
}
