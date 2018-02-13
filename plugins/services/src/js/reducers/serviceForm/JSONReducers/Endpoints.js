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
  JSONReducer(state = [], { type, path = [], value }) {
    const newState = [].concat(state);

    const [_, index, field, secondIndex, name, subField] = path;

    if (field !== "endpoints") {
      return state;
    }

    if (newState[index] == null) {
      newState[index] = [];
    }

    switch (type) {
      case ADD_ITEM:
        let newEndpoint = value;

        if (value == null) {
          newEndpoint = Object.assign({}, defaultEndpointsFieldValues);
        }

        newEndpoint.protocol = Object.assign({}, newEndpoint.protocol);
        newState[index].push(newEndpoint);
        break;
      case REMOVE_ITEM:
        newState[index] = newState[index].filter((item, index) => {
          return index !== value;
        });
        break;
    }

    const fieldNames = [
      "name",
      "automaticPort",
      "loadBalanced",
      "labels",
      "vip",
      "vipPort"
    ];
    const numericalFiledNames = ["containerPort", "hostPort"];

    if (type === SET && name === "protocol") {
      newState[index][secondIndex].protocol[subField] = value;
    }
    if (type === SET && fieldNames.includes(name)) {
      newState[index][secondIndex][name] = value;
    }
    if (type === SET && numericalFiledNames.includes(name)) {
      newState[index][secondIndex][name] = parseIntValue(value);
    }

    return newState;
  }
};
