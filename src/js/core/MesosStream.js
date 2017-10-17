import { stream } from "mesos-client";

export const MesosStreamType = Symbol("MesosStreamType");
export default stream({ type: "SUBSCRIBE" }).publishReplay().refCount();
