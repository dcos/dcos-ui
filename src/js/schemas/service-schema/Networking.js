const Networking = {
  type: 'object',
  title: 'Network',
  description: 'Something about configuring networks and ports and so forth.',
  properties: {
    networkType: {
      fieldType: 'select',
      options: [
        'Host (Default)',
        'Bridge',
        'Virtual Network: Dev',
        'Virtual Network: Prod'
      ],
      getter: function () {
        return null;
      }
    },
    ports: {
      title: 'Service Endpoints',
      description: 'Define the ports and endpoints for your service',
      type: 'array',
      duplicable: true,
      addLabel: 'Add an endpoint',
      getter: function () {
        return null;
      },
      itemShape: {
        properties: {
          lbPort: {
            title: 'LB Port',
            type: 'number'
          },
          name: {
            title: 'Name',
            type: 'string'
          },
          protocol: {
            title: 'Protocol',
            type: 'string',
            fieldType: 'select',
            options: ['tcp', 'udp', 'udp,tcp']
          },
          discovery: {
            title: 'Discovery',
            type: 'boolean'
          }
        }
      }
    }
  }
};

module.exports = Networking;
