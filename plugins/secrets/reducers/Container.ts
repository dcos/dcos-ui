import Transaction from "#SRC/js/structs/Transaction";

import { JSONSingleContainerReducer as volumesReducer } from "./Volumes";

import { ContainerDefinition, SingleContainerReducerContext } from "./types";

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
  const existingVolumes =
    state != null && state.volumes != null ? state.volumes : [];
  return {
    ...state,
    volumes: existingVolumes.concat(secretVolumes),
  };
}
