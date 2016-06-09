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
            title: 'Variable Name',
            type: 'string'
          },
          value: {
            title: 'Value',
            type: 'string'
          }
        }
      }
    }
  }
};

module.exports = EnvironmentVariables;
