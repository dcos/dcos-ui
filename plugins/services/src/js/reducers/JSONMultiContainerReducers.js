import {
  JSONReducer as constraints
} from "./serviceForm/MultiContainerConstraints";
import { JSONReducer as containers } from "./serviceForm/Containers";
import { JSONReducer as environment } from "./serviceForm/EnvironmentVariables";
import { JSONReducer as fetch } from "./serviceForm/Artifacts";
import { JSONReducer as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONReducer as labels } from "./serviceForm/Labels";
import { JSONReducer as volumes } from "./serviceForm/MultiContainerVolumes";
import { JSONReducer as networks } from "./serviceForm/MultiContainerNetwork";
import { JSONReducer as ipAddress } from "./serviceForm/IpAddress";
import { simpleReducer } from "../../../../../src/js/utils/ReducerUtil";

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
