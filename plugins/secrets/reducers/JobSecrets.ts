import { deepCopy } from "#SRC/js/utils/Util";
import {
  JobSpec,
  JobFormActionType,
  JobOutput,
  JobEnv,
  JobSecrets,
  Job,
  ArrayLabels,
  EnvModel,
  JobSecretExposure,
  SecretVolume,
  JobVolume
} from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

export const jobSecretsReducers = {
  [JobFormActionType.Set]: (
    value: string,
    state: JobSpec,
    path: string[]
  ): JobSpec => {
    const stateCopy = deepCopy(state);
    const secrets = stateCopy.job.run.secrets;
    const [prop, i] = path;
    const index = parseFloat(i);
    if (secrets && Array.isArray(secrets) && index < secrets.length) {
      if (prop === "name") {
        secrets[index].exposureValue = value;
      }
      if (prop === "secret") {
        secrets[index].secretPath = value;
      }
    }
    return stateCopy;
  },
  [JobFormActionType.AddArrayItem]: (_: string, state: JobSpec): JobSpec => {
    const stateCopy = deepCopy(state);
    let secrets = stateCopy.job.run.secrets;
    if (!secrets || !Array.isArray(secrets)) {
      stateCopy.job.run.secrets = [];
      secrets = stateCopy.job.run.secrets;
    }
    secrets.push({
      exposureType: "",
      exposureValue: "",
      key: `secret${secrets.length}`,
      secretPath: ""
    });
    return stateCopy;
  },
  [JobFormActionType.RemoveArrayItem]: (
    index: number,
    state: JobSpec
  ): JobSpec => {
    const stateCopy = deepCopy(state);
    const secrets = stateCopy.job.run.secrets;
    if (secrets && Array.isArray(secrets) && index < secrets.length) {
      secrets.splice(index, 1);
    }
    return stateCopy;
  }
};

type SpecSecrets = [
  string,
  { source: string; matched?: boolean; type: "envVar" | "file" | "" }
];
interface IntermediateSpec {
  job: Job<ArrayLabels, EnvModel, JobSecrets>;
}
type Env = Array<[string, string | { secret: string }]>;

function rebuildSecrets(spec: any): JobSecretExposure[] {
  // A new list of secrets based only on env/volumes
  const result: JobSecretExposure[] = [];

  ((spec.job.run.env || []) as Env)
    .filter(([_, value]) => typeof value === "object")
    .forEach(([envName, value]) => {
      result.push({
        exposureType: "envVar",
        exposureValue: envName,
        secretPath: "",
        key: (value as { secret: string }).secret
      });
    });

  (spec.job.run.volumes || [])
    .filter(isSecretVolume)
    .forEach((v: SecretVolume) => {
      result.push({
        exposureType: "file",
        exposureValue: v.containerPath,
        secretPath: "",
        key: v.secret
      });
    });

  // Overwrite env, keeping only non-secret env
  // This seems inappropriate here
  spec.job.run.env = ((spec.job.run.env || []) as Env).filter(
    ([_, value]) => typeof value !== "object"
  );

  // Match secrets to those referenced by env/volumes
  const specSecrets: SpecSecrets[] = spec.job.run.secrets
    ? Object.entries(spec.job.run.secrets)
    : [];

  result.forEach(existingSecret => {
    const secretKey = existingSecret.key;

    specSecrets.forEach(([matchSecretKey, secret]) => {
      if (secretKey === matchSecretKey) {
        existingSecret.secretPath = secret.source;
        secret.matched = true;
        secret.type = existingSecret.exposureType;
      }
    });
  });

  // These are secrets without an entry in env/volumes. Add them back.
  specSecrets
    .filter(([_, secret]) => !secret.matched)
    .forEach(unmatchedSecret => {
      const [secretKey, secret] = unmatchedSecret;
      result.push({
        exposureType: secret.type,
        exposureValue: "",
        key: secretKey,
        secretPath: secret.source
      });
    });

  return result;
}

export const jobResponseToSpec = (jobSpec: IntermediateSpec): JobSpec => {
  const spec = deepCopy(jobSpec);

  if (spec.job.run.secrets && !spec.job.run.env && !spec.job.run.volumes) {
    // No env or volumes to consider, just copy
    spec.job.run.secrets = (Object.entries(
      spec.job.run.secrets
    ) as SpecSecrets[]).map(([secretKey, { source }]) => ({
      exposureType: "",
      exposureValue: "",
      key: secretKey,
      secretPath: source
    }));
  } else {
    spec.job.run.secrets = rebuildSecrets(spec);
  }

  return spec;
};

export const jobJsonReducers = (
  ossJsonReducerFn: (value: any, state: JobSpec, path: string[]) => JobSpec
) => ({
  [JobFormActionType.Override]: (
    value: string,
    state: JobSpec,
    path: string[]
  ): JobSpec => {
    const ossState = ossJsonReducerFn(value, state, path);
    // This weird cast is necessary because we can't adequately model the
    // oss/ee duality without leaking ee info into the open source distribution.
    return {
      ...ossState,
      ...jobResponseToSpec((ossState as unknown) as IntermediateSpec)
    };
  }
});

export function isJobVolume(tbd: JobVolume | SecretVolume): tbd is JobVolume {
  return !(tbd as SecretVolume).secret;
}

export function isSecretVolume(
  tbd: JobVolume | SecretVolume
): tbd is SecretVolume {
  return Boolean((tbd as SecretVolume).secret);
}

export const jobSpecToOutput = (jobSpec: JobOutput): JobOutput => {
  const specCopy = deepCopy(jobSpec);
  if (specCopy.run.secrets) {
    const envSecrets: JobEnv = {};
    const fileSecrets: SecretVolume[] = [];

    (specCopy.run.secrets as JobSecretExposure[])
      .filter(
        ({ exposureValue }) => exposureValue != null && exposureValue !== ""
      )
      .forEach(({ exposureType, exposureValue, key }) => {
        if (exposureType === "envVar") {
          envSecrets[exposureValue] = {
            secret: key
          };
        } else if (exposureType === "file") {
          fileSecrets.push({
            containerPath: exposureValue,
            secret: key
          });
        }
      });

    const volumes = (specCopy.run.volumes || [])
      .filter(isJobVolume) // Keep job volumes and replace secret volumes
      .concat(fileSecrets);

    if (volumes.length) {
      specCopy.run.volumes = volumes;
    } else {
      delete specCopy.run.volumes;
    }

    if (Object.keys(envSecrets).length) {
      specCopy.run.env = {
        ...specCopy.run.env,
        ...envSecrets
      };
    }

    const sourceSecrets: JobSecrets = {};
    (specCopy.run.secrets as JobSecretExposure[])
      .filter(({ secretPath }) => secretPath != null && secretPath !== "")
      .forEach(({ key, secretPath }) => {
        sourceSecrets[key] = {
          source: secretPath
        };
      });
    if (Object.keys(sourceSecrets).length) {
      specCopy.run.secrets = sourceSecrets;
    } else {
      delete specCopy.run.secrets;
    }
  }
  return specCopy;
};
