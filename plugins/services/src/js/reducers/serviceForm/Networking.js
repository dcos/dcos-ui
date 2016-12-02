import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';

const defaultFieldValues = {
  containerPort: null,
  name: null,
  hostPort: null,
  automaticPort: true,
  protocol: 'tcp',
  portMapping: false,
  loadBalanced: false
};

function reducer(portDefinitions = [], state = [], {type, path = [], value}) {
  if (path == null) {
    return state;
  }

  let joinedPath = path.join('.');

  if (path.includes('portDefinitions')) {
    if (joinedPath === 'portDefinitions') {
      switch (type) {
        case ADD_ITEM:
          let portDefinition = Object.assign({}, defaultFieldValues);
          portDefinitions.push(portDefinition);
          break;
        case REMOVE_ITEM:
          portDefinitions = portDefinitions.filter((item, index) => {
            return index !== value;
          });
          break;
      }
    }

    let index = path[1];
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
