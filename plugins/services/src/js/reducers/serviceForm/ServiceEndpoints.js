import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';

const defaultFieldValues = {
  containerPort: null,
  name: null,
  hostPort: null,
  assignHostPortAutomatically: false,
  protocol: 'tcp',
  portMapping: false,
  loadBalancedServiceAddressEnabled: true
};

const reducer = (state = [], {type, path, value}) => {
  if (path == null) {
    return state;
  }

  let joinedPath = path.join('.');

  if (joinedPath.search('serviceEndpoints') !== -1) {
    if (joinedPath === 'serviceEndpoints') {
      switch (type) {
        case ADD_ITEM:
          state.push(Object.assign({}, defaultFieldValues));
          break;
        case REMOVE_ITEM:
          state = state.filter((item, index) => {
            return index !== value;
          });
          break;
      }

      return state;
    }

    let index = joinedPath.match(/\d+/)[0];

    if (type === SET) {
      Object.keys(defaultFieldValues).forEach((fieldKey) => {
        if (`serviceEndpoints.${index}.${fieldKey}` === joinedPath) {
          state[index][fieldKey] = value;
        }
      });
    }
  }

  return state;
};

module.exports = {
  JSONReducer: reducer,

  JSONParser(state) {
    if (state.portMappings == null) {
      return [];
    }

    return state;
  },

  FormReducer: reducer
};
