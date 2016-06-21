import VolumeTypes from '../constants/VolumeTypes'
import VolumeStatus from '../constants/VolumeStatus'

function parseApp(app) {
  let {id, tasks = [], container = {}} = app;

  if (id == null || !id.startsWith('/') || id.endsWith('/')) {
    throw new Error(`Id (${id}) must start with a leading slash ("/") ` +
      'and should not end with a slash.');
  }

  if (container == null || !Array.isArray(container.volumes)) {
    return app;
  }

  let volumeDefinitionMap = new Map();
  let volumes = [];

  // Parse container volumes to extract external volumes
  // and persistent volume definitions
  container.volumes.forEach(
    function ({containerPath, external, mode, persistent}) {
      if (external != null) {
        volumes.push(Object.assign({
          containerPath,
          id: external.name,
          mode,
          status: VolumeStatus.UNAVAILABLE,
          type: VolumeTypes.EXTERNAL
        }, external));
      }

      if (persistent != null) {
        volumeDefinitionMap.set(containerPath,
          Object.assign({type: VolumeTypes.PERSISTENT, mode}, persistent)
        );
      }
    }
  );

  if (tasks == null || !Array.isArray(tasks)) {
    return Object.assign({volumes}, app);
  }

  tasks.forEach(function ({host, id:taskID, localVolumes, startedAt}) {
    let status = VolumeStatus.DETACHED;
    if (startedAt != null) {
      status = VolumeStatus.ATTACHED;
    }

    if (!Array.isArray(localVolumes)) {
      return;
    }

    localVolumes.forEach(function ({containerPath, persistenceId:id}) {
      let volumeDefinition = volumeDefinitionMap.get(containerPath);
      let volume = Object.assign({}, volumeDefinition,
        {status, host, containerPath, id, taskID});

      volumes.push(volume);
    });
  });

  return Object.assign({volumes}, app);
}

const MarathonUtil = {
  parseGroups({id = '/', groups = [], apps = []}) {
    if (id !== '/' && (!id.startsWith('/') || id.endsWith('/'))) {
      throw new Error(`Id (${id}) must start with a leading slash ("/") ` +
        'and should not end with a slash, except for root id which is only ' +
        'a slash.');
    }

    // Parse items
    let items = [].concat(groups.map(this.parseGroups.bind(this)),
      apps.map(parseApp));

    return {id, items};
  }
};

module.exports = MarathonUtil;
