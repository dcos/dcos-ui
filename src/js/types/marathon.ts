// Generated type definitions, please do not modify this file

export interface InstanceState {
  condition: Condition;
  since: Date;
  activeSince?: Date;
  healthy?: boolean;
  goal: Goal;
}
export interface Instance {
  instanceId: string;
  state: InstanceState;
  agentInfo?: AgentInfo;
  runSpecVersion: Date;
  unreachableStrategy: unknown; // TODO: implement unions;
}
export interface AgentInfo {
  host: string;
  agentId?: string;
  region?: string;
  zone?: string;
  attributes: AgentAttribute[];
}
export interface Status {
  stagedAt: Date;
  startedAt?: Date;
  mesosStatus?: string;
  condition: Condition;
  networkInfo: NetworkInfo;
}
export interface Task {
  appId: string;
  healthCheckResults?: Health[];
  checkResult?: CheckStatus;
  host: string;
  id: string;
  ipAddresses?: IpAddr[];
  ports?: number[];
  servicePorts?: number[];
  slaveId?: string;
  state: MesosTaskState;
  stagedAt?: string;
  startedAt?: string;
  version?: string;
  localVolumes?: LocalVolumeId[];
  region?: string;
  zone?: string;
}
export interface IpAddr {
  ipAddress: string;
  protocol: IpProtocol;
}
export interface NetworkInfo {
  hostName: string;
  hostPorts: number[];
  ipAddresses: NetworkInfoIPAddress[];
}
export interface TaskList {
  tasks: Task[];
}
export interface NetworkInfoIPAddress {
  ipAddress: string;
  protocol: IpProtocol;
}
export interface TaskSingle {
  task: Task;
}
export enum TaskStatusCondition {
  running = "running",
  staging = "staging"
}
export interface VersionInfo {
  lastScalingAt: Date;
  lastConfigChangeAt: Date;
}
export interface NetworkStatus {
  name?: string;
  addresses?: string[];
}
export interface ContainerEndpointStatus {
  name: string;
  allocatedHostPort?: number;
  healthy?: boolean;
}
export interface ContainerTerminationHistory {
  containerId: string;
  lastKnownState?: string;
  termination?: ContainerTerminationState;
}
export interface TerminationHistory {
  instanceID: string;
  startedAt: Date;
  terminatedAt: Date;
  message?: string;
  containers?: ContainerTerminationHistory[];
}
export interface StatusCondition {
  name: string;
  lastChanged: Date;
  lastUpdated: Date;
  value: string;
  reason?: string;
}
export interface PodStatus {
  id: string;
  spec: Pod;
  status: PodState;
  statusSince: Date;
  message?: string;
  instances?: PodInstanceStatus[];
  terminationHistory?: TerminationHistory[];
  lastUpdated: Date;
  lastChanged: Date;
}
export interface ContainerStatus {
  name: string;
  status: string;
  statusSince: Date;
  message?: string;
  conditions?: StatusCondition[];
  containerId?: string;
  endpoints?: ContainerEndpointStatus[];
  resources?: Resources;
  termination?: ContainerTerminationState;
  lastUpdated: Date;
  lastChanged: Date;
}
export enum PodState {
  DEGRADED = "DEGRADED",
  STABLE = "STABLE",
  TERMINAL = "TERMINAL"
}
export interface PodInstanceStatus {
  id: string;
  status: PodInstanceState;
  statusSince: Date;
  message?: string;
  conditions?: StatusCondition[];
  agentHostname?: string;
  agentId?: string;
  agentRegion?: string;
  agentZone?: string;
  resources?: Resources;
  networks?: NetworkStatus[];
  containers?: ContainerStatus[];
  specReference?: string;
  localVolumes?: LocalVolumeId[];
  lastUpdated: Date;
  lastChanged: Date;
}
export interface ContainerTerminationState {
  exitCode?: number;
  message?: string;
}
export enum PodInstanceState {
  PENDING = "PENDING",
  STAGING = "STAGING",
  STABLE = "STABLE",
  DEGRADED = "DEGRADED",
  TERMINAL = "TERMINAL"
}
export interface Resources {
  cpus: number;
  mem: number;
  disk?: number;
  gpus?: number;
}

