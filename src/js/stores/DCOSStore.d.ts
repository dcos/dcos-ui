import { EventEmitter } from "events";
import JobTree from "#SRC/js/structs/JobTree";

export default class DCOSStore extends EventEmitter {
  jobTree: JobTree;
  jobDataReceived: boolean;
}
