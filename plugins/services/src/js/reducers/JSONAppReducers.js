import { JSONReducer as constraints } from "./serviceForm/Constraints";
import { JSONReducer as container } from "./serviceForm/Container";
import { JSONReducer as env } from "./serviceForm/EnvironmentVariables";
import { JSONReducer as fetch } from "./serviceForm/Artifacts";
import { JSONReducer as healthChecks } from "./serviceForm/HealthChecks";
import { JSONReducer as labels } from "./serviceForm/Labels";
import { JSONReducer as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONReducer as residency } from "./serviceForm/Residency";
import { JSONReducer as ipAddress } from "./serviceForm/IpAddress";
import { JSONReducer as requirePorts } from "./serviceForm/RequirePorts";
import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from "../../../../../src/js/utils/ReducerUtil";

module.exports = {
  id: simpleReducer("id"),
  instances: simpleIntReducer("instances"),
  container,
  cpus: simpleFloatReducer("cpus"),
  mem: simpleIntReducer("mem"),
  disk: simpleIntReducer("disk"),
  gpus: simpleIntReducer("gpus"),
  cmd: simpleReducer("cmd"),
  env,
  labels,
  healthChecks,
  constraints,
  fetch,
  portDefinitions,
  requirePorts,
  residency,
  ipAddress
};
