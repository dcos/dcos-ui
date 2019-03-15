import { simpleReducer } from "#SRC/js/utils/ReducerUtil";
import Util from "#SRC/js/utils/Util";

import { JSONReducer as constraints } from "./serviceForm/MultiContainerConstraints";
import { JSONReducer as containers } from "./serviceForm/JSONReducers/Containers";
import { JSONReducer as environment } from "./serviceForm/JSONReducers/EnvironmentVariables";
import { JSONReducer as residency } from "./serviceForm/JSONReducers/MultiContainerResidency";
import { JSONReducer as fetch } from "./serviceForm/JSONReducers/Artifacts";
import { JSONReducer as scaling } from "./serviceForm/MultiContainerScaling";
import { JSONReducer as labels } from "./serviceForm/JSONReducers/Labels";
import { JSONReducer as volumes } from "./serviceForm/MultiContainerVolumes";
import { JSONReducer as networks } from "./serviceForm/MultiContainerNetwork";

export default {
  id: simpleReducer("id"),
  containers,
  environment,
  scaling,
  labels,
  scheduling(state, transaction) {
    if (state == null) {
      return {};
    }

    const { path, value } = transaction;
    const joinedPath = path.join(".");

    const scheduling =
      joinedPath === "scheduling" ? Util.deepCopy(value) : state;

    const constraintsState =
      scheduling.placement != null ? scheduling.placement.constraints : [];
    const placementState =
      scheduling.placement != null ? scheduling.placement : {};

    return {
      ...scheduling,
      residency: residency.bind(this)(state.residency, transaction),
      placement: {
        ...placementState,
        constraints: constraints.bind(this)(constraintsState, transaction)
      }
    };
  },
  fetch,
  volumes,
  networks
};
