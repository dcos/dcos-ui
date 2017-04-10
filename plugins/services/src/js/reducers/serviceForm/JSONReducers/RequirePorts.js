import {SET} from '../../../../../../../src/js/constants/TransactionTypes';

module.exports = {
  JSONReducer(state, {path, type, value}) {
    const [_base, index, field] = path;

    if (!this.requriePorts) {
      this.requriePorts = [];
    }

    if (field === 'hostPort' && type === SET) {
      this.requriePorts[index] = value > 0;
    }

    // Make sure to return null for falsy values
    return this.requriePorts.includes(true) || null;
  }
};
