import {combineReducers, simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';
import {PROTOCOLS} from '../../constants/PortDefinitionConstants';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import ContainerConstants from '../../constants/ContainerConstants';
import Networking from '../../../../../../src/js/constants/Networking';
import networkingReducer from './Networking';

const {DOCKER} = ContainerConstants.type;

const {BRIDGE, HOST, USER} = Networking.type;

function getContainerSettingsReducer(name) {
  return function (_, {type, path = [], value}) {
    const joinedPath = path.join('.');
    if (joinedPath === 'container.type' && Boolean(value)) {
      this.networkType = value;
    }
    if (type === SET && joinedPath === `container.docker.${name}`) {
      this.value = Boolean(value);
    }
    if (this.networkType === DOCKER && this.value != null) {
      return this.value;
    }

    return null;
  };
}

module.exports = combineReducers({
  privileged: getContainerSettingsReducer('privileged'),
  forcePullImage: getContainerSettingsReducer('forcePullImage'),
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
      const vipLabel = `VIP_${index}`;
      const containerPort = Number(portDefinition.containerPort) || 0;
      const servicePort = parseInt(portDefinition.servicePort, 10) || null;
      let hostPort = Number(portDefinition.hostPort) || 0;
      let labels = portDefinition.labels;
      let protocol = PROTOCOLS.filter(function (protocol) {
        return portDefinition.protocol[protocol];
      }).join(',');

      // Do not expose hostPort or protocol, when portMapping is turned off
      if (this.appState.networkType === USER && !portDefinition.portMapping) {
        hostPort = null;
        protocol = null;
      }

      // Only set VIP labels if port mapping is load balanced
      if (portDefinition.loadBalanced) {
        let vipValue = portDefinition.vip;

        if (vipValue == null) {
          // Prefer container port
          // because this is what a user would expect to get load balanced
          const labelPort = containerPort || hostPort || 0;

          vipValue = `${this.appState.id}:${labelPort}`;
        }

        labels = Object.assign({}, labels, {[vipLabel]: vipValue});
      } else if (labels) {
        delete labels[vipLabel];
      }

      return {
        containerPort,
        hostPort,
        labels,
        protocol,
        servicePort,
        name: portDefinition.name
      };
    });
  }
});
