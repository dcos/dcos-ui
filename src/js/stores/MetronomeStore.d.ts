import { EventEmitter } from "events";

declare class MetronomeStore extends EventEmitter {
  createJob(job: any): void;
  updateJob(jobId: any, job: any): void;
}

declare var store: MetronomeStore;

export default store;
