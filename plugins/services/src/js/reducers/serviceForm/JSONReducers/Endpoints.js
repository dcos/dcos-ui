import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../../src/js/constants/TransactionTypes';

import {
  parseIntValue
} from '../../../../../../../src/js/utils/ReducerUtil';

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
  vip: null
};

module.exports = {
  JSONReducer(state = [], {type, path = [], value}) {
    const newState = [].concat(state);

    // eslint-disable-next-line no-unused-vars
    const [_, index, field, secondIndex, name, subField] = path;

    if (field !== 'endpoints') {
      return state;
    }

    if (newState[index] == null) {
      newState[index] = [];
    }

    switch (type) {
      case ADD_ITEM:
        const endpointDefinition = Object.assign(
          {}, defaultEndpointsFieldValues);
        endpointDefinition.protocol = Object.assign(
          {}, defaultEndpointsFieldValues.protocol);
        newState[index].push(endpointDefinition);
        break;
      case REMOVE_ITEM:
        newState[index] =
          newState[index].filter((item, index) => {
            return index !== value;
          });
        break;
    }

    const fieldNames = [
      'name',
      'automaticPort',
      'loadBalanced',
      'labels',
      'vip'
    ];
    const numericalFiledNames = ['containerPort', 'hostPort'];

    if (type === SET && name === 'protocol') {
      newState[index][secondIndex].protocol[subField] = value;
    }
    if (type === SET && fieldNames.includes(name)) {
      newState[index][secondIndex][name] = value;
    }
    if (type === SET && numericalFiledNames.includes(name)) {
      newState[index][secondIndex][name] = parseIntValue(
        value
      );
    }

    return newState;
  }
};
