import Transaction from "#SRC/js/structs/Transaction";
import { JSONSingleContainerReducer as volumesReducer } from "./Volumes";
import { ContainerDefinition, SingleContainerReducerContext } from "./types";
import { uniqBy } from "lodash";

export function JSONSingleContainerReducer(
  this: SingleContainerReducerContext,
  state: ContainerDefinition,
  action: Transaction
): ContainerDefinition | object {
  if (action.path == null) {
    return state;
  }
  if (this.secrets == null) {
    this.secrets = [];
  }
  const secretVolumes = volumesReducer.call(this, state, action);
  const existingVolumes = state?.volumes || [];
  const volumes = existingVolumes.concat(secretVolumes);

  return { ...state, volumes: uniqBy(volumes, "containerPath") };
}
