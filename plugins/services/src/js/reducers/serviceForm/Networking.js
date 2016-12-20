import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';

const defaultFieldValues = {
  automaticPort: true,
  containerPort: null,
  hostPort: null,
  labels: null,
  loadBalanced: false,
  name: null,
  portMapping: false,
  protocol: 'tcp',
  servicePort: null,
  vip: null
};

/**
 * Creates portDefinitions to be used by networking reducers,
 * i.e. PortDefinitions and PortMappings.
 * @param {Object[]} portDefinitions - existing PortDefinitions
 * @param {Object} action
 * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
 * @param {String[]} action.path - location of value
 * @param {*} action.value - to perform action with
 * @return {Object[]} new portDefinitions with action performed on it
 */
function reducer(portDefinitions = [], {type, path = [], value}) {
  const joinedPath = path.join('.');

  if (path.includes('portDefinitions')) {
    if (joinedPath === 'portDefinitions') {
      switch (type) {
        case ADD_ITEM:
          const portDefinition = Object.assign({}, defaultFieldValues);
          portDefinitions.push(portDefinition);
          break;
        case REMOVE_ITEM:
          portDefinitions = portDefinitions.filter((item, index) => {
            return index !== value;
          });
          break;
      }
    }

    const index = path[1];
    if (index != null && type === SET) {
      Object.keys(defaultFieldValues).forEach((fieldKey) => {
        if (joinedPath === `portDefinitions.${index}.${fieldKey}`) {
          portDefinitions[index][fieldKey] = value;
        }
      });

      // If port is assigned automatically, remove hostPort
      if (portDefinitions[index].automaticPort) {
        portDefinitions[index].hostPort = null;
      }
    }
  }

  return portDefinitions;
};

module.exports = reducer;
