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
    const joinedPath = path.join('.');

    if (type === SET && joinedPath === 'container.docker.network') {
      return Networking.type[value.split('.')[0]];
    }

    return state;
  },
  portMappings(state, action) {
    const {path = [], value} = action;
    if (!this.appState) {
      this.appState = {
        id: '',
        networkType: HOST
      };
    }

    const joinedPath = path.join('.');
    if (joinedPath === 'container.docker.network' && Boolean(value)) {
      this.appState.networkType = value.split('.')[0];
    }

    if (joinedPath === 'id' && Boolean(value)) {
      this.appState.id = value;
    }

    // Apply networkingReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // We only want portMappings for networks of type BRIDGE or USER
    if (this.appState.networkType !== BRIDGE &&
      this.appState.networkType !== USER) {
      return null;
    }

    // Convert portDefinitions to portMappings
    return this.portDefinitions.map((portDefinition, index) => {
      const containerPort = Number(portDefinition.containerPort) || 0;
      let hostPort = Number(portDefinition.hostPort) || 0;
      let protocol = portDefinition.protocol;
      const servicePort = parseInt(portDefinition.servicePort, 10) || null;
      const labels = portDefinition.labels;

      // Do not expose hostPort or protocol, when portMapping is turned off
      if (this.appState.networkType === USER && !portDefinition.portMapping) {
        hostPort = null;
        protocol = null;
      }

      const newPortDefinition = {
        name: portDefinition.name,
        hostPort,
        containerPort,
        protocol,
        servicePort,
        labels
      };

      // Only set labels if port mapping is load balanced
      if (portDefinition.loadBalanced) {
        let vip = portDefinition.vip;

        if (portDefinition.vip == null) {
          // Prefer container port
          const labelPort = containerPort || hostPort || 0;

          vip = `${this.appState.id}:${labelPort}`;
        }

        newPortDefinition.labels = Object.assign({}, labels, {
          [`VIP_${index}`]: vip
        });
      }

      return newPortDefinition;
    });
  }
});
