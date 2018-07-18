import Rx, { ReplaySubject } from "rxjs";
import { request } from "@dcos/mesos-client";

import Config from "./config/Config";
import { linearBackoff } from "./utils/rxjsUtils";
import { MesosStreamType } from "./core/MesosStream";
import container from "./container";

const MAX_RETRIES = 5;
const RETRY_DELAY = 500;
const MAX_RETRY_DELAY = 5000;

const mesosStream = container.get(MesosStreamType);
const getMasterRequest = request(
  { type: "GET_MASTER" },
  "/mesos/api/v1?get_master"
).retryWhen(linearBackoff(RETRY_DELAY, MAX_RETRIES));

const subject = new ReplaySubject();
const dataStream = mesosStream
  .merge(getMasterRequest)
  .distinctUntilChanged()
  .do(message => subject.next(message));

const waitStream = getMasterRequest.zip(mesosStream.take(1));
const eventTriggerStream = dataStream.merge(
  Rx.Observable.interval(Config.getRefreshRate())
);

const stream = waitStream
  .concat(eventTriggerStream)
  .sampleTime(Config.getRefreshRate() * 0.5)
  .retryWhen(linearBackoff(RETRY_DELAY, -1, MAX_RETRY_DELAY))
  .multicast(() => new ReplaySubject())
  .refCount();

// eslint-disable-next-line
onconnect = function(event) {
  console.log("Connected!");
  const port = event.ports[0];

  stream.subscribe(function() {});
  subject.subscribe(message => port.postMessage(message));
};
