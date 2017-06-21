import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from "../../../../../../src/js/constants/TransactionTypes";
import Transaction from "../../../../../../src/js/structs/Transaction";

module.exports = {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.env == null) {
      // `this` is a context which is given to every reducer so it could
      // cache information.
      // In this case we are caching an array structure and although the
      // output structure is a object. But this enables us to not overwrite
      // values if there are two values with the same key temporarily.
      this.env = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("env") !== -1) {
      if (joinedPath === "env") {
        switch (type) {
          case ADD_ITEM:
            this.env.push({ key: null, value: null });
            break;
          case REMOVE_ITEM:
            this.env = this.env.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return this.env.reduce((memo, item) => {
          if (item.key != null || item.value != null) {
            memo[item.key] = item.value;
          }

          return memo;
        }, {});
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET && `env.${index}.key` === joinedPath) {
        this.env[index].key = value;
      }
      if (type === SET && `env.${index}.value` === joinedPath) {
        this.env[index].value = value;
      }
    }

    return this.env.reduce((memo, item) => {
      if (item.key != null || item.value != null) {
        memo[item.key] = item.value;
      }

      return memo;
    }, {});
  },

  JSONParser(state) {
    if (state.env == null) {
      return [];
    }

    return Object.keys(state.env)
      .filter(function(key) {
        return typeof state.env[key] === "string";
      })
      .reduce(function(memo, key, index) {
        /**
         * For the environment variables which are a key => value based object
         * we want to create a new item and fill it with the key and the
         * value. So we need 3 transactions for each key value pair.
         * 1) Add a new Item to the path with the index equal to index.
         * 2) Set the key on the path `env.${index}.key`
         * 3) Set the value on the path `env.${index}.value`
         */
        memo.push(new Transaction(["env"], index, ADD_ITEM));
        memo.push(new Transaction(["env", index, "key"], key, SET));
        memo.push(
          new Transaction(["env", index, "value"], state.env[key], SET)
        );

        return memo;
      }, []);
  },

  FormReducer(state = [], { type, path, value }) {
    if (path == null) {
      return state;
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("env") !== -1) {
      if (joinedPath === "env") {
        switch (type) {
          case ADD_ITEM:
            state.push({ key: null, value: null });
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET && `env.${index}.key` === joinedPath) {
        state[index].key = value;
      }
      if (type === SET && `env.${index}.value` === joinedPath) {
        state[index].value = value;
      }
    }

    return state;
  }
};
