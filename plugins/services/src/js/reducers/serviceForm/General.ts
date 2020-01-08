import { simpleReducer } from "#SRC/js/utils/ReducerUtil";
import { FormReducer as constraints } from "./FormReducers/Constraints";
import { FormReducer as fetch } from "./FormReducers/Artifacts";
import { combineReducers } from "#SRC/js/utils/ReducerUtil";
import { resourceLimitReducer } from "./FormReducers/resourceLimits";

export default {
  constraints,
  fetch,
  id: simpleReducer("id"),
  instances: simpleReducer("instances"),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer("cpus"),
  mem: simpleReducer("mem"),
  disk: simpleReducer("disk"),
  gpus: simpleReducer("gpus"),
  cmd: simpleReducer("cmd"),
  limits: combineReducers({
    cpus: resourceLimitReducer("cpus", parseFloat),
    mem: resourceLimitReducer("mem", parseInt)
  })
};
