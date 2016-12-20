import React from 'react';
import {Tooltip} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import {FormReducer as portDefinitionsReducer} from '../../reducers/serviceForm/PortDefinitions';
import HostUtil from '../../utils/HostUtil';
import Icon from '../../../../../../src/js/components/Icon';
import Networking from '../../../../../../src/js/constants/Networking';
import ContainerConstants from '../../constants/ContainerConstants';
import VirtualNetworksStore from '../../../../../../src/js/stores/VirtualNetworksStore';

const {MESOS, NONE} = ContainerConstants.type;

const METHODS_TO_BIND = [
  'onVirtualNetworksStoreSuccess'
];

class NetworkingFormSection extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });

    this.store_listeners = [{
      name: 'virtualNetworks',
      events: ['success'],
      suppressUpdate: true
    }];

  }

  onVirtualNetworksStoreSuccess() {
    this.forceUpdate();
  }

  getHostPortFields(portDefinition, index) {
    let placeholder;
    const {errors} = this.props;
    let hostPortError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.port`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.hostPort`
    );

    if (portDefinition.automaticPort) {
      placeholder = `$PORT${index}`;
    }

    let tooltipContent = (
      <span>
        {'This host port will be accessible as an environment variable called `$PORT{index}0`. '}
        <a href="https://mesosphere.github.io/marathon/docs/ports.html" about="_blank">
          More information
        </a>
      </span>
    );

    return [
      <FormGroup
        className="column-3"
        key="host-port"
        showError={Boolean(hostPortError)}>
        <FieldLabel>
          {'Host Port '}
          <Tooltip
            content={tooltipContent}
            interactive={true}
            maxWidth={300}
            scrollContainer=".gm-scroll-view"
            wrapText={true}>
            <Icon color="grey" id="circle-question" size="mini" />
          </Tooltip>
        </FieldLabel>
        <FieldInput
          disabled={portDefinition.automaticPort}
          placeholder={placeholder}
          min="0"
          name={`portDefinitions.${index}.hostPort`}
          type="number"
          value={portDefinition.hostPort} />
        <FieldError>{hostPortError}</FieldError>
      </FormGroup>,
      <FormGroup
        className="column-auto flush-left"
        key="assign-automatically">
        <FieldLabel>
          &nbsp;
        </FieldLabel>
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={portDefinition.automaticPort}
            name={`portDefinitions.${index}.automaticPort`}
            type="checkbox" />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    ];
  }

  getLoadBalancedServiceAddressField({containerPort, hostPort, loadBalanced, vip}, index) {
    const {errors} = this.props;
    let loadBalancedError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.labels`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.labels`
    );

    let address = vip;
    if (address == null) {
      const hostname = HostUtil.stringToHostname(this.props.data.id);
      let port = '';
      if (hostPort != null && hostPort !== '') {
        port = `:${hostPort}`;
      }
      if (containerPort != null && containerPort !== '') {
        port = `:${containerPort}`;
      }

      address = `${hostname}${Networking.L4LB_ADDRESS}${port}`;
    }

    return [
      <FormRow key="title">
        <FormGroup className="column-9">
          <FieldLabel>
            Load Balanced Service Address
            <FieldHelp>
              Load balances the service internally (layer 4), and creates a service address. For external (layer 7) load balancing, create an external load balancer and attach this service.
            </FieldHelp>
          </FieldLabel>
        </FormGroup>
      </FormRow>,
      <FormRow key="toggle">
        <FormGroup
          className="column-auto"
          showError={Boolean(loadBalancedError)}>
          <FieldLabel>
            <FieldInput
              checked={loadBalanced}
              name={`portDefinitions.${index}.loadBalanced`}
              type="checkbox" />
            Enabled
          </FieldLabel>
          <FieldError>{loadBalancedError}</FieldError>
        </FormGroup>
        <FormGroup className="column-auto flush-left">
          <span>
            {address}
          </span>
        </FormGroup>
      </FormRow>
    ];
  }

  getProtocolField(portDefinition, index) {
    const {errors} = this.props;
    let protocolError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.protocol`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.protocol`
    );

    return (
      <FormGroup className="column-3" showError={Boolean(protocolError)}>
        <FieldLabel>
          Protocol
        </FieldLabel>
        <FormRow>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol === 'tcp'}
                name={`portDefinitions.${index}.protocol`}
                type="radio"
                value="tcp" />
              TCP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol === 'udp'}
                name={`portDefinitions.${index}.protocol`}
                type="radio"
                value="udp" />
              UDP
            </FieldLabel>
          </FormGroup>
        </FormRow>
        <FieldError>{protocolError}</FieldError>
      </FormGroup>
    );
  }

  getBridgeServiceEndpoints(portDefinitions) {
    const {errors} = this.props;

    return portDefinitions.map((portDefinition, index) => {
      let containerPortError = findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.containerPort`
      );
      let nameError = findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.name`
      ) || findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.name`
      );
      let portMappingFields = (
        <FormRow>
          {this.getHostPortFields(portDefinition, index)}
          {this.getProtocolField(portDefinition, index)}
        </FormRow>
      );

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <FormRow>
            <FormGroup
              className="column-3"
              showError={Boolean(containerPortError)}>
              <FieldLabel>
                Container Port
              </FieldLabel>
              <FieldInput
                min="0"
                name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
              <FieldError>{containerPortError}</FieldError>
            </FormGroup>
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField(portDefinition, index)}
        </FormGroupContainer>
      );
    });
  }

  getHostServiceEndpoints(portDefinitions) {
    const {errors} = this.props;

    return portDefinitions.map((portDefinition, index) => {
      let nameError = findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.name`
      ) || findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.name`
      );

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <FormRow>
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow>
            {this.getHostPortFields(portDefinition, index)}
            {this.getProtocolField(portDefinition, index)}
          </FormRow>
          {this.getLoadBalancedServiceAddressField(portDefinition, index)}
        </FormGroupContainer>
      );
    });
  }

  getVirtualNetworkServiceEndpoints(portDefinitions) {
    const {errors} = this.props;

    return portDefinitions.map((portDefinition, index) => {
      let portMappingFields = null;
      let containerPortError = findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.containerPort`
      ) || findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.containerPort`
      );
      let nameError = findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.name`
      ) || findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.name`
      );

      if (portDefinition.portMapping) {
        portMappingFields = (
          <FormRow>
            {this.getHostPortFields(portDefinition, index)}
            {this.getProtocolField(portDefinition, index)}
          </FormRow>
        );
      }

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <FormRow>
            <FormGroup
              className="column-3"
              showError={Boolean(containerPortError)}>
              <FieldLabel>
                Container Port
              </FieldLabel>
              <FieldInput
                min="0"
                name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
              <FieldError>{containerPortError}</FieldError>
            </FormGroup>
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
            <FormGroup className="column-3">
              <FieldLabel>
                Port Mapping
              </FieldLabel>
              <FieldLabel matchInputHeight={true}>
                <FieldInput
                  checked={portDefinition.portMapping}
                  name={`portDefinitions.${index}.portMapping`}
                  type="checkbox" />
                  Enabled
              </FieldLabel>
            </FormGroup>
          </FormRow>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField(portDefinition, index)}
        </FormGroupContainer>
      );
    });
  }

  getServiceEndpoints() {
    const {container, portDefinitions} = this.props.data;
    const network = findNestedPropertyInObject(container, 'docker.network');

    if (network === Networking.type.BRIDGE) {
      return this.getBridgeServiceEndpoints(portDefinitions);
    }

    if (network === Networking.type.USER) {
      return this.getVirtualNetworkServiceEndpoints(portDefinitions);
    }

    // Default to network type host.
    return this.getHostServiceEndpoints(portDefinitions);
  }

  getServiceEndpointsSection() {
    const {container, portDefinitions} = this.props.data;
    const runtimeType = findNestedPropertyInObject(container, 'type');
    const networkType =
      findNestedPropertyInObject(this.props.data, 'networkType') || '';

    // Service Endpoints are unavailable for Mesos tasks
    if (runtimeType === NONE && networkType.startsWith(Networking.type.USER)) {
      return null;
    }

    return [
      <h3 className="short-bottom" key="service-endpoints-header">
        Service Endpoints
      </h3>,
      <p key="service-endpoints-description">
        DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
      </p>,
      this.getServiceEndpoints(),
      <FormRow key="service-endpoints-add-button">
        <FormGroup className="column-12">
          <button
            type="button"
            onBlur={(event) => { event.stopPropagation(); }}
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(
              this,
              {
                value: portDefinitions.length,
                path: 'portDefinitions'
              }
            )}>
            <Icon color="purple" id="plus" size="tiny" /> Add Service Endpoint
          </button>
        </FormGroup>
      </FormRow>
    ];
  }

  getVirtualNetworks(disabledMap) {
    return VirtualNetworksStore.getOverlays().mapItems((overlay) => {
      const name = overlay.getName();

      return {
        text: `Virtual Network: ${name}`,
        value: `${Networking.type.USER}.${name}`
      };
    }).getItems().map((virtualNetwork, index) => {
      return (
        <option
          key={index}
          disabled={Boolean(disabledMap[Networking.type.USER])}
          value={virtualNetwork.value}>
          {virtualNetwork.text}
        </option>
      );
    });
  }

  getTypeSelections() {
    const {container} = this.props.data;
    const type = findNestedPropertyInObject(container, 'type');
    let network = findNestedPropertyInObject(this.props.data, 'networkType');
    const disabledMap = {};

    // Runtime is Mesos
    if (!type || type === NONE) {
      disabledMap[Networking.type.BRIDGE] = 'BRIDGE networking is not compatible with the Mesos runtime';
    }

    // Runtime is Universal Container Runtime
    if (type === MESOS) {
      disabledMap[Networking.type.BRIDGE] = 'BRIDGE networking is not compatible with the Universal Container Runtime';
    }

    const tooltipContent = Object.keys(disabledMap).filter(function (key) {
      return disabledMap[key];
    })
    .map(function (key) {
      return disabledMap[key];
    }).join(', ');

    let selections = (
      <FieldSelect
        name="container.docker.network"
        value={network}>
        <option
          disabled={Boolean(disabledMap[Networking.type.HOST])}
          value={Networking.type.HOST}>
          Host
        </option>
        <option
          disabled={Boolean(disabledMap[Networking.type.BRIDGE])}
          value={Networking.type.BRIDGE}>
          Bridge
        </option>
        {this.getVirtualNetworks(disabledMap)}
      </FieldSelect>
    );

    if (!tooltipContent) {
      return selections;
    }

    return (
      <Tooltip
        content={tooltipContent + '.'}
        interactive={true}
        maxWidth={300}
        scrollContainer=".gm-scroll-view"
        wrapperClassName="tooltip-wrapper tooltip-block-wrapper text-align-center"
        wrapText={true}>
        {selections}
      </Tooltip>
    );
  }

  render() {
    let networkError = findNestedPropertyInObject(
      this.props.errors,
      'container.docker.network'
    );

    let tooltipContent = (
      <span>
        {'Choose BRIDGE, HOST, or USER networking. Refer to the '}
        <a href="https://mesosphere.github.io/marathon/docs/ports.html" target="_blank">
          ports documentation
        </a> for more information.
      </span>
    );

    return (
      <div>
        <h2 className="flush-top short-bottom">
          Networking
        </h2>
        <p>
          Configure the networking for your service.
        </p>
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(networkError)}>
            <FieldLabel>
              {'Network Type '}
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}>
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FieldLabel>
            {this.getTypeSelections()}
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
        {this.getServiceEndpointsSection()}
      </div>
    );
  }
}

NetworkingFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

NetworkingFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

NetworkingFormSection.configReducers = {
  portDefinitions: portDefinitionsReducer,
  networkType(state, {type, path = [], value}) {
    const joinedPath = path.join('.');

    if (type === SET && joinedPath === 'container.docker.network') {
      return value;
    }

    return state;
  }
};

module.exports = NetworkingFormSection;
