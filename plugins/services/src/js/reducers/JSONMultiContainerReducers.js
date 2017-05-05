import { simpleReducer } from "#SRC/js/utils/ReducerUtil";

import {
  JSONReducer as constraints
} from "./serviceForm/MultiContainerConstraints";
import { JSONReducer as containers } from "./serviceForm/Containers";
import {
  JSONReducer as environment
} from "./serviceForm/JSONReducers/EnvironmentVariables";
import { JSONReducer as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONReducer as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONReducer as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONReducer as volumes } from "./serviceForm/MultiContainerVolumes";
import { JSONReducer as networks } from "./serviceForm/MultiContainerNetwork";
import { JSONReducer as ipAddress } from "./serviceForm/JSONReducers/IpAddress";

module.exports = {
  id: simpleReducer("id"),
  containers,
  environment,
  scaling,
  labels,
  scheduling(state, transaction) {
    return {
      placement: {
        constraints: constraints.bind(this)(state, transaction)
      }
    };
  },
  fetch,
  volumes,
  networks,
  ipAddress
};
