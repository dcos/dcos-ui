import { ADD_ITEM, SET, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import Networking from "#SRC/js/constants/Networking";

const { CONTAINER } = Networking.type;

module.exports = {
  JSONReducer(state = [], { type, path, value }) {
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

    return this.networks.map(function(network) {
      return {
        ...network,
        mode: Networking.internalToJson[network.mode]
      };
    });
  },

  JSONParser(state) {
    const transactions = (state.networks || [])
      .reduce(function(memo, network, index) {
        const name = network.name;
        const mode = name != null ? CONTAINER : network.mode;

        memo = memo.concat(new Transaction(["networks"], network, ADD_ITEM));

        if (mode == null && name == null) {
          return memo;
        }

        if (name != null) {
          memo = memo.concat(
            new Transaction(["networks", index, "name"], name)
          );
        }
        if (mode != null) {
          const internalMode = Networking.jsonToInternal[mode.toLowerCase()];

          memo = memo.concat(
            new Transaction(["networks", index, "mode"], internalMode)
          );
        }

        return memo;
      }, []);

    return transactions;
  }
};
