import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../../src/js/constants/TransactionTypes";
import { PROTOCOLS } from "../../../constants/PortDefinitionConstants";

const FIELDS = [
  "automaticPort",
  "containerPort",
  "hostPort",
  "labels",
  "loadBalanced",
  "portMapping",
  "name",
  "servicePort",
  "vip",
  "vipPort"
];

/**
 * @param {Object[]} state
 * @param {Object} action
 * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
 * @param {String[]} action.path - location of value
 * @param {*} action.value - to perform action with
 * @return {Object[]} new portDefinitions with action performed on it
 */
function SingleContainerPortMappingsReducer(state = [], action) {
  const { type, path = [], value } = action;
  const [base, index, field, subfield] = path;
  const joinedPath = path.join(".");

  if (base === "portDefinitions") {
    if (joinedPath === "portDefinitions") {
      switch (type) {
        case ADD_ITEM:
          state.push({
            automaticPort: true,
            containerPort: null,
            hostPort: null,
            labels: null,
            loadBalanced: false,
            name: null,
            portMapping: false,
            protocol: {
              tcp: true,
              udp: false
            },
            servicePort: null,
            vip: null,
            vipPort: null
          });
          break;
        case REMOVE_ITEM:
          state = state.filter(function(item, index) {
            return index !== value;
          });
          break;
      }
    }

    if (index != null && type === SET) {
      if (FIELDS.includes(field)) {
        state[index][field] = value;
      }

      if (field === "protocol" && PROTOCOLS.includes(subfield)) {
        state[index].protocol[subfield] = value;
      }

      // If port is assigned automatically, remove hostPort
      if (state[index].automaticPort) {
        state[index].hostPort = 0;
      }
    }
  }

  return state;
}

module.exports = SingleContainerPortMappingsReducer;
