const Networking = {
  type: 'object',
  title: 'Network',
  description: 'Configure the networking for your service.',
  properties: {
    networkType: {
      fieldType: 'select',
      default: 'host',
      title: 'Network Type',
      options: [
        {html: 'Host (Default)', id: 'host'},
        {html: 'Bridge', id: 'bridge'},
        {html: 'Virtual Network: Dev', id: 'dev'},
        {html: 'Virtual Network: Prod', id: 'prod'}
      ],
      getter: function (service) {
        let container = service.getContainerSettings();
        if (container && container.docker && container.docker.network) {
          return container.docker.network.toLowerCase();
        }
        return null;
      }
    },
    ports: {
      title: 'Service Endpoints',
      description: 'Define the ports and endpoints for your service',
      type: 'array',
      duplicable: true,
      addLabel: 'Add an endpoint',
      getter: function (service) {
        let portMappings = service.getPortDefinitions();

        if (portMappings == null) {
          let container = service.getContainerSettings();
          if (container && container.docker && container.docker.portMappings) {
            portMappings = container.docker.portMappings;
          }

          if (portMappings == null) {
            return null;
          }
        }

        return portMappings.map(function (portMapping) {
          return {
            lbPort: portMapping.hostPort || portMapping.containerPort ||
              portMapping.port,
            name: portMapping.name,
            protocol: portMapping.protocol,
            discovery: (portMapping.hostPort || portMapping.containerPort ||
            portMapping.port) > 0
          };
        });
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
            default: 'tcp',
            options: ['tcp', 'udp', 'udp,tcp']
          },
          discovery: {
            label: 'Discovery',
            showLabel: false,
            title: 'Discovery',
            type: 'boolean'
          }
        }
      }
    }
  }
};

module.exports = Networking;
