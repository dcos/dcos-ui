let SERVICE_SCHEMA = {
  type: 'object',
  properties: {
    General: {
      description: 'Configure your container',
      type: 'object',
      properties: {
        id: {
          default: '/service',
          title: 'ID',
          description: 'The id for the service',
          type: 'string'
        },
        cpus: {
          title: 'CPUs',
          description: 'The amount of CPUs which are used for the service',
          type:'number'
        },
        mem: {
          title: 'Mem (MiB)',
          type: 'number'
        },
        disk: {
          title: 'Disk (MiB)',
          type: 'number'
        },
        instances: {
          title: 'Instances',
          type: 'number'
        },
        cmd: {
          title: 'Command',
          default: 'sleep 1000;',
          description: 'The command which is executed by the service',
          type: 'string',
          multiLine: true
        }
      },
      required: [
        'id'
      ]
    },
    'Container Settings': {
      description: 'Configure your Docker Container',
      type: 'object',
      properties: {
        image: {
          default: '',
          description: 'name of your docker image',
          type: 'string'
        }
      },
      required: []
    }
  },
  required: [
    'General'
  ]
};

module.exports = SERVICE_SCHEMA;
