import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import Transaction from '../../../../../../src/js/structs/Transaction';
import Networking from '../../../../../../src/js/constants/Networking';

const {USER} = Networking.type;

module.exports = {
  JSONReducer: null,

  JSONParser(state) {
    let transactions = [];
    let networkType =
      findNestedPropertyInObject(state, 'container.docker.network');
    let networkName =
      findNestedPropertyInObject(state, 'ipAddress.networkName');

    if (networkType == null && networkName == null) {
      return transactions;
    }

    if (networkName != null) {
      networkType = USER;
    }

    if (networkName != null && networkType != null) {
      transactions.push(new Transaction([
        'container',
        'docker',
        'network'
      ], `${networkType}.${networkName}`));

      let groups = findNestedPropertyInObject(state, 'ipAddress.groups');
      let discovery = findNestedPropertyInObject(state, 'ipAddress.discovery');
      let labels = findNestedPropertyInObject(state, 'ipAddress.labels');

      if (groups != null) {
        transactions.push(new Transaction([
          'ipAddress',
          'groups'
        ], groups));
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
