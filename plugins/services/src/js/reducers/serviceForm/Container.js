import { combineReducers } from "#SRC/js/utils/ReducerUtil";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";
import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { simpleParser, combineParsers } from "#SRC/js/utils/ParserUtil";
import Networking from "#SRC/js/constants/Networking";
import Transaction from "#SRC/js/structs/Transaction";
import ValidatorUtil from "#SRC/js/utils/ValidatorUtil";

import { JSONReducer as volumesJSONReducer } from "./JSONReducers/Volumes";
import { PROTOCOLS } from "../../constants/PortDefinitionConstants";
import ContainerConstants from "../../constants/ContainerConstants";
import docker from "./Docker";
import networkingReducer from "./Networking";
import VipLabelUtil from "../../utils/VipLabelUtil";

const { BRIDGE, HOST, CONTAINER } = Networking.type;
const { DOCKER, MESOS, NONE } = ContainerConstants.type;

const containerJSONReducer = combineReducers({
  volumes: volumesJSONReducer,
  type(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.hasImage == null) {
      this.hasImage = false;
    }

    if (this.noState == null) {
      this.noState = true;
    }

    if (this.hasVolumes == null) {
      this.hasVolumes = [];
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.docker.image") {
      this.hasImage = !ValidatorUtil.isEmpty(value);
    }

    if (path[0] === "localVolumes" || path[0] === "externalVolumes") {
      switch (type) {
        case ADD_ITEM:
          this.hasVolumes.push(true);
          break;
        case REMOVE_ITEM:
          this.hasVolumes = this.hasVolumes.filter((item, index) => {
            return index !== value;
          });
      }
    }

    if (type === SET && joinedPath === "container.type" && value !== NONE) {
      this.noState = false;

      return value;
    }

    if (value === NONE) {
      this.noState = true;
    }

    let volumesState = null;

    if (this.hasVolumes.length !== 0) {
      volumesState = MESOS;
    }

    if (this.noState) {
      return volumesState;
    }

    return state;
  },
  docker(_, { type, path, value }, index) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    // Passing down the index as well, for reducers to use context
    this.internalState = docker(
      this.internalState,
      { type, path, value },
      index
    );

    const joinedPath = path && path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (
      !ValidatorUtil.isEmpty(this.internalState) &&
      this.containerType !== NONE
    ) {
      return Object.assign({}, this.internalState);
    }
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
      this.containerType = NONE;
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (joinedPath === "networks.0.network" && value != null) {
      const [mode, _name] = value.split(".");
      this.appState.networkType = mode;
    }
    if (joinedPath === "networks.0.mode" && value != null) {
      this.appState.networkType = value;
    }

    if (joinedPath === "id" && Boolean(value)) {
      this.appState.id = value;
    }

    // Apply networkingReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // Universal containerizer does not support portMappings for CONTAINER
    if (
      this.containerType !== DOCKER &&
      this.appState.networkType === CONTAINER
    ) {
      return null;
    }

    // We only want portMappings for networks of type BRIDGE or CONTAINER
    if (
      this.appState.networkType !== BRIDGE &&
      this.appState.networkType !== CONTAINER
    ) {
      return null;
    }

    // Convert portDefinitions to portMappings
    return this.portDefinitions.map((portDefinition, index) => {
      const vipLabel = `VIP_${index}`;
      const containerPort = Number(portDefinition.containerPort) || 0;
      const servicePort = parseInt(portDefinition.servicePort, 10) || null;
      let hostPort = Number(portDefinition.hostPort) || 0;
      let protocol = PROTOCOLS.filter(function(protocol) {
        return portDefinition.protocol[protocol];
      }).join(",");

      // Do not expose hostPort or protocol, when portMapping is turned off
      if (
        this.appState.networkType === CONTAINER &&
        !portDefinition.portMapping
      ) {
        hostPort = null;
        protocol = null;
      }

      // Prefer container port
      // because this is what a user would expect to get load balanced
      const vipPort = containerPort || hostPort || 0;
      const labels = VipLabelUtil.generateVipLabel(
        this.appState.id,
        portDefinition,
        vipLabel,
        vipPort
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

const containerReducer = combineReducers({
  type(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "container.type") {
      return value;
    }

    return state;
  },
  docker(_, { type, path, value }, index) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    // Passing down the index as well, for reducers to use context
    this.internalState = docker(
      this.internalState,
      { type, path, value },
      index
    );

    const joinedPath = path && path.join(".");
    if (type === SET && joinedPath === "container.type") {
      this.containerType = value;
    }

    if (
      !ValidatorUtil.isEmpty(this.internalState) &&
      this.containerType !== NONE
    ) {
      const newState = Object.assign({}, this.internalState);
      Object.keys(this.internalState).forEach(key => {
        if (ValidatorUtil.isEmpty(this.internalState[key])) {
          delete newState[key];
        }
      });

      return newState;
    }
  }
});

module.exports = {
  JSONReducer(_, ...args) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    if (this.isMesosRuntime == null) {
      this.isMesosRuntime = true;
    }

    const { type, path, value } = args[0];

    if (type === SET && path.join(".") === "container.type") {
      this.isMesosRuntime = value === NONE;
    }

    const newState = Object.assign(
      {},
      containerJSONReducer.apply(this, [this.internalState, ...args])
    );

    this.internalState = newState;

    if (ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    }

    if (ValidatorUtil.isEmpty(newState.type)) {
      newState.type = null;
    }

    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }

    return newState;
  },

  FormReducer(_, ...args) {
    if (this.internalState == null) {
      this.internalState = {};
    }

    const newState = Object.assign(
      {},
      containerReducer.apply(this, [this.internalState, ...args])
    );

    this.internalState = newState;

    if (ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    } else if (ValidatorUtil.isEmpty(newState.type)) {
      delete newState.docker;
    } else if (this.isMesosRuntime && !ValidatorUtil.isEmpty(newState.docker)) {
      delete newState.docker;
    } else if (newState.docker.type === NONE) {
      delete newState.docker;
    }

    if (ValidatorUtil.isEmpty(newState.volumes)) {
      delete newState.volumes;
    }

    if (ValidatorUtil.isEmpty(newState.type)) {
      delete newState.type;
    }

    if (ValidatorUtil.isEmpty(newState)) {
      return null;
    }

    return newState;
  },

  JSONParser: combineParsers([
    function(state) {
      const image = findNestedPropertyInObject(state, "container.docker.image");
      let value = findNestedPropertyInObject(state, "container.type");

      if (value === MESOS && !image) {
        value = NONE;
      }

      if (value == null) {
        value = NONE;
      }

      return new Transaction(["container", "type"], value);
    },
    simpleParser(["container", DOCKER.toLowerCase(), "image"]),
    simpleParser(["container", MESOS.toLowerCase(), "image"]),
    simpleParser(["container", DOCKER.toLowerCase(), "forcePullImage"]),
    simpleParser(["container", MESOS.toLowerCase(), "forcePullImage"]),
    simpleParser(["container", DOCKER.toLowerCase(), "privileged"]),
    simpleParser(["container", MESOS.toLowerCase(), "privileged"])
  ])
};
