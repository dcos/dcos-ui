import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";

export default {
  JSONReducer(state, { type, path, value }) {
    if (path == null) {
      return state;
    }

    if (this.labels == null) {
      // `this` is referring to a context which is given to every reducer so
      // it can cache information.
      // In this case we are caching an array structure and although the
      // output structure is a object. But this enables us to not overwrite
      // values if there are two values with the same key temporarily.
      this.labels = [];
    }

    const joinedPath = path.join(".");

    if (joinedPath.search("labels") !== -1) {
      if (joinedPath === "labels") {
        switch (type) {
          case ADD_ITEM:
            this.labels.push({ key: null, value: "" });
            break;
          case REMOVE_ITEM:
            this.labels = this.labels.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return this.labels.reduce((memo, item) => {
          if (item.key != null) {
            memo[item.key] = item.value;
          }

          return memo;
        }, {});
      }

      const index = joinedPath.match(/\d+/)[0];
      if (type === SET && `labels.${index}.key` === joinedPath) {
        this.labels[index].key = value;
      }
      if (type === SET && `labels.${index}.value` === joinedPath) {
        this.labels[index].value = value;
      }
    }

    return this.labels.reduce((memo, item) => {
      if (item.key != null) {
        memo[item.key] = item.value;
      }

      return memo;
    }, {});
  },

  JSONParser(state) {
    if (state.labels == null) {
      return [];
    }

    return Object.keys(state.labels).reduce(function(memo, key, index) {
      /**
       * For the labels which are a key => value based object we want to
       * create a new item and fill it with the key and the value. So we
       * need 3 transactions for each key value pair.
       * 1) Add a new Item to the path with the index equal to index.
       * 2) Set the key on the path `labels.${index}.key`
       * 3) Set the value on the path `labels.${index}.value`
       */
      memo.push(new Transaction(["labels"], index, ADD_ITEM));
      memo.push(new Transaction(["labels", index, "key"], key, SET));
      memo.push(
        new Transaction(["labels", index, "value"], state.labels[key], SET)
      );

      return memo;
    }, []);
  }
};
