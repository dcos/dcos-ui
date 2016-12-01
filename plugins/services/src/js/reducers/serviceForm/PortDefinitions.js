import Networking from '../../../../../../src/js/constants/Networking';
import networkingReducer from './Networking';

module.exports = {
  JSONReducer(state = [], action) {
    let {path, value} = action;
    if (!this.appState) {
      this.appState = {
        id: '',
        networkType: Networking.type.HOST
      };
    }

    let joinedPath = path.join('.');
    if (joinedPath === 'networking.type') {
      this.appState.networkType = value;
    }

    if (joinedPath === 'id' && !!value) {
      this.appState.id = value;
    }

    this.portDefinitions = networkingReducer(this.portDefinitions, state, action);

    return this.portDefinitions.map((portDefinition, index) => {
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
    this.portDefinitions = networkingReducer(this.portDefinitions, state, action);

    return this.portDefinitions;
  }
};
