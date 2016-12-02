import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {
  ADD_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer: null,

  /**
   * This parser must take precedence over PortDefinition parser, as it assumes
   * some data available from it
   * @param {Object} state current appConfig
   * @returns {Transaction[]} A list of transactions resulting _portDefinition_
   * settings. NOT portMappings! The source of truth is portDefinitions, but
   * portMapping takes preceedence.
   */
  JSONParser(state) {
    let portMappings = findNestedPropertyInObject(
      state,
      'container.docker.portMappings'
    );
    let portDefinitionsLength = findNestedPropertyInObject(
      state,
      'portDefinitions.length'
    ) || 0;

    if (portMappings == null) {
      return [];
    }

    // Add additional fields if we have more definitions in portMappings
    // than in portDefinitions
    let length = portMappings.length - portDefinitionsLength;
    let addTransactions = [];
    Array.from({length}).forEach((_, index) => {
      addTransactions.push(
        new Transaction(['portDefinitions'], portMappings.length + index - 1, ADD_ITEM)
      );
    });

    // Look at portMappings and add accepted fields
    // but translate them into portDefinitions
    return portMappings.reduce(function (memo, item, index) {
      if (item.name != null) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'name'
        ], item.name, SET));
      }

      let hostPort = Number(item.hostPort);
      if (!isNaN(hostPort) && hostPort !== 0) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'automaticPort'
        ], false, SET));

        memo.push(new Transaction([
          'portDefinitions',
          index,
          'hostPort'
        ], hostPort, SET));
      }
      if (!isNaN(hostPort) && hostPort === 0) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'automaticPort'
        ], true, SET));
      }

      let containerPort = Number(item.containerPort);
      if (!isNaN(containerPort)) {
        memo.push(new Transaction([
          'portDefinitions',
          index,
          'containerPort'
        ], containerPort, SET));
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
    }, addTransactions);
  },

  FormReducer: null
};
