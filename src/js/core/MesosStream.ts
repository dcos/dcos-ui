import { stream } from "@dcos/mesos-client";
import { timer } from "rxjs";
import { repeatWhen } from "rxjs/operators";

const RECONNECTION_DELAY = 2000;

export const MesosStreamType = Symbol("MesosStreamType");
export default stream({ type: "SUBSCRIBE" }, "/mesos/api/v1?subscribe").pipe(
  repeatWhen(() => timer(RECONNECTION_DELAY))
);
