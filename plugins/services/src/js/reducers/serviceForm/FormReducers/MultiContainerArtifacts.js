import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../../src/js/constants/TransactionTypes';

module.exports = {
  FormReducer(state = [], {type, path = [], value}) {
    let newState = [].concat(state);

    // eslint-disable-next-line no-unused-vars
    const [_, index, field, secondIndex, name, subField] = path;

    if (field !== 'artifacts') {
      return state;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({uri: null});
        break;
      case REMOVE_ITEM:
        newState =
          newState.filter((item, index) => {
            return index !== value;
          });
        break;
      case SET:
        newState[secondIndex][name] = value;
        break;
    }

    return newState;
  }
};