export interface Pod {
  id: string;
  labels?: object;
  version?: Date;
  user?: string;
  environment?: object;
  containers: PodContainer[];
  secrets?: object;
  volumes?: unknown; // TODO: implement unions[];
  networks?: Network[];
  scaling?: PodScalingPolicy;
  scheduling?: PodSchedulingPolicy;
  executorResources?: ExecutorResources;
}
export interface Constraint {
  fieldName: string;
  operator: ConstraintOperator;
  value?: string;
}
export enum ConstraintOperator {
  UNIQUE = "UNIQUE",
  CLUSTER = "CLUSTER",
  GROUP_BY = "GROUP_BY",
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
  MAX_PER = "MAX_PER",
  IS = "IS"
}
export enum KillSelection {
  YOUNGEST_FIRST = "YOUNGEST_FIRST",
  OLDEST_FIRST = "OLDEST_FIRST"
}
export interface Health {
  alive: boolean;
  consecutiveFailures: number;
  firstSuccess?: string;
  instanceId: string;
  lastSuccess?: string;
  lastFailure?: string;
  lastFailureCause?: string;
}
export interface HealthCheck {
  http?: HttpCheck;
  tcp?: TcpCheck;
  exec?: CommandCheck;
  gracePeriodSeconds?: number;
  intervalSeconds?: number;
  maxConsecutiveFailures?: number;
  timeoutSeconds?: number;
  delaySeconds?: number;
}
export interface AppCommandCheck {
  value: string;
}
export enum AppHealthCheckProtocol {
  HTTP = "HTTP",
  HTTPS = "HTTPS",
  TCP = "TCP",
  COMMAND = "COMMAND",
  MESOS_TCP = "MESOS_TCP",
  MESOS_HTTP = "MESOS_HTTP",
  MESOS_HTTPS = "MESOS_HTTPS"
}
export interface AppHealthCheck {
  command?: AppCommandCheck;
  gracePeriodSeconds?: number;
  ignoreHttp1xx?: boolean;
  intervalSeconds?: number;
  maxConsecutiveFailures?: number;
  path?: string;
  port?: number;
  portIndex?: number;
  protocol?: AppHealthCheckProtocol;
  ipProtocol?: IpProtocol;
  timeoutSeconds?: number;
  delaySeconds?: number;
}
export interface CommandCheck {
  command: unknown; // TODO: implement unions;
}

export enum IpProtocol {
  IPv4 = "IPv4",
  IPv6 = "IPv6"
}
export interface DeploymentPlan {
  id: string;
  steps: DeploymentSteps;
  version: Date;
}
export interface DeploymentSteps {
  steps: DeploymentStep[];
}

export interface ExecutorResources {
  cpus?: number;
  mem?: number;
  disk?: number;
}
export interface SecretDef {
  source: string;
}
export interface DeploymentActionInfo {
  action: DeploymentActionName;
  app?: string;
  pod?: string;
  readinessCheckResults: TaskReadinessCheckResult[];
}
export interface DeploymentStepInfo {
  id: string;
  steps: DeploymentSteps;
  version: Date;
  affectedApps: string[];
  affectedPods: string[];
  currentActions: DeploymentActionInfo[];
  currentStep: number;
  totalSteps: number;
}
export interface ReadinessCheck {
  name?: string;
  protocol?: HttpScheme;
  path?: string;
  portName?: string;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  httpStatusCodesForReady?: number[];
  preserveLastResponse?: boolean;
}
export interface ReadinessCheckHttpResponse {
  status: number;
  contentType: string;
  body: string;
}
export interface TaskReadinessCheckResult {
  name: string;
  taskId: string;
  ready: boolean;
  lastResponse?: ReadinessCheckHttpResponse;
}
export enum HttpScheme {
  HTTP = "HTTP",
  HTTPS = "HTTPS"
}

export interface ErrorDetail {
  message?: string;
  errors?: string[];
}
export interface Error {
  message: string;
  details?: ErrorDetail[];
}
export interface LoggerChange {
  level: LoggerLevel;
  logger: string;
  durationSeconds?: number;
}
export enum LoggerLevel {
  trace = "trace",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error"
}

