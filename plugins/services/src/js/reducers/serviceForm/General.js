import { simpleReducer, simpleIntReducer } from "#SRC/js/utils/ReducerUtil";
import { FormReducer as constraints } from "./FormReducers/Constraints";
import { FormReducer as fetch } from "./FormReducers/Artifacts";

module.exports = {
  constraints,
  fetch,
  id: simpleReducer("id"),
  instances: simpleReducer("instances"),
  // Container runtime is handled in ./serviceForm/Container
  cpus: simpleReducer("cpus"),
  mem: simpleReducer("mem"),
  disk: simpleReducer("disk"),
  gpus: simpleIntReducer("gpus"),
  cmd: simpleReducer("cmd")
};
