import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import {PROTOCOLS} from '../../constants/PortDefinitionConstants';

const defaultFieldValues = {
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
  const [base, index, field, subfield] = path;
  const joinedPath = path.join('.');

  if (base === 'portDefinitions') {
    if (joinedPath === 'portDefinitions') {
      switch (type) {
        case ADD_ITEM:
          const newDefinition = value || defaultFieldValues;
          const portDefinition = Object.assign({}, newDefinition);
          portDefinition.protocol = Object.assign({}, newDefinition.protocol);
          portDefinitions.push(portDefinition);
          break;
        case REMOVE_ITEM:
          portDefinitions = portDefinitions.filter((item, index) => {
            return index !== value;
          });
          break;
      }
    }

    if (index != null && type === SET) {
      Object.keys(defaultFieldValues).forEach((fieldKey) => {
        if (joinedPath === `portDefinitions.${index}.${fieldKey}`) {
          portDefinitions[index][fieldKey] = value;
        }
      });

      if (field === 'protocol' && PROTOCOLS.includes(subfield)) {
        portDefinitions[index].protocol[subfield] = value;
      }

      // If port is assigned automatically, remove hostPort
      if (portDefinitions[index].automaticPort) {
        portDefinitions[index].hostPort = null;
      }
    }
  }

  return portDefinitions;
}

module.exports = reducer;
