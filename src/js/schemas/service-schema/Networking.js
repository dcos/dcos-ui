import FormUtil from '../../utils/FormUtil';

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
        {html: 'Bridge', id: 'bridge'}
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

        return 'host';
      },
      filterProperties: function (currentValue, definition, model) {
        // Hide this definition when model values dictate
        if (model.containerSettings
          && model.containerSettings.image != null
          && model.containerSettings.image.length) {

          definition.formElementClass = '';
        } else {
          definition.formElementClass = 'hidden-form-element';
        }
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

        let networkType = 'host';
        if (portMappings == null) {
          portMappings = service.getPortDefinitions();

          if (container && container.docker && container.docker.network) {
            networkType = container.docker.network.toLowerCase();
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
            portMapping.port) > 0,
            expose: !['host', 'bridge'].includes(networkType)
          };
        });
      },
      filterProperties: function (service = {}, instanceDefinition, model) {
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

          if (prop === 'lbPort' && model && model.networking) {
            if (model.networking.networkType !== 'host') {
              definition.showLabel = 'Container Port';
            } else {
              definition.showLabel = 'LB Port';

              if (service.discovery) {
                // show as input
              } else {
                // show as disabled
              }

            }
          }
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