export interface DeleteTasks {
  ids: string[];
}
export interface DockerContainer {
  credential?: DockerCredentials;
  pullConfig?: DockerPullConfig;
  forcePullImage?: boolean;
  image: string;
  network?: DockerNetwork;
  parameters?: DockerParameter[];
  portMappings?: ContainerPortMapping[];
  privileged?: boolean;
}
export interface DockerCredentials {
  principal: string;
  secret?: string;
}
export interface AppCContainer {
  image: string;
  id?: string;
  labels?: object;
  forcePullImage?: boolean;
}
export interface Container {
  type: EngineType;
  docker?: DockerContainer;
  appc?: AppCContainer;
  volumes?: unknown; // TODO: implement unions[];
  portMappings?: ContainerPortMapping[];
}
export interface DockerParameter {
  key: string;
  value: string;
}
export enum DockerNetwork {
  BRIDGE = "BRIDGE",
  HOST = "HOST",
  NONE = "NONE",
  USER = "USER"
}
export enum EngineType {
  MESOS = "MESOS",
  DOCKER = "DOCKER"
}
export interface ContainerPortMapping {
  containerPort: number;
  hostPort?: number;
  labels?: object;
  name?: string;
  protocol?: NetworkProtocol;
  servicePort?: number;
  networkNames?: string[];
}
export enum NetworkProtocol {
  tcp = "tcp",
  udp = "udp",
  udp_tcp = "udp,tcp"
}

export interface DockerPullConfig {
  secret: string;
}

export interface UnreachableEnabled {
  inactiveAfterSeconds?: number;
  expungeAfterSeconds?: number;
}
export enum UnreachableDisabled {
  disabled = "disabled"
}
export enum Condition {
  Error = "Error",
  Failed = "Failed",
  Finished = "Finished",
  Killed = "Killed",
  Killing = "Killing",
  Running = "Running",
  Staging = "Staging",
  Starting = "Starting",
  Unreachable = "Unreachable",
  UnreachableInactive = "UnreachableInactive",
  Gone = "Gone",
  Dropped = "Dropped",
  Unknown = "Unknown"
}
export enum MesosTaskState {
  TASK_ERROR = "TASK_ERROR",
  TASK_FAILED = "TASK_FAILED",
  TASK_FINISHED = "TASK_FINISHED",
  TASK_KILLED = "TASK_KILLED",
  TASK_KILLING = "TASK_KILLING",
  TASK_RUNNING = "TASK_RUNNING",
  TASK_STAGING = "TASK_STAGING",
  TASK_STARTING = "TASK_STARTING",
  TASK_UNREACHABLE = "TASK_UNREACHABLE",
  TASK_GONE = "TASK_GONE",
  TASK_DROPPED = "TASK_DROPPED"
}
export interface Message {
  message: string;
}

export enum TaskLostBehavior {
  WAIT_FOREVER = "WAIT_FOREVER",
  RELAUNCH_AFTER_TIMEOUT = "RELAUNCH_AFTER_TIMEOUT"
}
export enum Goal {
  Running = "Running",
  Stopped = "Stopped",
  Decommissioned = "Decommissioned"
}
export enum ReadMode {
  RO = "RO",
  RW = "RW"
}

export interface App {
  id: string;
  acceptedResourceRoles?: string[];
  args?: string[];
  backoffFactor?: number;
  backoffSeconds?: number;
  cmd?: string;
  constraints?: string[][];
  container?: Container;
  cpus?: number;
  dependencies?: string[];
  disk?: number;
  env?: object;
  executor?: string;
  executorResources?: ExecutorResources;
  fetch?: Artifact[];
  healthChecks?: AppHealthCheck[];
  check?: AppCheck;
  instances?: number;
  labels?: object;
  maxLaunchDelaySeconds?: number;
  mem?: number;
  gpus?: number;
  ipAddress?: IpAddress;
  networks?: Network[];
  ports?: number[];
  portDefinitions?: PortDefinition[];
  readinessChecks?: ReadinessCheck[];
  residency?: AppResidency;
  requirePorts?: boolean;
  secrets?: object;
  taskKillGracePeriodSeconds?: number;
  upgradeStrategy?: UpgradeStrategy;
  uris?: string[];
  user?: string;
  version?: Date;
  versionInfo?: VersionInfo;
  killSelection?: KillSelection;
  unreachableStrategy?: unknown; // TODO: implement unions;
  tty?: boolean;
}
export interface AppResidency {
  relaunchEscalationTimeoutSeconds: number;
  taskLostBehavior: TaskLostBehavior;
}
export interface VersionList {
  versions: Date[];
}
export interface AppList {
  apps: App[];
}
export interface UpgradeStrategy {
  maximumOverCapacity: number;
  minimumHealthCapacity: number;
}

