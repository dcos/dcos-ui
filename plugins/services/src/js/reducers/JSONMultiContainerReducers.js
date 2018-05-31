import { simpleReducer } from "#SRC/js/utils/ReducerUtil";

import { JSONReducer as constraints } from "./serviceForm/MultiContainerConstraints";
import { JSONReducer as containers } from "./serviceForm/JSONReducers/Containers";
import { JSONReducer as environment } from "./serviceForm/JSONReducers/EnvironmentVariables";
import { JSONReducer as residency } from "./serviceForm/JSONReducers/MultiContainerResidency";
import { JSONReducer as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONReducer as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONReducer as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONReducer as volumes } from "./serviceForm/MultiContainerVolumes";
import { JSONReducer as networks } from "./serviceForm/MultiContainerNetwork";

module.exports = {
  id: simpleReducer("id"),
  containers,
  environment,
  scaling,
  labels,
  scheduling(state = { placement: { constraints: [] } }, transaction) {
    const constraintsState =
      state != null && state.placement != null
        ? state.placement.constraints
        : [];

    return {
      residency: residency.bind(this)(state.residency, transaction),
      placement: {
        constraints: constraints.bind(this)(constraintsState, transaction)
      }
    };
  },
  fetch,
  volumes,
  networks
};
