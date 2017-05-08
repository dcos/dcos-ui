import { SET } from "#SRC/js/constants/TransactionTypes";

module.exports = {
  FormReducer(state, { type, path = [], value }) {
    if (this.networks == null) {
      this.networks = [{}];
    }

    const joinedPath = path.join(".");
    if (type === SET && joinedPath === "networks.0.network") {
      const [mode, name] = value.split(".");

      this.networks[0].mode = mode;
      this.networks[0].name = name;
    }
    if (type === SET && joinedPath === "networks.0.mode") {
      this.networks[0].mode = value;
    }
    if (type === SET && joinedPath === "networks.0.name") {
      this.networks[0].name = value;
    }

    return this.networks;
  }
};