export interface IpAddress {
  discovery?: IpDiscovery;
  groups?: string[];
  labels?: object;
  networkName?: string;
}
export interface EnvVarSecret {
  secret: string;
}
export interface Lifecycle {
  killGracePeriodSeconds?: number;
}
export interface MesosExec {
  command: unknown; // TODO: implement unions;
  overrideEntrypoint?: boolean;
}
export interface Image {
  kind: ImageType;
  id: string;
  pullConfig?: DockerPullConfig;
  forcePull?: boolean;
  labels?: object;
}
export interface PodContainer {
  name: string;
  exec?: MesosExec;
  resources: Resources;
  endpoints?: Endpoint[];
  image?: Image;
  environment?: object;
  user?: string;
  healthCheck?: HealthCheck;
  check?: Check;
  volumeMounts?: VolumeMount[];
  artifacts?: Artifact[];
  labels?: object;
  lifecycle?: Lifecycle;
  tty?: boolean;
}
export enum ImageType {
  DOCKER = "DOCKER",
  APPC = "APPC"
}

export interface Check {
  http?: HttpCheck;
  tcp?: TcpCheck;
  exec?: CommandCheck;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  delaySeconds?: number;
}
export interface ApiPostEvent {
  clientIp: string;
  uri: string;
  appDefinition: App;
  eventType: string;
  timestamp: string;
}

export interface DeprecatedHistogram {
  count: number;
  min: number;
  max: number;
  p50: number;
  p75: number;
  p98: number;
  p99: number;
  p999: number;
  mean: number;
  tags: object;
  unit: unknown; // TODO: implement unions;
}
export interface DeprecatedGeneralMeasurement {
  name: string;
  label: string;
}
export interface DeprecatedCounter {
  count: number;
  tags: object;
  unit: unknown; // TODO: implement unions;
}
export interface MarathonInfo {
  name: string;
  version: string;
  buildref: string;
  elected: boolean;
  leader?: string;
  frameworkId?: string;
  marathon_config: MarathonConfig;
  zookeeper_config: ZooKeeperConfig;
  http_config: HttpConfig;
}
export interface ZooKeeperConfig {
  zk: string;
  zk_compression?: boolean;
  zk_compression_threshold?: number;
  zk_connection_timeout: number;
  zk_max_node_size?: number;
  zk_max_versions: number;
  zk_session_timeout: number;
  zk_timeout: number;
}
export interface LeaderInfo {
  leader: string;
}
export interface HttpConfig {
  http_port: number;
  https_port: number;
}
export interface MarathonConfig {
  access_control_allow_origin?: string[];
  checkpoint?: boolean;
  decline_offer_duration?: number;
  default_network_name?: string;
  env_vars_prefix?: string;
  executor?: string;
  failover_timeout?: number;
  features: string[];
  framework_name?: string;
  ha?: boolean;
  hostname?: string;
  launch_token?: number;
  launch_token_refresh_interval?: number;
  leader_proxy_connection_timeout_ms?: number;
  leader_proxy_read_timeout_ms?: number;
  local_port_max?: number;
  local_port_min?: number;
  master?: string;
  max_instances_per_offer?: number;
  mesos_bridge_name?: string;
  mesos_heartbeat_failure_threshold?: number;
  mesos_heartbeat_interval?: number;
  mesos_leader_ui_url?: string;
  mesos_role?: string;
  mesos_user?: string;
  min_revive_offers_interval?: number;
  offer_matching_timeout?: number;
  on_elected_prepare_timeout?: number;
  reconciliation_initial_delay?: number;
  reconciliation_interval?: number;
  revive_offers_for_new_apps?: boolean;
  revive_offers_repetitions?: number;
  scale_apps_initial_delay?: number;
  scale_apps_interval?: number;
  store_cache?: boolean;
  task_launch_confirm_timeout?: number;
  task_launch_timeout?: number;
  task_lost_expunge_initial_delay: number;
  task_lost_expunge_interval: number;
  task_reservation_timeout?: number;
  webui_url?: string;
}
export interface PersistentVolumeInfo {
  type?: PersistentVolumeType;
  size: number;
  maxSize?: number;
  profileName?: string;
  constraints?: string[][];
}
export interface AppPersistentVolume {
  containerPath: string;
  persistent: PersistentVolumeInfo;
  mode: ReadMode;
}
export interface ExternalVolumeInfo {
  size?: number;
  name?: string;
  provider?: string;
  options?: object;
}
export interface AppHostVolume {
  containerPath: string;
  hostPath: string;
  mode: ReadMode;
}
export interface PodHostVolume {
  name: string;
  host: string;
}
export enum PersistentVolumeType {
  root = "root",
  path = "path",
  mount = "mount"
}
export interface PodPersistentVolume {
  name: string;
  persistent: PersistentVolumeInfo;
}
export interface AppSecretVolume {
  containerPath: string;
  secret: string;
}
export interface VolumeMount {
  name: string;
  mountPath: string;
  readOnly?: boolean;
}
export interface PodEphemeralVolume {
  name: string;
}
export interface PodSecretVolume {
  name: string;
  secret: string;
}
export interface AppExternalVolume {
  containerPath: string;
  external: ExternalVolumeInfo;
  mode: ReadMode;
}

