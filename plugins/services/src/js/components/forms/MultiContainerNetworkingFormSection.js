import React from 'react';
import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {FormReducer as networks} from '../../reducers/serviceForm/MultiContainerNetwork';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldError from '../../../../../../src/js/components/form/FieldError';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import FormRow from '../../../../../../src/js/components/form/FormRow';
import HostUtil from '../../utils/HostUtil';
import Icon from '../../../../../../src/js/components/Icon';
import Networking from '../../../../../../src/js/constants/Networking';
import VirtualNetworksStore from '../../../../../../src/js/stores/VirtualNetworksStore';

const {CONTAINER, HOST} = Networking.type;
const METHODS_TO_BIND = [
  'onVirtualNetworksStoreSuccess'
];

class MultiContainerNetworkingFormSection extends mixin(StoreMixin) {
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

  getContainerPortField(endpoint, network, index, containerIndex, errors) {
    if (network !== CONTAINER) {
      return null;
    }

    const containerPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.containerPort`
    );

    return (
      <FormGroup
        className="column-3"
        key="container-port"
        showError={Boolean(containerPortError)}>
        <FieldLabel>
          Container Port
        </FieldLabel>
        <FieldInput
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.containerPort`}
          type="number"
          value={endpoint.containerPort} />
        <FieldError>{containerPortError}</FieldError>
      </FormGroup>
    );
  }

  getHostPortFields(endpoint, index, containerIndex) {
    let placeholder;
    let value = endpoint.hostPort;
    const {errors} = this.props;
    const hostPortError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.port`
    );

    if (endpoint.automaticPort) {
      placeholder = `$PORT${index}`;
      value = null;
    }

    const tooltipContent = (
      <span>
        {`This host port will be accessible as an environment variable called '$PORT${index}'. `}
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
        <FieldLabel tooltipContent={tooltipContent}>
          Host Port
        </FieldLabel>
        <FieldInput
          disabled={endpoint.automaticPort}
          placeholder={placeholder}
          min="0"
          name={`containers.${containerIndex}.endpoints.${index}.hostPort`}
          type="number"
          value={value} />
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
            checked={endpoint.automaticPort}
            name={`containers.${containerIndex}.endpoints.${index}.automaticPort`}
            type="checkbox" />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    ];
  }

  getLoadBalancedServiceAddressField(endpoint, network, index, containerIndex) {
    if (network !== CONTAINER) {
      return null;
    }

    const {containerPort, hostPort, loadBalanced, vip} = endpoint;
    const {errors} = this.props;
    const loadBalancedError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.labels`
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
          <FieldLabel wordWrap>
            Load Balanced Service Address
            <FieldHelp>
              Load balances the service internally (layer 4), and creates a service address. For external (layer 7) load balancing, create an external load balancer and attach this service.
            </FieldHelp>
          </FieldLabel>
        </FormGroup>
      </FormRow>,
      <div className="flex flex-align-items-center row" key="toggle">
        <FormGroup
          className="column-auto"
          key="loadbalanced"
          showError={Boolean(loadBalancedError)}>
          <FieldLabel>
            <FieldInput
              checked={loadBalanced}
              name={`containers.${containerIndex}.endpoints.${index}.loadBalanced`}
              type="checkbox" />
            Enabled
          </FieldLabel>
          <FieldError>{loadBalancedError}</FieldError>
        </FormGroup>
        <FormGroup className="column-auto flush-left" key="address">
          <span>
            {address}
          </span>
        </FormGroup>
      </div>
    ];
  }

  getProtocolField(endpoint, index, containerIndex) {
    const {errors} = this.props;
    const protocolError = findNestedPropertyInObject(
      errors,
      `containers.${containerIndex}.endpoints.${index}.protocol`
    );

    return (
      <FormGroup className="column-3" showError={Boolean(protocolError)}>
        <FieldLabel>
          Protocol
        </FieldLabel>
        <FormRow>
          <FormGroup className="column-auto" key="protocol-tcp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol === 'tcp'}
                name={`containers.${containerIndex}.endpoints.${index}.protocol`}
                type="radio"
                value="tcp" />
              TCP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto" key="protocol-udp">
            <FieldLabel matchInputHeight={true}>
              <FieldInput
                checked={endpoint.protocol === 'udp'}
                name={`containers.${containerIndex}.endpoints.${index}.protocol`}
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

  getServiceContainerEndpoints(endpoints = [], containerIndex) {
    const network = findNestedPropertyInObject(
      this.props.data,
      'networks.0.mode'
    );
    const {errors} = this.props;

    return endpoints.map((endpoint, index) => {
      const nameError = findNestedPropertyInObject(
        errors,
        `containers.${containerIndex}.endpoints.${index}.name`
      );

      return (
        <FormGroupContainer
          key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: `containers.${containerIndex}.endpoints`}
          )}>
          <FormRow key="port-name-group">
            {this.getContainerPortField(endpoint, network, index, containerIndex, errors)}
            <FormGroup className="column-6" key="endpoint-name" showError={Boolean(nameError)}>
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`containers.${containerIndex}.endpoints.${index}.name`}
                type="text"
                value={endpoint.name} />
              <FieldError>{nameError}</FieldError>
            </FormGroup>
          </FormRow>
          <FormRow key="host-protocol">
            {this.getHostPortFields(endpoint, index, containerIndex)}
            {this.getProtocolField(endpoint, index, containerIndex)}
          </FormRow>
          {this.getLoadBalancedServiceAddressField(endpoint, network, index, containerIndex)}
        </FormGroupContainer>
      );
    });
  }

  getServiceEndpoints() {
    const {containers} = this.props.data;

    return containers.map((container, index) => {
      const {endpoints = []} = container;

      return (
        <div key={index}>
          <h3 className="short-bottom">
            <Icon id="container" size="mini" color="purple" />
            {` ${container.name}`}
          </h3>
          {this.getServiceContainerEndpoints(endpoints, index)}
          <div key="add-button">
            <button
              type="button"
              onBlur={(event) => {
                event.stopPropagation();
              }}
              className="button button-primary-link button-flush"
              onClick={this.props.onAddItem.bind(
                  this,
                {
                  value: endpoints.length,
                  path: `containers.${index}.endpoints`
                }
                )}>
              <Icon color="purple" id="plus" size="tiny"/> Add Service
              Endpoint
            </button>
          </div>
        </div>
      );
    });
  }

  getVirtualNetworks() {
    return VirtualNetworksStore.getOverlays().mapItems((overlay) => {
      const name = overlay.getName();

      return {
        text: `Virtual Network: ${name}`,
        value: `${CONTAINER}.${name}`
      };
    }).getItems().map((virtualNetwork, index) => {
      return (
        <option
          key={index}
          value={virtualNetwork.value}>
          {virtualNetwork.text}
        </option>
      );
    });
  }

  getTypeSelections() {
    const networkType = findNestedPropertyInObject(this.props.data,
      'networks.0.mode');
    const networkName = findNestedPropertyInObject(this.props.data,
      'networks.0.name');

    let network = networkType;
    if (networkName) {
      network = `${networkType}.${networkName}`;
    }

    return (
      <FieldSelect
        name="networks.0"
        value={network}>
        <option
          value={HOST}>
          Host
        </option>
        {this.getVirtualNetworks()}
      </FieldSelect>
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
        <a href="https://mesosphere.github.io/marathon/docs/ports.html" target="_blank">
          ports documentation
        </a> for more information.
      </span>
    );

    return (
      <div className="form flush-bottom">
        <h2 className="flush-top short-bottom">
          Networking
        </h2>
        <p>
          Configure the networking for your service.
        </p>
        <FormRow>
          <FormGroup className="column-6" showError={Boolean(networkError)}>
            <FieldLabel tooltipContent={tooltipContent}>
              Network Type
            </FieldLabel>
            {this.getTypeSelections()}
            <FieldError>{networkError}</FieldError>
          </FormGroup>
        </FormRow>
        <h3 className="short-bottom">
          Service Endpoints
        </h3>
        <p>
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.getServiceEndpoints()}
      </div>
    );
  }
}

MultiContainerNetworkingFormSection.defaultProps = {
  data: {},
  errors: {},
  onAddItem() {},
  onRemoveItem() {}
};

MultiContainerNetworkingFormSection.propTypes = {
  data: React.PropTypes.object,
  errors: React.PropTypes.object,
  onAddItem: React.PropTypes.func,
  onRemoveItem: React.PropTypes.func
};

MultiContainerNetworkingFormSection.configReducers = {
  networks
};

module.exports = MultiContainerNetworkingFormSection;
