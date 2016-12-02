import {combineReducers, simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';
import networkingReducer from './Networking';
import Networking from '../../../../../../src/js/constants/Networking';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';

const {BRIDGE, HOST, USER} = Networking.type;

module.exports = combineReducers({
  privileged: simpleReducer('container.docker.privileged', null),
  forcePullImage: simpleReducer('container.docker.forcePullImage', null),
  image: simpleReducer('container.docker.image', ''),
  network(state, {type, path = [], value}) {
    let joinedPath = path.join('.');

    if (type === SET && joinedPath === 'container.docker.network') {
      return Networking.type[value];
    }

    return state;
  },
  portMappings(state, action) {
    let {path = [], value} = action;
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

    // We only want portMappings for networks of type BRIDGE or USER
    if (this.appState.networkType !== BRIDGE &&
      this.appState.networkType !== USER) {
      return null;
    }

    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // Convert portDefinitions to portMappings
    return this.portDefinitions.map((portDefinition, index) => {
      let hostPort = Number(this.portDefinitions[index].hostPort) || 0;
      let containerPort = Number(this.portDefinitions[index].containerPort) || 0;
      let newPortDefinition = {
        name: portDefinition.name,
        hostPort,
        containerPort,
        protocol: portDefinition.protocol
      };

      // Only set labels if port mapping is load balaced
      if (this.portDefinitions[index].loadBalanced) {
        newPortDefinition.labels = {
          [`VIP_${index}`]: `${this.appState.id}:${hostPort}`
        };
      }

      return newPortDefinition;
    });
  }
});
