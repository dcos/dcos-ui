import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";

module.exports = {
  JSONReducer(__, { type, path = [], value }) {
    const [_, index, field, secondIndex, name, _subField] = path;

    if (field !== "artifacts") {
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
        this.artifactState[index].push({ uri: null });
        break;
      case REMOVE_ITEM:
        this.artifactState[index] = this.artifactState[index].filter(
          (item, index) => {
            return index !== value;
          }
        );
        break;
      case SET:
        this.artifactState[index][secondIndex][name] = value;
        break;
    }

    return this.artifactState;
  }
};
