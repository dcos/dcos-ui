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
  container.volumes.forEach(function({
    containerPath,
    external,
    mode,
    persistent
  }) {
    if (external != null) {
      volumes.push(
        Object.assign(
          {
            containerPath,
            id: external.name,
            mode,
            status: VolumeStatus.UNAVAILABLE,
            type: VolumeDefinitions.EXTERNAL.type
          },
          external
        )
      );
    }

    if (persistent != null) {
      const { size } = persistent;

      volumeDefinitionMap.set(containerPath, {
        type: VolumeDefinitions.PERSISTENT.type,
        mode,
        size
      });
    }
  });

  if (tasks == null || !Array.isArray(tasks)) {
    return Object.assign({ volumes }, app);
  }

  tasks.forEach(function({ host, id: taskID, localVolumes, startedAt }) {
    let status = VolumeStatus.DETACHED;
    if (startedAt != null) {
      status = VolumeStatus.ATTACHED;
    }

    if (!Array.isArray(localVolumes)) {
      return;
    }

    localVolumes.forEach(function({ containerPath, persistenceId: id }) {
      const volumeDefinition = volumeDefinitionMap.get(containerPath);
      const volume = Object.assign({}, volumeDefinition, {
        status,
        host,
        containerPath,
        id,
        taskID
      });

      volumes.push(volume);
    });
  });

  return Object.assign({ volumes }, app);
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
  volumes.forEach(function({ name, mode, persistent }) {
    if (persistent != null) {
      const { size } = persistent;

      volumeDefinitionMap.set(name, {
        type: VolumeDefinitions.PERSISTENT.type,
        mode,
        size
      });
    }
  });

  if (instances == null || !Array.isArray(instances)) {
    return Object.assign({ volumeData }, pod);
  }

  instances.forEach(function({
    agentId: host,
    id: taskID,
    localVolumes,
    status: statusCode
  }) {
    let status = VolumeStatus.DETACHED;
    if (statusCode === "STABLE") {
      status = VolumeStatus.ATTACHED;
    }

    if (!Array.isArray(localVolumes)) {
      return;
    }

    const mounts = pod.spec.containers.reduce(function(
      memo,
      { name: containerName, volumeMounts = [] }
    ) {
      if (volumeMounts.length > 0) {
        volumeMounts.forEach(function(volumeMount) {
          const { name } = volumeMount;

          if (memo[name] == null) {
            memo[name] = [];
          }

          memo[name] = [
            ...memo[name],
            {
              containerName,
              mountPath: volumeMount.mountPath
            }
          ];
        });
      }

      return memo;
    }, {});

    localVolumes.forEach(function({ containerPath, persistenceId: id }) {
      const volumeDefinition = volumeDefinitionMap.get(containerPath);
      const volume = Object.assign({}, volumeDefinition, {
        status,
        host,
        containerPath,
        id,
        mounts: mounts[containerPath],
        taskID
      });

      volumeData.push(volume);
    });
  });

  return Object.assign({ volumeData }, pod);
}

const MarathonUtil = {
  parseGroups({ id = "/", groups = [], apps = [], pods = [] }) {
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

    return { id, items };
  }
};

module.exports = MarathonUtil;
