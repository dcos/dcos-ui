import { ADD_ITEM, REMOVE_ITEM, SET } from "#SRC/js/constants/TransactionTypes";
import Transaction from "#SRC/js/structs/Transaction";
import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

export function augmentConstraintsReducer(reducers) {
  return {
    ...reducers,

    constraints(state = [], { type, path, value }) {
      const constraints = reducers.constraints.bind(this);

      let newState = state.slice();

      newState = regionReducer(newState, { type, path, value }, constraints);
      newState = zoneReducer(newState, { type, path, value }, constraints);

      return [].concat(
        reducers.constraints.bind(this)(newState, { type, path, value })
      );
    },
  };
}

export function regionReducer(state, { path, value }, constraints) {
  const [fieldName, index, name] = path;
  if (name === "region") {
    if (state[index] == null) {
      state = constraints(state, {
        type: ADD_ITEM,
        path: [fieldName],
        value: { type: "region" },
      });
    }
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "fieldName"],
      value: "@region",
    });
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "operator"],
      value: "IS",
    });
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "value"],
      value,
    });
    if (value === "") {
      state = constraints(state, {
        type: REMOVE_ITEM,
        path: [fieldName],
        value: parseInt(index, 10),
      });
    }
  }

  return state;
}

export function zoneReducer(state, { path, value }, constraints) {
  const [fieldName, index, name] = path;
  if (name === "zone") {
    if (state[index] == null) {
      state = constraints(state, {
        type: ADD_ITEM,
        path: [fieldName],
        value: { type: "zone" },
      });
    }
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "fieldName"],
      value: "@zone",
    });
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "operator"],
      value: "GROUP_BY",
    });
    state = constraints(state, {
      type: SET,
      path: [fieldName, index, "value"],
      value,
    });
    if (value === "") {
      state = constraints(state, {
        type: REMOVE_ITEM,
        path: [fieldName],
        value: parseInt(index, 10),
      });
    }
  }

  return state;
}
export function singleContainerJSONParser(state) {
  const { constraints } = state;
  if (constraints == null) {
    return [];
  }
  let regionProcessed = false;
  let zoneProcessed = false;

  return constraints.reduce((memo, constraint, index) => {
    if (
      constraint[0] === "@region" &&
      !regionProcessed &&
      constraint[1] === "IS"
    ) {
      memo.push(new Transaction(["constraints", index, "type"], "region"));
      regionProcessed = true;

      return memo;
    }
    if (
      constraint[0] === "@zone" &&
      !zoneProcessed &&
      constraint[1] === "GROUP_BY"
    ) {
      memo.push(new Transaction(["constraints", index, "type"], "zone"));
      zoneProcessed = true;

      return memo;
    }
    memo.push(new Transaction(["constraints", index, "type"], "default"));

    return memo;
  }, []);
}
export function multiContainerJSONParser(state) {
  const constraints = findNestedPropertyInObject(
    state,
    "scheduling.placement.constraints"
  );
  if (constraints == null) {
    return [];
  }
  let regionProcessed = false;
  let zoneProcessed = false;

  return constraints.reduce((memo, constraint, index) => {
    if (
      constraint.fieldName === "@region" &&
      !regionProcessed &&
      constraint.operator === "IS"
    ) {
      memo.push(new Transaction(["constraints", index, "type"], "region"));
      regionProcessed = true;

      return memo;
    }
    if (
      constraint.fieldName === "@zone" &&
      !zoneProcessed &&
      constraint.operator === "GROUP_BY"
    ) {
      memo.push(new Transaction(["constraints", index, "type"], "zone"));
      zoneProcessed = true;

      return memo;
    }
    memo.push(new Transaction(["constraints", index, "type"], "default"));

    return memo;
  }, []);
}
