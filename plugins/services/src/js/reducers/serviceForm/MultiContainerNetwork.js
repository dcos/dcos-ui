import Networking from "#SRC/js/constants/Networking";
import { SET, ADD_ITEM } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

export default {
  JSONReducer(
    state = [{ mode: Networking.type.HOST.toLowerCase() }],
    { type, path, value }
  ) {
    const [element, index = 0, field] = path;

    const newState = state.slice();
    if (element === "networks") {
      if (type === ADD_ITEM && index !== 0) {
        newState.push(value || { mode: Networking.type.HOST.toLowerCase() });

        return newState;
      }

      if (type === SET && field === "name") {
        newState[index].name = value;

        return newState;
      }

      if (type === SET && field === "mode") {
        newState[index].mode = value.toLowerCase();

        return newState;
      }

      if (type === SET && typeof value === "string") {
        const [mode, name] = value.split(".");

        if (mode === Networking.type.CONTAINER) {
          newState[index] = {
            name,
            mode: mode.toLowerCase()
          };

          return newState;
        }

        newState[index] = {
          mode: mode.toLowerCase()
        };
      }
    }

    return newState;
  },

  JSONParser(state) {
    if (
      state == null ||
      state.networks == null ||
      !Array.isArray(state.networks)
    ) {
      return [];
    }

    if (state.networks.length === 0) {
      return [
        new Transaction(["networks"], {}, ADD_ITEM),
        new Transaction(["networks", 0], Networking.type.HOST)
      ];
    }

    return state.networks.reduce((memo, network, index) => {
      memo.push(new Transaction(["networks"], network, ADD_ITEM));

      if (network.mode == null) {
        return memo;
      }

      if (network.mode === Networking.type.CONTAINER.toLowerCase()) {
        const mode = Networking.type.CONTAINER;
        const name = network.name;

        memo.push(new Transaction(["networks", index], `${mode}.${name}`));

        return memo;
      }

      memo.push(
        new Transaction(["networks", index], network.mode.toUpperCase())
      );

      return memo;
    }, []);
  },

  FormReducer(state = [{ mode: Networking.type.HOST }], { type, path, value }) {
    const [element, index = 0, field] = path;

    const newState = state.slice();
    if (element === "networks") {
      if (type === ADD_ITEM && index !== 0) {
        newState.push(value || { mode: Networking.type.HOST });

        return newState;
      }

      if (type === SET && field === "name") {
        newState[index].name = value;

        return newState;
      }

      if (type === SET && field === "mode") {
        newState[index].mode = value;

        return newState;
      }

      if (type === SET && typeof value === "string") {
        const [mode, name] = value.split(".");

        if (mode === Networking.type.CONTAINER) {
          newState[index] = {
            name,
            mode
          };

          return newState;
        }

        newState[index] = {
          mode
        };
      }
    }

    return newState;
  }
};
