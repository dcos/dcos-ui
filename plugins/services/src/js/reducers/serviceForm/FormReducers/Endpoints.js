import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import { parseIntValue } from "#SRC/js/utils/ReducerUtil";

const defaultEndpointsFieldValues = {
  automaticPort: true,
  containerPort: null,
  hostPort: null,
  labels: null,
  loadBalanced: false,
  name: null,
  protocol: {
    tcp: true,
    udp: false
  },
  servicePort: null,
  vip: null,
  vipPort: null
};

module.exports = {
  FormReducer(state = [], { type, path = [], value }) {
    let newState = [].concat(state);

    const [_, _index, field, secondIndex, name, subField] = path;

    if (field !== "endpoints") {
      return state;
    }

    switch (type) {
      case ADD_ITEM:
        const endpointDefinition = Object.assign(
          {},
          defaultEndpointsFieldValues
        );
        endpointDefinition.protocol = Object.assign(
          {},
          defaultEndpointsFieldValues.protocol
        );
        newState.push(endpointDefinition);
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => {
          return index !== value;
        });
        break;
    }

    const fieldNames = [
      "name",
      "automaticPort",
      "loadBalanced",
      "vip",
      "vipPort"
    ];
    const numericalFiledNames = ["containerPort", "hostPort"];

    if (type === SET && name === "protocol") {
      newState[secondIndex].protocol[subField] = value;
    }
    if (type === SET && fieldNames.includes(name)) {
      newState[secondIndex][name] = value;
    }
    if (type === SET && numericalFiledNames.includes(name)) {
      newState[secondIndex][name] = parseIntValue(value);
    }

    return newState;
  }
};
