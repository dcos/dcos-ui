import FormUtil from '../../utils/FormUtil';

function filterProperties(service = {}, instanceDefinition, model) {
  let properties = Networking
    .properties
    .ports
    .itemShape
    .properties;

  instanceDefinition.forEach(function (definition) {
    let prop = definition.name;
    if (FormUtil.isFieldInstanceOfProp('ports', definition)) {
      prop = FormUtil.getPropKey(definition.name);
    }

    if (properties[prop].shouldShow) {
      definition.formElementClass = {
        'hidden-form-element': !properties[prop].shouldShow(
          service, model || {networking: {}})
      }
    }
  });
}

const Networking = {
  type: 'object',
  title: 'Network',
  description: 'Configure the networking for your service.',
  properties: {
    networkType: {
      fieldType: 'select',
      title: 'Network Type',
      options: [
        {html: 'Host (Default)', id: 'host'},
        {html: 'Bridge', id: 'bridge'},
      ],
      getter: function (service) {
        let ipAddress = service.getIpAddress();
        if (ipAddress) {

          return ipAddress.networkName;
        }

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
        let container = service.getContainerSettings();
        let portMappings = null;
        if (container && container.docker && container.docker.portMappings) {
          portMappings = container.docker.portMappings;
        }

        if (portMappings == null) {
          portMappings = service.getPortDefinitions();

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
      filterProperties,
      itemShape: {
        properties: {
          lbPort: {
            title: 'LB Port',
            type: 'number',
            shouldShow: function (service, model) {
              let networkType = (
                model.networking.networkType || 'HOST'
              ).toLowerCase();

              return networkType === 'bridge'
                || networkType === 'user'
                || (networkType === 'host' && service.discovery);
            }
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
