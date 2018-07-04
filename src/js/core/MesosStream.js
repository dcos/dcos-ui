import { stream } from "@dcos/mesos-client";
import { Observable } from "rxjs/Observable";

const RECONNECTION_DELAY = 2000;

export const MesosStreamType = Symbol("MesosStreamType");
export default stream(
  { type: "SUBSCRIBE" },
  "/mesos/api/v1?subscribe"
).repeatWhen(() => Observable.timer(RECONNECTION_DELAY));
