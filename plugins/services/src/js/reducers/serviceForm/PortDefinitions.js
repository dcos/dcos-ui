import {
  ADD_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import Networking from '../../../../../../src/js/constants/Networking';
import networkingReducer from './Networking';

const {BRIDGE, HOST} = Networking.type;

module.exports = {
  /**
   * Creates portDefinitions for the JSON Editor
   * @param {Object[]} state Initial state to apply action on
   * @param {Object} action
   * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
   * @param {String[]} action.path - location of value
   * @param {*} action.value - value to perform action with
   * @return {Object[]} new portDefinitions with action performed on it
   */
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

    // Apply networkingReducer to retrieve updated local state
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // Create JSON port definitions from state
    return this.portDefinitions.map((portDefinition, index) => {
      let hostPort = Number(this.portDefinitions[index].hostPort) || 0;
      let newPortDefinition = {
        name: portDefinition.name,
        port: hostPort,
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
  },

  /**
   * Parses a configuration and produces necessary Transactions for a Batch
   * to create an equal JSON configuration
   * @param {Object[]} state - Initial state to apply action on
   * @return {Transaction[]} Array of Transactions to produce
   * given configuration
   */
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

  /**
   * Creates portDefinitions for the form. This is equal to what is produced
   * by the networkingReducer
   * @param {Object[]} state - existing PortDefinitions
   * @param {Object} action
   * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
   * @param {String[]} action.path - location of value
   * @param {*} action.value - value to perform action with
   * @return {Object[]} new portDefinitions with action performed on it
   */
  FormReducer(state = [], action) {
    // Store the state locally
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // We want the portDefinitions as it comes from networking reducer
    // for the form
    return this.portDefinitions;
  }
};
