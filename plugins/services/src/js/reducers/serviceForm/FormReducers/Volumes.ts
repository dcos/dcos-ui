import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";

const defaultVolume = {
  containerPath: null,
  size: null,
  profileName: null,
  mode: "RW",
  externalCSI: {
    name: "",
    provider: "csi",
    options: {
      pluginName: "",
      capability: {
        accessMode: "SINGLE_NODE_WRITER",
        accessType: "mount",
        fsType: "",
        mountFlags: [],
      },
      nodeStageSecret: {},
      nodePublishSecret: {},
      volumeContext: {},
    },
  },
};

export function FormReducer(
  state: Array<Record<string, unknown>> = [],
  { type, path, value }
) {
  if (path == null) {
    return state;
  }

  const joinedPath = path.join(".");
  if (joinedPath === "volumes") {
    switch (type) {
      case ADD_ITEM:
        state.push({ ...(value || defaultVolume) });
        break;
      case REMOVE_ITEM:
        state = state.filter((_, index) => index !== value);
        break;
    }
    return state;
  }

  if (joinedPath.includes("volumes") && type === SET) {
    const index = joinedPath.match(/\d+/)[0];
    if (`volumes.${index}` === joinedPath) {
      state[index] = value;
    }
    if (`volumes.${index}.type` === joinedPath) {
      state[index].type = String(value);
    }
    if (`volumes.${index}.size` === joinedPath) {
      state[index].size = parseIntValue(value);
    }
    if (`volumes.${index}.profileName` === joinedPath) {
      state[index].profileName = String(value);
    }
    if (`volumes.${index}.name` === joinedPath) {
      state[index].name = String(value);
    }
    if (`volumes.${index}.mode` === joinedPath) {
      state[index].mode = String(value);
    }
    if (`volumes.${index}.containerPath` === joinedPath) {
      state[index].containerPath = String(value);
    }
    if (`volumes.${index}.hostPath` === joinedPath) {
      state[index].hostPath = String(value);
    }
  }

  return state;
}
