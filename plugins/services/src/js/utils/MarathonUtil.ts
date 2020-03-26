import { findNestedPropertyInObject } from "#SRC/js/utils/Util";

import VolumeDefinitions from "../constants/VolumeDefinitions";
import VolumeStatus from "../constants/VolumeStatus";

function parseApp(app) {
  const { id, tasks = [], container = {} } = app;

  if (id == null || !id.startsWith("/") || id.endsWith("/")) {
    throw new Error(
      `Id (${id}) must start with a leading slash ("/") ` +
        "and should not end with a slash."
    );
  }

  if (container == null || !Array.isArray(container.volumes)) {
    return app;
  }

  const volumeDefinitionMap = new Map();
  const volumes = [];

  // Parse container volumes to extract external volumes
  // and persistent volume definitions
  container.volumes.forEach(({ containerPath, external, mode, persistent }) => {
    if (external != null) {
      volumes.push({
        containerPath,
        id: external.name,
        mode,
        status: VolumeStatus.UNAVAILABLE,
        type: VolumeDefinitions.EXTERNAL.type,
        ...external,
      });
    }

    if (persistent != null) {
      const { size } = persistent;

      volumeDefinitionMap.set(containerPath, {
        type: VolumeDefinitions.PERSISTENT.type,
        mode,
        size,
      });
    }
  });

  if (tasks == null || !Array.isArray(tasks)) {
    return {
      volumes,
      ...app,
    };
  }

  tasks.forEach(({ host, id: taskID, localVolumes, startedAt }) => {
    let status = VolumeStatus.DETACHED;
    if (startedAt != null) {
      status = VolumeStatus.ATTACHED;
    }

    if (!Array.isArray(localVolumes)) {
      return;
    }

    localVolumes.forEach(({ containerPath, persistenceId: id }) => {
      const volumeDefinition = volumeDefinitionMap.get(containerPath);
      const volume = {
        ...volumeDefinition,
        status,
        host,
        containerPath,
        id,
        taskID,
      };

      volumes.push(volume);
    });
  });

  return {
    volumes,
    ...app,
  };
}

function parsePod(pod) {
  const { id, spec, instances } = pod;
  const { volumes } = spec;

  if (id == null || !id.startsWith("/") || id.endsWith("/")) {
    throw new Error(
      `Id (${id}) must start with a leading slash ("/") ` +
        "and should not end with a slash."
    );
  }

  if (volumes == null || !Array.isArray(volumes)) {
    return pod;
  }

  const volumeDefinitionMap = new Map();
  const volumeData = [];

  // Parse container volumes to extract external volumes
  // and persistent volume definitions
  volumes
    .filter(({ persistent }) => persistent != null)
    .forEach(({ name, mode, persistent }) => {
      const { size } = persistent;

      volumeDefinitionMap.set(name, {
        type: VolumeDefinitions.PERSISTENT.type,
        mode,
        size,
      });
    });

  if (instances == null || !Array.isArray(instances)) {
    return {
      volumeData,
      ...pod,
    };
  }

  instances.forEach(
    ({ agentId: host, id: taskID, localVolumes, status: statusCode }) => {
      let status = VolumeStatus.DETACHED;
      if (statusCode === "STABLE") {
        status = VolumeStatus.ATTACHED;
      }

      if (!Array.isArray(localVolumes)) {
        return;
      }

      const containers = findNestedPropertyInObject(pod, "spec.containers");

      const mounts = containers
        .filter(({ volumeMounts = [] }) => volumeMounts.length > 0)
        .reduce((memo, { name: containerName, volumeMounts = [] }) => {
          volumeMounts.forEach(({ name, mountPath }) => {
            if (memo[name] == null) {
              memo[name] = [];
            }

            memo[name] = [
              ...memo[name],
              {
                containerName,
                mountPath,
              },
            ];
          });

          return memo;
        }, {});

      volumeData.push(
        ...localVolumes.map(({ containerPath, persistenceId: id }) => {
          const volumeDefinition = volumeDefinitionMap.get(containerPath);

          return {
            ...volumeDefinition,
            status,
            host,
            containerPath,
            id,
            mounts: mounts[containerPath],
            taskID,
          };
        })
      );
    }
  );

  return {
    volumeData,
    ...pod,
  };
}

const MarathonUtil = {
  parseGroups({ id = "/", groups = [], apps = [], pods = [], enforceRole }) {
    if (id !== "/" && (!id.startsWith("/") || id.endsWith("/"))) {
      throw new Error(
        `Id (${id}) must start with a leading slash ("/") ` +
          "and should not end with a slash, except for root id which is only " +
          "a slash."
      );
    }

    // Parse items
    const items = [].concat(
      groups.map(this.parseGroups.bind(this)),
      apps.map(parseApp),
      pods.map(parsePod)
    );

    const result = { id, items };
    if (enforceRole !== undefined) {
      result.enforceRole = enforceRole;
    }
    return result;
  },
};

export default MarathonUtil;