export interface Group {
  id: string;
  apps?: App[];
  pods?: Pod[];
  groups?: Group[];
  dependencies?: string[];
  version?: Date;
}
export interface GroupInfo {
  id: string;
  apps?: App[];
  pods?: PodStatus[];
  groups?: GroupInfo[];
  dependencies?: string[];
  version?: Date;
}
export interface GroupUpdate {
  id: string;
  apps?: App[];
  groups?: GroupUpdate[];
  dependencies?: string[];
  scaleBy?: number;
  version?: Date;
}
export interface RuntimeConfiguration {
  backup?: string;
  restore?: string;
}
export interface LocalVolumeId {
  runSpecId: string;
  containerPath: string;
  uuid: string;
  persistenceId: string;
}

export interface FixedPodScalingPolicy {
  kind: PodScalingPolicyType;
  instances: number;
}
export interface PodScalingPolicy {
  kind: PodScalingPolicyType;
}
export interface PodSchedulingBackoffStrategy {
  backoff?: number;
  backoffFactor?: number;
  maxLaunchDelay?: number;
}
export enum PodScalingPolicyType {
  fixed = "fixed"
}
export interface PodPlacementPolicy {
  constraints?: Constraint[];
  acceptedResourceRoles?: string[];
}
export interface PodSchedulingPolicy {
  backoff?: PodSchedulingBackoffStrategy;
  upgrade?: PodUpgradeStrategy;
  placement?: PodPlacementPolicy;
  killSelection?: KillSelection;
  unreachableStrategy?: unknown; // TODO: implement unions;
}
export interface PodUpgradeStrategy {
  minimumHealthCapacity?: number;
  maximumOverCapacity?: number;
}

export interface Artifact {
  uri: string;
  extract?: boolean;
  executable?: boolean;
  cache?: boolean;
  destPath?: string;
}
export interface NumberRange {
  begin: number;
  end: number;
}
export interface AgentAttribute {
  name: string;
  text?: string;
  scalar?: number;
  ranges?: NumberRange[];
  set?: string[];
}
export interface OfferResource {
  name: string;
  role: string;
  scalar?: number;
  ranges?: NumberRange[];
  set?: string[];
}
export interface Offer {
  id: string;
  hostname: string;
  agentId: string;
  resources: OfferResource[];
  attributes: AgentAttribute[];
}
export interface QueueObject {
  count: number;
  delay: QueueDelay;
  since: Date;
  processedOffersSummary: ProcessedOffersSummary;
  lastUnusedOffers?: UnusedOffer[];
}
export interface QueueApp {
  count: number;
  delay: QueueDelay;
  since: Date;
  processedOffersSummary: ProcessedOffersSummary;
  lastUnusedOffers?: UnusedOffer[];
  app: App;
}
export interface QueuePod {
  count: number;
  delay: QueueDelay;
  since: Date;
  processedOffersSummary: ProcessedOffersSummary;
  lastUnusedOffers?: UnusedOffer[];
  pod: Pod;
}
export interface DeclinedOfferStep {
  reason: string;
  declined: number;
  processed: number;
}
export interface QueueDelay {
  timeLeftSeconds: number;
  overdue: boolean;
}
export interface UnusedOffer {
  offer: Offer;
  reason: string[];
  timestamp: Date;
}
export interface Queue {
  queue?: unknown; // TODO: implement unions[];
}
export interface ProcessedOffersSummary {
  processedOffersCount: number;
  unusedOffersCount: number;
  lastUnusedOfferAt?: Date;
  lastUsedOfferAt?: Date;
  rejectSummaryLastOffers?: DeclinedOfferStep[];
  rejectSummaryLaunchAttempt?: DeclinedOfferStep[];
}

