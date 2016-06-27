const Volumes = {
  title: 'Volumes',
  type: 'object',
  properties: {
    localVolumes: {
      title: 'Persistent Local Volumes',
      type: 'array',
      duplicable: true,
      addLabel: 'Add Local Volume',
      getter: function (service) {
        let containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes.filter(function (volume) {
          return volume.persistent != null;
        }).map(function (volume) {
          return {
            containerPath: volume.containerPath,
            size: volume.persistent.size
          };
        });
      },
      itemShape: {
        properties: {
          size: {
            title: 'Size (MiB)',
            type: 'number'
          },
          containerPath: {
            title: 'Container Path',
            type: 'string'
          }
        }
      }
    },
    dockerVolumes: {
      title: 'Docker Volumes',
      type: 'array',
      duplicable: true,
      addLabel: 'Add Container Volume',
      getter: function (service) {
        let containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes.filter(function (volume) {
          return volume.hostPath != null;
        }).map(function ({containerPath, hostPath, mode}) {
          return {
            containerPath,
            hostPath,
            mode: mode.toLowerCase()
          };
        });
      },
      itemShape: {
        properties: {
          containerPath: {
            title: 'Container Path',
            type: 'string'
          },
          hostPath: {
            title: 'Host Path',
            type: 'string'
          },
          mode: {
            title: 'Mode',
            description: 'RO = Read Only, RW = Read and Write',
            fieldType: 'select',
            default: 'ro',
            options: [
              {html: 'RO', id: 'ro'},
              {html: 'RW', id: 'rw'}
            ]
          }
        }
      }
    },
    externalVolumes: {
      title: 'Network Volumes',
      type: 'array',
      duplicable: true,
      addLabel: 'Add Network Volume',
      getter: function (service) {
        let containerSettings = service.getContainerSettings();

        if (containerSettings == null || containerSettings.volumes == null) {
          return [];
        }

        return containerSettings.volumes.filter(function (volume) {
          return volume.external != null;
        }).map(function ({containerPath, external}) {
          return {
            containerPath,
            externalName: external.name
          };
        });
      },
      itemShape: {
        properties: {
          externalName: {
            title: 'External Name',
            type: 'string'
          },
          containerPath: {
            title: 'Container Path',
            type: 'string'
          }
        }
      }
    }
  }
};

module.exports = Volumes;
