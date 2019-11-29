import { EventEmitter } from "events";
import Util from "../utils/Util";
import UserSettingsStore from "./UserSettingsStore";
import { SAVED_STATE_KEY } from "../constants/UserSettings";

const getColumnWidths = tableId =>
  Util.findNestedPropertyInObject(
    UserSettingsStore.getKey(SAVED_STATE_KEY),
    tableId
  ) || {};

class TableColumnResizeStore extends EventEmitter {
  get(tableId) {
    return getColumnWidths(tableId);
  }

  set(tableId, columnWidths) {
    const savedStates = UserSettingsStore.getKey(SAVED_STATE_KEY) || {};

    savedStates[tableId] = columnWidths;

    UserSettingsStore.setKey(SAVED_STATE_KEY, savedStates);
  }
}

export default new TableColumnResizeStore();
