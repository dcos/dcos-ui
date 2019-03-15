import { ADD_ITEM, SET, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";

export default {
  FormReducer(state, { type, path = [], value }) {
    if (path == null) {
      return state;
    }

    if (this.networks == null) {
      this.networks = [];
    }

    const [base, index, field] = path;

    if (base === "networks") {
      if (type === ADD_ITEM) {
        this.networks.push(value || {});
      }
      if (type === REMOVE_ITEM) {
        this.networks = this.networks.filter((item, index) => {
          return index !== value;
        });
      }
      if (type === SET && field === "network") {
        const [mode, name] = value.split(".");
        this.networks[index] = {};
        this.networks[index].mode = mode;
        this.networks[index].name = name;
      }
      if (type === SET && field === "name") {
        this.networks[index].name = value;
      }
      if (type === SET && field === "mode") {
        this.networks[index].mode = value;
      }
    }

    return this.networks;
  }
};
