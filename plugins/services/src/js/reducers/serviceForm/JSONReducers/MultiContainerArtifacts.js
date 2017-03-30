import {
  SET,
  ADD_ITEM,
  REMOVE_ITEM
} from '../../../../../../../src/js/constants/TransactionTypes';

module.exports = {
  JSONReducer(__, {type, path = [], value}) {

    // eslint-disable-next-line no-unused-vars
    const [_, index, field, secondIndex, name, subField] = path;

    if (field !== 'artifacts') {
      return;
    }
    if (this.artifactState == null) {
      this.artifactState = [];
    }

    if (this.artifactState[index] == null) {
      this.artifactState[index] = [];
    }

    switch (type) {
      case ADD_ITEM:
        this.artifactState[index].push({uri: null});
        break;
      case REMOVE_ITEM:
        this.artifactState[index] =
          this.artifactState[index].filter((item, index) => {
            return index !== value;
          });
        break;
      case SET:
        this.artifactState[index][secondIndex][name] = value;
        break;
    }

    return this.artifactState;
  }
};
