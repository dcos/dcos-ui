import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";

export default {
  FormReducer(state = [], { type, path = [], value }) {
    let newState = [].concat(state);

    const [_, _index, field, secondIndex, name, _subField] = path;

    if (field !== "artifacts") {
      return state;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({ uri: null });
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => {
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
