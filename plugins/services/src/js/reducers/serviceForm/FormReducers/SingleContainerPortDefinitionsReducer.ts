import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import { PROTOCOLS } from "../../../constants/PortDefinitionConstants";

const FIELDS = [
  "hostPort",
  "labels",
  "loadBalanced",
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
 * @param {*} action.value - value to perform action with
 * @return {Object[]} new portDefinitions with action performed on it
 */
function SingleContainerPortDefinitionsReducer(state = [], action) {
  const { type, path = [], value } = action;
  const [base, index, field, subfield] = path;
  const joinedPath = path.join(".");

  if (base === "portDefinitions") {
    if (joinedPath === "portDefinitions") {
      switch (type) {
        case ADD_ITEM:
          const definition = {
            hostPort: null,
            labels: null,
            loadBalanced: false,
            name: null,
            protocol: {
              tcp: false,
              udp: false
            },
            servicePort: null,
            vip: null,
            vipPort: null
          };
          const defaults = { protocol: { tcp: true } };

          state.push({ ...definition, ...(value || defaults) });
          break;
        case REMOVE_ITEM:
          state = state.filter((item, index) => index !== value);
          break;
      }
    }

    if (index != null && type === SET) {
      if (FIELDS.includes(field)) {
        state[index][field] = value;
      }

      if (field === "protocol" && PROTOCOLS.includes(subfield)) {
        if (state[index].protocol == null) {
          state[index].protocol = {};
        }

        state[index].protocol[subfield] = value;
      }
    }
  }

  return state;
}

export default SingleContainerPortDefinitionsReducer;
