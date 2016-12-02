import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import Transaction from '../../../../../../src/js/structs/Transaction';

module.exports = {
  JSONReducer: null,

  JSONParser(state) {
    let transactions = [];
    let networkType = findNestedPropertyInObject(state,
        'container.docker.network');
    let networkName = findNestedPropertyInObject(state, 'ipAddress.networkName');

    if (networkType == null) {
      return [];
    }

    if (networkName != null && networkType != null) {
      transactions.push(new Transaction([
        'container',
        'docker',
        'network'
      ], `${networkType}.${networkName}`));

      let group = findNestedPropertyInObject(state, 'ipAddress.group');
      let discovery = findNestedPropertyInObject(state, 'ipAddress.discovery');
      let labels = findNestedPropertyInObject(state, 'ipAddress.labels');

      if (group != null) {
        transactions.push(new Transaction([
          'ipAddress',
          'group'
        ], group));
      }

      if (labels != null) {
        transactions.push(new Transaction([
          'ipAddress',
          'labels'
        ], labels));
      }

      if (discovery != null) {
        transactions.push(new Transaction([
          'ipAddress',
          'discovery'
        ], discovery));
      }
    } else {
      transactions.push(new Transaction([
        'container',
        'docker',
        'network'
      ], networkType));
    }

    return transactions;

  },

  FormReducer: null
};