export interface Histogram {
  count: number;
  min: number;
  mean: number;
  max: number;
  p50: number;
  p75: number;
  p95: number;
  p98: number;
  p99: number;
  p999: number;
  stddev: number;
}
export interface Counter {
  count: number;
}
export interface Timer {
  count: number;
  min: number;
  mean: number;
  max: number;
  p50: number;
  p75: number;
  p95: number;
  p98: number;
  p99: number;
  p999: number;
  stddev: number;
  m1_rate: number;
  m5_rate: number;
  m15_rate: number;
  mean_rate: number;
  duration_units: string;
  rate_units: string;
}
export interface Meter {
  count: number;
  m1_rate: number;
  m5_rate: number;
  m15_rate: number;
  mean_rate: number;
  units: string;
}
export interface NewMetrics {
  version: string;
  counters: object;
  gauges: object;
  histograms: object;
  meters: object;
  timers: object;
}
export interface Gauge {
  value: number;
}

export interface AppCheck {
  http?: AppHttpCheck;
  tcp?: AppTcpCheck;
  exec?: CommandCheck;
  intervalSeconds?: number;
  timeoutSeconds?: number;
  delaySeconds?: number;
}
export interface CommandCheckStatus {
  exitCode: number;
}
export interface AppTcpCheck {
  portIndex?: number;
}
export interface CheckStatus {
  http?: HttpCheckStatus;
  tcp?: TCPCheckStatus;
  exec?: CommandCheckStatus;
}

export interface TcpCheck {
  endpoint: string;
}
export interface HttpCheckStatus {
  statusCode: number;
}
export interface HttpCheck {
  endpoint: string;
  path?: string;
  scheme?: HttpScheme;
}
export interface AppHttpCheck {
  portIndex?: number;
  path?: string;
  scheme?: HttpScheme;
}
export interface TCPCheckStatus {
  succeeded: boolean;
}

export interface IpDiscoveryPort {
  number?: number;
  name: string;
  protocol?: NetworkProtocol;
  labels?: object;
}
export interface PortDefinition {
  port?: number;
  labels?: object;
  name?: string;
  protocol?: NetworkProtocol;
}
export enum NetworkMode {
  container = "container",
  container_bridge = "container/bridge",
  host = "host"
}
export interface Endpoint {
  name: string;
  containerPort?: number;
  hostPort?: number;
  protocol?: string[];
  labels?: object;
  networkNames?: string[];
}
export interface Network {
  name?: string;
  mode?: NetworkMode;
  labels?: object;
}
export interface IpDiscovery {
  ports?: IpDiscoveryPort[];
}

export interface DeploymentResult {
  deploymentId: string;
  version: Date;
}
export interface DeploymentStep {
  actions: DeploymentAction[];
}

export interface DeploymentAction {
  action: DeploymentActionName;
  app?: string;
  pod?: string;
}
export enum DeploymentActionName {
  StartApplication = "StartApplication",
  StopApplication = "StopApplication",
  ScaleApplication = "ScaleApplication",
  RestartApplication = "RestartApplication",
  StartPod = "StartPod",
  StopPod = "StopPod",
  ScalePod = "ScalePod",
  RestartPod = "RestartPod",
  ResolveArtifacts = "ResolveArtifacts"
}
