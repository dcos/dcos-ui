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

function getAppState(appState, path, value) {
  if (!appState) {
    appState = {
      id: '',
      hasContainer: false,
      networkType: Networking.type.HOST
    };
  }

  if (path == null) {
    return appState;
  }

  let joinedPath = path.join('.');

  if (joinedPath === 'networking.type') {
    appState.networkType = value;
  }

  if (joinedPath === 'container.docker.image' && !!value) {
    appState.hasContainer = true;
  }

  if (joinedPath === 'id' && !!value) {
    appState.id = value;
  }

  return appState;
}

function reducer(state = [], {type, path = [], value}) {
  if (path == null) {
    return state;
  }

  let joinedPath = path.join('.');

  if (joinedPath.search('portDefinitions') !== -1) {
    if (joinedPath === 'portDefinitions') {
      switch (type) {
        case ADD_ITEM:
          let portDefinition = Object.assign({}, defaultFieldValues);
          this.portDefinitions.push(portDefinition);
          break;
        case REMOVE_ITEM:
          this.portDefinitions.filter((item, index) => {
            return index !== value;
          });
          break;
      }
    }

    let indices = joinedPath.match(/\d+/);

    if (indices != null && indices.length > 0) {
      let index = indices[0];

      if (type === SET) {
        Object.keys(defaultFieldValues).forEach((fieldKey) => {
          if (joinedPath === `portDefinitions.${index}.${fieldKey}`) {
            this.portDefinitions[index][fieldKey] = value;
          }
        });
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
    this.appState = getAppState(this.appState, path, value);
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
