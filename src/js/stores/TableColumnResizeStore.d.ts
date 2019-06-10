import { EventEmitter } from "events";

class TableColumnResizeStore extends EventEmitter {
  get(tableId: string): { [key: string]: number };
  set(tableId: string, columnWidths: object): () => void;
}

export default new TableColumnResizeStore();
