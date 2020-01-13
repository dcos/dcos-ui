import { SET, ADD_ITEM, REMOVE_ITEM } from "#SRC/js/constants/TransactionTypes";

export const FormReducer = (
  state: Array<{ uri: null | string }> = [],
  { type, path = [], value }: { type: symbol; path: string[]; value: any }
) => {
  let newState = ([] as Array<{ uri: null | string }>).concat(state);

  const [, , field, secondIndex, name] = path;

  if (field !== "artifacts") {
    return state;
  }

  switch (type) {
    case ADD_ITEM:
      newState.push({ uri: null });
      break;
    case REMOVE_ITEM:
      newState = newState.filter((_: any, index) => index !== value);
      break;
    case SET:
      newState[secondIndex][name] = value;
      break;
  }

  return newState;
};
