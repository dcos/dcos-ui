import React from 'react';
import {Tooltip} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import {
  findNestedPropertyInObject,
  isObject
} from '../../../../../../src/js/utils/Util';
import {FormReducer as portDefinitionsReducer} from '../../reducers/serviceForm/PortDefinitions';
import {SET} from '../../../../../../src/js/constants/TransactionTypes';
import AddButton from '../../../../../../src/js/components/form/AddButton';
import ContainerConstants from '../../constants/ContainerConstants';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import FormGroupHeading from '../../../../../../src/js/components/form/FormGroupHeading';
import FormGroupHeadingContent from '../../../../../../src/js/components/form/FormGroupHeadingContent';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import Icon from '../../../../../../src/js/components/Icon';
import Networking from '../../../../../../src/js/constants/Networking';
import ServiceConfigUtil from '../../utils/ServiceConfigUtil';
import VirtualNetworksStore from '../../../../../../src/js/stores/VirtualNetworksStore';

const {BRIDGE, HOST, USER} = Networking.type;
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
    const hostPortError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.port`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.hostPort`
    );

    if (portDefinition.automaticPort) {
      placeholder = `$PORT${index}`;
    }

    const tooltipContent = (
      <span>
        {`This host port will be accessible as an environment variable called '$PORT${index}'. `}
        <a
          href="https://mesosphere.github.io/marathon/docs/ports.html"
          target="_blank">
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
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Host Port
            </FormGroupHeadingContent>
            <FormGroupHeadingContent>
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}>
                <Icon color="grey" id="circle-question" size="mini" />
              </Tooltip>
            </FormGroupHeadingContent>
          </FormGroupHeading>
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

  getLoadBalancedServiceAddressField(portDefinition, index) {
    const {
      containerPort,
      hostPort,
      loadBalanced,
      vip
    } = portDefinition;
    const {errors} = this.props;
    let vipPortError = null;
    let loadBalancedError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.labels`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.labels`
    );

    if (isObject(loadBalancedError)) {
      vipPortError = loadBalancedError[`VIP_${index}`];
      loadBalancedError = null;
    }

    let address = vip;
    if (address == null) {
      let port = '';
      if (hostPort != null && hostPort !== '') {
        port = hostPort;
      }
      if (containerPort != null && containerPort !== '') {
        port = containerPort;
      }
      port = port || 0;

      address = `${this.props.data.id}:${port}`;
    }

    let hostName = null;
    if (!vipPortError) {
      hostName = (
        <span>
          {ServiceConfigUtil.buildHostNameFromVipLabel(address)}
        </span>
      );
    }

    return [
      <FormRow key="title">
        <FormGroup className="column-9">
          <FieldLabel>
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Load Balanced Service Address
              </FormGroupHeadingContent>
            </FormGroupHeading>
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
        <FormGroup
          className="column-auto flush-left"
          showError={Boolean(vipPortError)}>
          {hostName}
          <FieldError>{vipPortError}</FieldError>
        </FormGroup>
      </FormRow>
    ];
  }

  getProtocolField(portDefinition, index) {
    const {errors} = this.props;
    const protocolError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.protocol`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.protocol`
    );

    return (
      <FormGroup className="column-3" showError={Boolean(protocolError)}>
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Protocol
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FormRow>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol.udp}
                name={`portDefinitions.${index}.protocol.udp`}
                type="checkbox" />
              UDP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={portDefinition.protocol.tcp}
                name={`portDefinitions.${index}.protocol.tcp`}
                type="checkbox" />
              TCP
            </FieldLabel>
          </FormGroup>
        </FormRow>
        <FieldError>{protocolError}</FieldError>
      </FormGroup>
    );
  }

  getContainerPortField(portDefinition, network, errors, index) {
    if (network == null || network === HOST) {
      return null;
    }

    const containerPortError = findNestedPropertyInObject(
      errors,
      `portDefinitions.${index}.containerPort`
    ) || findNestedPropertyInObject(
      errors,
      `container.docker.portMappings.${index}.containerPort`
    );

    return (
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
    );
  }

  /**
   * This field is actually not present in the appConfig, but is generated by
   * the reducers, so we empower the user to show and hide fields
   * @param  {Object} portDefinition, the portDefinition to turn port mapping on
   * and off ofr
   * @param  {String} network, type of network
   * @param  {Number} index, position of port definition in the
   * portDefinitions array
   * @return {Component} Checkbox for turning port mapping on and off
   */
  getPortMappingCheckbox(portDefinition, network, index) {
    if ([BRIDGE, HOST].includes(network)) {
      return null;
    }

    return (
      <FormGroup className="column-3">
        <FieldLabel>
          <FormGroupHeading>
            <FormGroupHeadingContent primary={true}>
              Port Mapping
            </FormGroupHeadingContent>
          </FormGroupHeading>
        </FieldLabel>
        <FieldLabel matchInputHeight={true}>
          <FieldInput
            checked={portDefinition.portMapping}
            name={`portDefinitions.${index}.portMapping`}
            type="checkbox" />
            Enabled
        </FieldLabel>
      </FormGroup>
    );
  }

  getServiceEndpoints() {
    const {errors, data: {portDefinitions, networkType = HOST}} = this.props;

    return portDefinitions.map((portDefinition, index) => {
      let portMappingFields = null;

      const nameError = findNestedPropertyInObject(
        errors,
        `portDefinitions.${index}.name`
      ) || findNestedPropertyInObject(
        errors,
        `container.docker.portMappings.${index}.name`
      );

      if (portDefinition.portMapping || [BRIDGE, HOST].includes(networkType)) {
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
            {this.getContainerPortField(
              portDefinition,
              networkType,
              errors,
              index
            )}
            <FormGroup className="column-6" showError={Boolean(nameError)}>
              <FieldLabel>
                <FormGroupHeading>
                  <FormGroupHeadingContent primary={true}>
                    Service Endpoint Name
                  </FormGroupHeadingContent>
                </FormGroupHeading>
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
            {this.getPortMappingCheckbox(portDefinition, networkType, index)}
          </FormRow>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField(portDefinition, index)}
        </FormGroupContainer>
      );
    });
  }

  getVirtualNetworks(disabledMap) {
    return VirtualNetworksStore.getOverlays().mapItems((overlay) => {
      const name = overlay.getName();

      return {
        text: `Virtual Network: ${name}`,
        value: `${USER}.${name}`
      };
    }).getItems().map((virtualNetwork, index) => {
      return (
        <option
          key={index}
          disabled={Boolean(disabledMap[USER])}
          value={virtualNetwork.value}>
          {virtualNetwork.text}
        </option>
      );
    });
  }

  getTypeSelections() {
    const {container} = this.props.data;
    const type = findNestedPropertyInObject(container, 'type');
    const network = findNestedPropertyInObject(this.props.data, 'networkType');
    const disabledMap = {};

    // Runtime is Mesos
    if (!type || type === NONE) {
      disabledMap[BRIDGE] = 'BRIDGE networking is not compatible with the Mesos runtime';
    }

    // Runtime is Universal Container Runtime
    if (type === MESOS) {
      disabledMap[BRIDGE] = 'BRIDGE networking is not compatible with the Universal Container Runtime';
    }

    const tooltipContent = Object.keys(disabledMap).filter(function (key) {
      return disabledMap[key];
    })
    .map(function (key) {
      return disabledMap[key];
    }).join(', ');

    const selections = (
      <FieldSelect
        name="container.docker.network"
        value={network}>
        <option
          disabled={Boolean(disabledMap[HOST])}
          value={HOST}>
          Host
        </option>
        <option
          disabled={Boolean(disabledMap[BRIDGE])}
          value={BRIDGE}>
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

  getServiceEndpointsSection() {
    const {portDefinitions, container, networkType} = this.props.data;
    const type = findNestedPropertyInObject(container, 'type');
    const isMesosRuntime = !type || type === NONE;
    const isUniversalContainerizer = !type || type === MESOS;
    const isUserNetwork = networkType && networkType.startsWith(USER);
    const isBridgeNetwork = networkType && networkType.startsWith(BRIDGE);

    // Mesos Runtime doesn't support Service Endpoints for the USER network
    if ((isMesosRuntime || isUniversalContainerizer) &&
        (isUserNetwork || isBridgeNetwork)) {
      const tooltipMessage = `Service Endpoints are not available in the ${ContainerConstants.labelMap[type]}`;

      return (
        <Tooltip
          content={tooltipMessage}
          maxWidth={500}
          scrollContainer=".gm-scroll-view"
          wrapperClassName="tooltip-wrapper tooltip-block-wrapper"
          wrapText={true}>
          <h3 className="short-bottom muted" key="service-endpoints-header">
            <FormGroupHeading>
              <FormGroupHeadingContent primary={true}>
                Service Endpoints
              </FormGroupHeadingContent>
            </FormGroupHeading>
          </h3>
          <p key="service-endpoints-description" className="muted">
            DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
          </p>
        </Tooltip>
      );
    }

    return (
      <div>
        <h3 className="short-bottom" key="service-endpoints-header">
          Service Endpoints
        </h3>
        <p key="service-endpoints-description">
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.getServiceEndpoints()}
        <FormRow key="service-endpoints-add-button">
          <FormGroup className="column-12">
            <AddButton onClick={this.props.onAddItem.bind(
              this,
              {
                value: portDefinitions.length,
                path: 'portDefinitions'
              }
            )}>
              Add Service Endpoint
            </AddButton>
          </FormGroup>
        </FormRow>
      </div>
    );
  }

  render() {
    const networkError = findNestedPropertyInObject(
      this.props.errors,
      'container.docker.network'
    );

    const tooltipContent = (
      <span>
        {'Choose BRIDGE, HOST, or USER networking. Refer to the '}
        <a
          href="https://mesosphere.github.io/marathon/docs/ports.html"
          target="_blank">
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
              <FormGroupHeading>
                <FormGroupHeadingContent primary={true}>
                  Network Type
                </FormGroupHeadingContent>
                <FormGroupHeadingContent>
                  <Tooltip
                    content={tooltipContent}
                    interactive={true}
                    maxWidth={300}
                    scrollContainer=".gm-scroll-view"
                    wrapText={true}>
                    <Icon color="grey" id="circle-question" size="mini" />
                  </Tooltip>
                </FormGroupHeadingContent>
              </FormGroupHeading>
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
