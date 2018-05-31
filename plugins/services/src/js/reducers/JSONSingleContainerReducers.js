import {
  simpleFloatReducer,
  simpleIntReducer,
  simpleReducer
} from "#SRC/js/utils/ReducerUtil";

import { JSONReducer as constraints } from "./serviceForm/JSONReducers/Constraints";
import { JSONReducer as container } from "./serviceForm/Container";
import { JSONReducer as env } from "./serviceForm/JSONReducers/EnvironmentVariables";
import { JSONReducer as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONReducer as healthChecks } from "./serviceForm/JSONReducers/HealthChecks";
import { JSONReducer as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONReducer as residency } from "./serviceForm/JSONReducers/Residency";
import { JSONReducer as requirePorts } from "./serviceForm/JSONReducers/RequirePorts";
import { JSONReducer as portDefinitions } from "./serviceForm/PortDefinitions";
import { JSONReducer as networks } from "./serviceForm/JSONReducers/Networks";

module.exports = {
  id: simpleReducer("id"),
  instances: simpleIntReducer("instances"),
  container,
  cpus: simpleFloatReducer("cpus"),
  mem: simpleIntReducer("mem"),
  disk: simpleFloatReducer("disk"),
  gpus: simpleFloatReducer("gpus"),
  cmd: simpleReducer("cmd"),
  constraints,
  env,
  fetch,
  healthChecks,
  labels,
  networks,
  portDefinitions,
  requirePorts,
  residency
};
