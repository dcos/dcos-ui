import { EventEmitter } from "events";

declare class MetronomeStore extends EventEmitter {
  createJob(job: any): void;
  updateJob(jobId: any, job: any): void;
  runJob(jobId: string): void;
  toggleSchedule(jobId: string, isEnabled: boolean): void;
  deleteJob(jobId: string, stopCurrentJobRuns: boolean): void;
}

declare var store: MetronomeStore;

export default store;
