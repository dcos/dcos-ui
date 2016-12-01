import {combineReducers, simpleReducer} from '../../../../../../src/js/utils/ReducerUtil';
import networkingReducer from './Networking';
import Networking from '../../../../../../src/js/constants/Networking';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';

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
      if (this.appState.networkType === Networking.type.BRIDGE ||
        this.appState.networkType === Networking.type.USER) {
        let hostPort = Number(this.portDefinitions[index].hostPort) || 0;
        let containerPort = Number(this.portDefinitions[index].containerPort) || 0;
        let newPortDefinition = {
          name: portDefinition.name,
          hostPort,
          containerPort,
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
  }
});
