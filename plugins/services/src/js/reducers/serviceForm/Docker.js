import { combineReducers, simpleReducer } from "#SRC/js/utils/ReducerUtil";
import { SET } from "#SRC/js/constants/TransactionTypes";
import Networking from "#SRC/js/constants/Networking";
import { PROTOCOLS } from "../../constants/PortDefinitionConstants";
import ContainerConstants from "../../constants/ContainerConstants";
import PortMappingsReducer from "./JSONReducers/PortMappingsReducer";
import VipLabelUtil from "../../utils/VipLabelUtil";

const { DOCKER, MESOS } = ContainerConstants.type;

const { BRIDGE, HOST, USER } = Networking.type;

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

module.exports = combineReducers({
  privileged: getContainerSettingsReducer("privileged"),
  forcePullImage: getContainerSettingsReducer("forcePullImage"),
  image: simpleReducer("container.docker.image", ""),
  network(state, { type, path = [], value }) {
    if (!this.containerType) {
      this.containerType = MESOS;
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    // Universal containerizer does not support network
    if (this.containerType !== DOCKER) {
      return null;
    }

    if (type === SET && joinedPath === "networks.0.mode") {
      return Networking.type[value.split(".")[0]];
    }

    return state;
  },
  portMappings(state, action) {
    const { path = [], value, type } = action;
    if (!this.appState) {
      this.appState = {
        id: "",
        networkType: HOST
      };
    }
    if (!this.containerType) {
      this.containerType = MESOS;
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (joinedPath === "networks.0.mode" && Boolean(value)) {
      this.appState.networkType = value.split(".")[0];
    }

    if (joinedPath === "id" && Boolean(value)) {
      this.appState.id = value;
    }

    // Apply PortMappingsReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = PortMappingsReducer(this.portDefinitions, action);

    // Universal containerizer does not support portMappings
    if (this.containerType !== DOCKER) {
      return null;
    }

    // We only want portMappings for networks of type BRIDGE or USER
    if (
      this.appState.networkType !== BRIDGE &&
      this.appState.networkType !== USER
    ) {
      return null;
    }

    // Convert portDefinitions to portMappings
    return this.portDefinitions.map((portDefinition, index) => {
      const vipLabel = `VIP_${index}`;
      const vipPort = Number(portDefinition.vipPort) || null;
      const containerPort = Number(portDefinition.containerPort) || 0;
      const servicePort = parseInt(portDefinition.servicePort, 10) || null;
      const defaultVipPort = vipPort || containerPort;
      let hostPort = Number(portDefinition.hostPort) || 0;
      let protocol = PROTOCOLS.filter(function(protocol) {
        return portDefinition.protocol[protocol];
      }).join(",");

      // Do not expose hostPort or protocol, when portMapping is turned off
      if (this.appState.networkType === USER && !portDefinition.portMapping) {
        hostPort = null;
        protocol = null;
      }

      // Prefer container port
      // because this is what a user would expect to get load balanced
      const labels = VipLabelUtil.generateVipLabel(
        this.appState.id,
        portDefinition,
        vipLabel,
        vipPort || defaultVipPort
      );

      return {
        containerPort,
        hostPort,
        labels,
        protocol,
        servicePort,
        name: portDefinition.name
      };
    });
  }
});
