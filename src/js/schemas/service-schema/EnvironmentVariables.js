let EnvironmentVariables = {
  description: 'Set environment variables for each task your service launches in addition to those set be Mesos.',
  type: 'object',
  title: 'Environment Variables',
  properties: {
    variables: {
      type: 'array',
      duplicable: true,
      addLabel: 'Add Environment Variable',
      itemShape: {
        properties: {
          key: {
            title: 'Key',
            type: 'string'
          },
          value: {
            title: 'Value',
            type: 'string'
          },
          isSecret: {
            title: 'Use a secret',
            type: 'boolean',
            description: 'Use a secret homie'
          }
        }
      }
    }
  }
};

module.exports = EnvironmentVariables;
