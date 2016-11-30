import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Networking from '../../../../../../src/js/constants/Networking';

const defaultFieldValues = {
  containerPort: null,
  name: null,
  hostPort: null,
  automaticPort: true,
  protocol: 'tcp',
  portMapping: false,
  loadBalanced: false
};

function reducer(state = [], {type, path = [], value}) {
  if (path == null) {
    return state;
  }

  let joinedPath = path.join('.');

  if (path.includes('portDefinitions')) {
    if (joinedPath === 'portDefinitions') {
      switch (type) {
        case ADD_ITEM:
          let portDefinition = Object.assign({}, defaultFieldValues);
          this.portDefinitions.push(portDefinition);
          break;
        case REMOVE_ITEM:
          this.portDefinitions.splice(value, 1);
          break;
      }
    }

    let index = path[1];
    if (index != null && type === SET) {
      Object.keys(defaultFieldValues).forEach((fieldKey) => {
        if (joinedPath === `portDefinitions.${index}.${fieldKey}`) {
          this.portDefinitions[index][fieldKey] = value;
        }
      });

      // If port is assigned automatically, remove hostPort
      if (this.portDefinitions[index].automaticPort) {
        this.portDefinitions[index].hostPort = null;
      }
    }
  }

  return this.portDefinitions;
};

module.exports = {
  JSONReducer(state = [], action) {
    if (!this.portDefinitions) {
      this.portDefinitions = [];
    }

    let {path = [], value} = action;
    if (!this.appState) {
      this.appState = {
        id: '',
        hasContainer: false,
        networkType: Networking.type.HOST
      };
    }

    let joinedPath = path.join('.');
    if (joinedPath === 'networking.type') {
      this.appState.networkType = value;
    }

    if (joinedPath === 'container.docker.image' && !!value) {
      this.appState.hasContainer = true;
    }

    if (joinedPath === 'id' && !!value) {
      this.appState.id = value;
    }

    let newState = Object.assign([], reducer.call(this, state, action));

    return newState.map((portDefinition, index) => {
      if (this.appState.networkType === Networking.type.HOST) {
        let port = Number(this.portDefinitions[index].hostPort) || 0;
        let newPortDefinition = {
          name: portDefinition.name,
          port,
          protocol: portDefinition.protocol
        };

        if (this.portDefinitions[index].loadBalanced) {
          newPortDefinition.labels = {
            [`VIP_${index}`]: `${this.appState.id}:${port}`
          };
        }

        return newPortDefinition;
      }
    });
  },

  JSONParser(state) {
    if (state.portDefinitions == null) {
      return [];
    }

    return state;
  },

  FormReducer(state = [], action) {
    if (!this.portDefinitions) {
      this.portDefinitions = [];
    }

    return reducer.call(this, state, action);
  }
};
