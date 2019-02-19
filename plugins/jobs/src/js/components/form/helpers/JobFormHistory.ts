import { UcrContainer, DockerContainer, JobFormUIData } from "./JobFormData";

/**
 * The JobFormHistory class tracks the last entered state of form fields or objects
 * that are conditionally removed from form data, with the intent of preserving this
 * state if the user decides to return to return to that option.
 *
 * The only pieces of state that need to be added to history are ones that could be
 * conditionally deleted from the form data, but still may need to be remembered later.
 * It is left up to the form update components to decide when it is relevant
 * to add or access items from history.
 *
 * For example, if cmdOnly is chosen in the jobs form, we must remove any `ucr` or `docker`
 * object properties that exist in the form data. However, we want to remember what had been
 * assigned to these properties in case the user decides to return to using an explicit container.
 *
 * In this situation, whenever, `docker` or `ucr` are removed from the form data, they are added
 * to history using the `add` method, so that later they can be accessed using the `get` method
 * if needed.
 *
 * This solution is different from the Batch/Transaction method because it does not keep track
 * of every change to the form, it just keeps track of the last known state of specific objects/fields
 * so that they can be accessed later.
 */
export class JobFormHistory {
  ucr: Partial<UcrContainer>;
  docker: Partial<DockerContainer>;
  gpus: number;

  constructor(formData: JobFormUIData) {
    this.ucr = formData.job.run.ucr || {};
    this.docker = formData.job.run.docker || {};
    this.gpus = formData.job.run.gpus || 0;
  }

  add(item: keyof JobFormHistory, value: any) {
    this[item] = value;
  }

  get(item: keyof JobFormHistory) {
    return this[item];
  }
}
