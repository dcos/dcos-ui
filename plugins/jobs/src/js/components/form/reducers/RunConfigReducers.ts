import {
  JobSpec,
  JobFormActionType,
  ArrayLabels,
  JobArtifact,
  RestartPolicy
} from "../helpers/JobFormData";
import { deepCopy, findNestedPropertyInObject } from "#SRC/js/utils/Util";

const updateLabels = (
  state: JobSpec,
  updateFn: (_: ArrayLabels) => ArrayLabels
) => ({
  ...state,
  job: {
    ...state.job,
    labels: updateFn(Array.isArray(state.job.labels) ? state.job.labels : [])
  }
});

const updateArtifacts = (
  state: JobSpec,
  updateFn: (_: JobArtifact[]) => JobArtifact[]
) => ({
  ...state,
  job: {
    ...state.job,
    run: {
      ...state.job.run,
      artifacts: updateFn(
        Array.isArray(state.job.run.artifacts) ? state.job.run.artifacts : []
      )
    }
  }
});

// TODO: refactor labels to Array<{key: string, value: string}>
// so this thing gets obsolete.
const updateTuple = <A, B>(
  [fst, snd]: [A, B],
  what: string,
  value: any
): [A, B] => {
  switch (what) {
    case "key":
      return [value, snd];
    case "value":
      return [fst, value];
    default:
      throw new Error(`can't update ${what} of $([fst, snd])`);
  }
};

const labels = {
  [JobFormActionType.AddArrayItem]: (_: string, state: JobSpec) =>
    updateLabels(state, labels => labels.concat([["", ""]])),
  [JobFormActionType.RemoveArrayItem]: (index: number, state: JobSpec) =>
    updateLabels(state, labels => [
      ...labels.slice(0, index),
      ...labels.slice(index + 1)
    ]),
  [JobFormActionType.Set]: (
    value: string,
    state: JobSpec,
    [what, indexS]: string[]
  ) => {
    const index = parseInt(indexS, 10);
    return updateLabels(state, labels =>
      labels.map((v, i) => (i === index ? updateTuple(v, what, value) : v))
    );
  }
};

const artifacts = {
  [JobFormActionType.AddArrayItem]: (_: string, state: JobSpec) =>
    updateArtifacts(state, artifacts => artifacts.concat([{ uri: "" }])),
  [JobFormActionType.RemoveArrayItem]: (index: number, state: JobSpec) =>
    updateArtifacts(state, artifacts => [
      ...artifacts.slice(0, index),
      ...artifacts.slice(index + 1)
    ]),
  [JobFormActionType.Set]: (value: string, state: JobSpec, path: string[]) => {
    const [toUpdate, indexS] = path;
    const index = parseInt(indexS, 10);
    return updateArtifacts(state, artifacts =>
      artifacts.map((a, i) => {
        const newValue = ["executable", "extract", "cache"].includes(toUpdate)
          ? !a[toUpdate as keyof JobArtifact]
          : value;
        return i === index ? { ...a, [toUpdate]: newValue } : a;
      })
    );
  }
};

const activeDeadlineSeconds = {
  [JobFormActionType.SetNum]: (value: string, state: JobSpec) => {
    const seconds = parseFloat(value);
    const newValue = isNaN(seconds) ? undefined : seconds;
    const stateCopy = deepCopy(state);
    const restart = findNestedPropertyInObject(stateCopy, "job.run.restart");
    if (!restart) {
      stateCopy.job.run.restart = {
        policy: RestartPolicy.Never
      };
    }
    stateCopy.job.run.restart.activeDeadlineSeconds = newValue;
    if (!stateCopy.job.run.restart.policy) {
      stateCopy.job.run.restart.policy = RestartPolicy.Never;
    }
    return stateCopy;
  }
};

const restartPolicy = {
  [JobFormActionType.Set]: (value: string, state: JobSpec) => {
    const stateCopy = deepCopy(state);
    const restart = findNestedPropertyInObject(stateCopy, "job.run.restart");
    if (!restart) {
      stateCopy.job.run.restart = {};
    }
    stateCopy.job.run.restart.policy = value;
    return stateCopy;
  }
};

export { artifacts, labels, activeDeadlineSeconds, restartPolicy };
