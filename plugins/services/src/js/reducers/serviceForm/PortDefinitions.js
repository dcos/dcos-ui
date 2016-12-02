import Networking from '../../../../../../src/js/constants/Networking';
import networkingReducer from './Networking';

const {BRIDGE, HOST} = Networking.type;

module.exports = {
  JSONReducer(state = [], action) {
    let {path, value} = action;
    if (!this.appState) {
      this.appState = {
        id: '',
        networkType: HOST
      };
    }

    let joinedPath = path.join('.');
    if (joinedPath === 'container.docker.network' && Boolean(value)) {
      this.appState.networkType = value;
    }

    if (joinedPath === 'id' && Boolean(value)) {
      this.appState.id = value;
    }

    // We only want portMappings for networks of type HOST or BRIDGE
    if (this.appState.networkType !== HOST &&
      this.appState.networkType !== BRIDGE) {
      return null;
    }

    this.portDefinitions = networkingReducer(this.portDefinitions, state, action);

    return this.portDefinitions.map((portDefinition, index) => {
      let hostPort = Number(this.portDefinitions[index].hostPort) || 0;
      let newPortDefinition = {
        name: portDefinition.name,
        port: hostPort,
        protocol: portDefinition.protocol
      };

      if (this.portDefinitions[index].loadBalanced) {
        newPortDefinition.labels = {
          [`VIP_${index}`]: `${this.appState.id}:${hostPort}`
        };
      }

      return newPortDefinition;
    });
  },

  FormReducer(state = [], action) {
    this.portDefinitions = networkingReducer(this.portDefinitions, state, action);

    return this.portDefinitions;
  }
};
