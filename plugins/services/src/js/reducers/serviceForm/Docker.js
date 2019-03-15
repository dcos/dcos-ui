import { combineReducers, simpleReducer } from "#SRC/js/utils/ReducerUtil";
import { SET } from "#SRC/js/constants/TransactionTypes";

import ContainerConstants from "../../constants/ContainerConstants";

const { DOCKER } = ContainerConstants.type;

function getContainerSettingsReducer(name) {
  return function(_, { type, path = [], value }) {
    const joinedPath = path.join(".");
    if (joinedPath === "container.type" && Boolean(value)) {
      this.networkType = value;
    }

    if (type === SET && joinedPath === `container.docker.${name}`) {
      this.value = Boolean(value);
    }
    if (this.networkType === DOCKER && this.value != null) {
      return this.value;
    }

    return null;
  };
}

export default combineReducers({
  privileged: getContainerSettingsReducer("privileged"),
  forcePullImage: simpleReducer("container.docker.forcePullImage", null),
  image: simpleReducer("container.docker.image", "")
});
