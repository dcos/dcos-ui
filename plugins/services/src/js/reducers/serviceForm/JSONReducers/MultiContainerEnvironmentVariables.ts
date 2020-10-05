import Transaction from "#SRC/js/structs/Transaction";
import { isKV } from "./Labels";

export const JSONParser = (state) =>
  isKV(state.environment) ? [new Transaction(["env"], state.environment)] : [];
