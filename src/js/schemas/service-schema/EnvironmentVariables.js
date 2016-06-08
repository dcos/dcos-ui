let EnvironmentVariables = {
  description: 'Set environment variables for each task your service launches in addition to those set be Mesos.',
  type: 'object',
  title: 'Environment Variables',
  properties: {
    ports: {
      type: 'array',
      duplicable: true,
      itemShape: {
        properties: {
          key: {
            type: 'string'
          },
          value: {
            type: 'string'
          }
        }
      }
    }
  }
};

module.exports = EnvironmentVariables;
