import { JobData } from "#SRC/js/events/MetronomeClient";
import Job from "../structs/Job";

export function createJobFromFormModel(
  formModel: null | object,
  spec?: object
): Job;
export function createFormModelFromSchema(schema: object, job?: Job): object;
export function createJobSpecFromJob(job: Job): JobData;
