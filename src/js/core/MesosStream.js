import { stream } from "@dcos/mesos-client";
import { ReplaySubject } from "rxjs/ReplaySubject";

export const MesosStreamType = Symbol("MesosStreamType");
export default stream({ type: "SUBSCRIBE" }, "/mesos/api/v1?subscribe")
  .repeat()
  .multicast(() => new ReplaySubject())
  .refCount();
