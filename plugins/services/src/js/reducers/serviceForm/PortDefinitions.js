import {
  ADD_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
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

  JSONParser(state) {
    if (state.portDefinitions == null) {
      return [];
    }

    // Look at portDefinitions and add accepted fields
    return state.portDefinitions.reduce(function (memo, item, index) {
      memo.push(new Transaction(['portDefinitions'], index, ADD_ITEM));

      if (item.name != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'name'
        ], item.name, SET));
      }

      let port = Number(item.port);
      // If port is a number but not zero, we set automaticPort to false
      // so we can set the port
      if (!isNaN(port) && port !== 0) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'automaticPort'
        ], false, SET));

        memo.push(new Transaction([
          'portDefinitions',
          index,
          'hostPort'
        ], port, SET));
      }

      // If port is zero, we set automaticPort to true
      if (!isNaN(port) && port === 0) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'automaticPort'
        ], true, SET));
      }

      if (item.protocol != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'protocol'
        ], item.protocol, SET));
      }

      if (item.labels != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'loadBalanced'
        ], true, SET));
      }

      return memo;
    }, []);
  },

  FormReducer(state = [], action) {
    this.portDefinitions = networkingReducer(this.portDefinitions, state, action);

    return this.portDefinitions;
  }
};
