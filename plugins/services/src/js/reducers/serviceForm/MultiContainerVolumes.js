import {
  ADD_ITEM,
  REMOVE_ITEM
} from "../../../../../../src/js/constants/TransactionTypes";
import Transaction from "../../../../../../src/js/structs/Transaction";

/*
 * transformContainers
 * converts nested container - volumeMounts structure into flat array of tuples
 */
function transformContainers(memo, container, containerIndex) {
  if (container.volumeMounts == null) {
    return memo;
  }

  const tuples = container.volumeMounts.map(mount => {
    return [containerIndex, mount];
  });

  return memo.concat(tuples);
}

module.exports = {
  JSONReducer(state = [], { type, path, value }) {
    const [base, index, name] = path;

    if (base !== "volumeMounts") {
      return state;
    }

    let newState = state.slice();

    switch (type) {
      case ADD_ITEM:
        newState.push({});
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => index !== value);
        break;
    }

    if (name === "name") {
      newState[index].name = value;
    }

    return newState;
  },

  JSONParser(state) {
    if (state == null) {
      return [];
    }

    const volumes = [];
    const volumeIndexMap = {};

    let transactions = [];

    if (state.volumes != null) {
      const volumeTransaction = state.volumes.reduce((memo, volume) => {
        if (volume.name == null) {
          return memo;
        }
        volumeIndexMap[volume.name] = volumes.push(volume.name) - 1;

        return memo.concat(
          new Transaction(
            ["volumeMounts"],
            volumeIndexMap[volume.name],
            ADD_ITEM
          ),
          new Transaction(
            ["volumeMounts", volumeIndexMap[volume.name], "name"],
            volume.name
          )
        );
      }, []);

      transactions = transactions.concat(volumeTransaction);
    }

    const containers = state.containers || [];
    const containerVolumesTransactions = containers
      .reduce(transformContainers, [])
      .reduce((memo, [containerIndex, volumeMount]) => {
        const { name, mountPath } = volumeMount;

        if (volumeIndexMap[name] == null) {
          volumeIndexMap[name] = volumes.push(name) - 1;
          memo = memo.concat(
            new Transaction(["volumeMounts"], volumeIndexMap[name], ADD_ITEM),
            new Transaction(
              ["volumeMounts", volumeIndexMap[name], "name"],
              name
            )
          );
        }

        memo.push(
          new Transaction(
            ["volumeMounts", volumeIndexMap[name], "mountPath", containerIndex],
            mountPath
          )
        );

        return memo;
      }, []);

    return transactions.concat(containerVolumesTransactions);
  },

  FormReducer(state = [], { type, path, value }) {
    const [base, index, name, secondIndex] = path;

    let newState = state.slice();

    if (base === "containers") {
      switch (type) {
        case ADD_ITEM:
          newState = newState.map(volumeMount => {
            volumeMount.mountPath.push("");

            return volumeMount;
          });
          break;
        case REMOVE_ITEM:
          newState = newState.map(volumeMount => {
            volumeMount.mountPath = volumeMount.mountPath.filter(
              (item, index) => index !== value
            );

            return volumeMount;
          });
          break;
      }
    }

    if (base !== "volumeMounts") {
      return newState;
    }

    switch (type) {
      case ADD_ITEM:
        newState.push({ mountPath: [] });
        break;
      case REMOVE_ITEM:
        newState = newState.filter((item, index) => index !== value);
        break;
    }

    if (name === "name") {
      newState[index].name = String(value);
    }
    if (name === "mountPath") {
      newState[index].mountPath[secondIndex] = String(value);
    }

    return newState;
  }
};
