import {
  ADD_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import Networking from '../../../../../../src/js/constants/Networking';
import networkingReducer from './Networking';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';

const {HOST} = Networking.type;

module.exports = {
  /**
   * Creates portDefinitions for the JSON Editor. Only returns defintions for
   * network type HOST, but will still record changes if network is
   * something else
   * @param {Object[]} state Initial state to apply action on
   * @param {Object} action
   * @param {(ADD_ITEM|REMOVE_ITEM|SET)} action.type - action to perform
   * @param {String[]} action.path - location of value
   * @param {*} action.value - value to perform action with
   * @return {Object[]} new portDefinitions with action performed on it
   */
  JSONReducer(state = [], action) {
    const {path, value} = action;
    if (path == null) {
      return state;
    }

    if (!this.appState) {
      this.appState = {
        id: '',
        networkType: HOST
      };
    }

    const joinedPath = path.join('.');
    if (joinedPath === 'container.docker.network' && Boolean(value)) {
      this.appState.networkType = value;
    }

    if (joinedPath === 'id' && Boolean(value)) {
      this.appState.id = value;
    }

    // Apply networkingReducer to retrieve updated local state
    // Store the change no matter what network type we have
    this.portDefinitions = networkingReducer(this.portDefinitions, action);

    // We only want portDefinitions for networks of type HOST
    if (this.appState.networkType !== HOST) {
      return null;
    }

    // Create JSON port definitions from state
    return this.portDefinitions.map((portDefinition, index) => {
      const hostPort = Number(portDefinition.hostPort) || 0;
      const newPortDefinition = {
        name: portDefinition.name,
        port: hostPort,
        protocol: portDefinition.protocol
      };

      // Only set labels if port mapping is load balaced
      if (portDefinition.loadBalanced) {
        let vip = portDefinition.vip;

        if (portDefinition.vip == null) {
          vip = `${this.appState.id}:${hostPort}`;
        }

        newPortDefinition.labels = Object.assign({}, newPortDefinition.labels, {
          [`VIP_${index}`]: vip
        });
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

      const port = Number(item.port);
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

      const vip = findNestedPropertyInObject(item, `labels.VIP_${index}`);
      if (vip != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'loadBalanced'
        ], true, SET));

        if (!vip.startsWith(state.id)) {
          memo.push(new Transaction([
            'portDefinitions',
            index,
            'vip'
          ], vip, SET));
        }
      }

      if (item.labels != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'labels'
        ], item.labels, SET));
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
