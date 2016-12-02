import React from 'react';
import {Tooltip} from 'reactjs-components';
import mixin from 'reactjs-mixin';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
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

    if (portDefinition.automaticPort) {
      placeholder = `$PORT${index}`;
    }

    return [
      <FormGroup className="column-3" key="host-port">
        <FieldLabel>
          Host Port
        </FieldLabel>
        <FieldInput
          disabled={portDefinition.automaticPort}
          placeholder={placeholder}
          name={`portDefinitions.${index}.hostPort`}
          type="number"
          value={portDefinition.hostPort} />
      </FormGroup>,
      <FormGroup className="column-auto flush-left" key="assign-automatically">
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

  getLoadBalancedServiceAddressField({checkboxName, checkboxValue, port}) {
    let hostname = HostUtil.stringToHostname(this.props.data.id);
    if (port != null && port !== '') {
      port = `:${port}`;
    }

    return [
      <div className="flex row" key="title">
        <FormGroup className="column-9">
          <FieldLabel>
            Load Balanced Service Address
            <FieldHelp>
              Load balances the service internally (layer 4), and creates a service address. For external (layer 7) load balancing, create an external load balancer and attach this service.
            </FieldHelp>
          </FieldLabel>
        </FormGroup>
      </div>,
      <div className="flex flex-align-items-center row" key="toggle">
        <FormGroup className="column-auto">
          <FieldLabel>
            <FieldInput
              checked={checkboxValue}
              name={checkboxName}
              type="checkbox" />
            Enabled
          </FieldLabel>
        </FormGroup>
        <FormGroup className="column-auto flush-left">
          <span>
            {hostname}{Networking.L4LB_ADDRESS}{port}
          </span>
        </FormGroup>
      </div>
    ];
  }

  getProtocolField(portDefinition, index) {
    return (
      <FormGroup className="column-3">
        <FieldLabel>
          Protocol
        </FieldLabel>
        <div className="flex row">
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
        </div>
      </FormGroup>
    );
  }

  getBridgeServiceEndpoints(portDefinitions) {
    return portDefinitions.map((portDefinition, index) => {

      let portMappingFields = (
        <div className="flex row">
          {this.getHostPortFields(portDefinition, index)}
          {this.getProtocolField(portDefinition, index)}
        </div>
      );

      return (
        <FormGroupContainer key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <div className="flex row">
            <FormGroup className="column-3">
              <FieldLabel>
                Container Port
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
            </FormGroup>
            <FormGroup className="column-6">
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
            </FormGroup>
          </div>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField({
            checkboxName: `portDefinitions.${index}.loadBalanced`,
            checkboxValue: portDefinition.loadBalanced,
            port: portDefinition.hostPort
          })}
        </FormGroupContainer>
      );
    });
  }

  getHostServiceEndpoints(portDefinitions) {
    return portDefinitions.map((portDefinition, index) => {
      return (
        <FormGroupContainer key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <div className="flex row">
            <FormGroup className="column-6">
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
            </FormGroup>
          </div>
          <div className="flex row">
            {this.getHostPortFields(portDefinition, index)}
            {this.getProtocolField(portDefinition, index)}
          </div>
          {this.getLoadBalancedServiceAddressField({
            checkboxName: `portDefinitions.${index}.loadBalanced`,
            checkboxValue: portDefinition.loadBalanced,
            port: portDefinition.hostPort
          })}
        </FormGroupContainer>
      );
    });
  }

  getVirtualNetworkServiceEndpoints(portDefinitions) {
    return portDefinitions.map((portDefinition, index) => {
      let portMappingFields = null;

      if (portDefinition.portMapping) {
        portMappingFields = (
          <div className="flex row">
            {this.getHostPortFields(portDefinition, index)}
            {this.getProtocolField(portDefinition, index)}
          </div>
        );
      }

      let portMappingLabel = 'Disabled';

      if (portDefinition.portMapping) {
        portMappingLabel = 'Enabled';
      }

      return (
        <FormGroupContainer key={index}
          onRemove={this.props.onRemoveItem.bind(
            this,
            {value: index, path: 'portDefinitions'}
          )}>
          <div className="flex row">
            <FormGroup className="column-3">
              <FieldLabel>
                Container Port
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
            </FormGroup>
            <FormGroup className="column-6">
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput
                name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
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
                  {portMappingLabel}
              </FieldLabel>
            </FormGroup>
          </div>
          {portMappingFields}
          {this.getLoadBalancedServiceAddressField({
            checkboxName: `portDefinitions.${index}.loadBalanced`,
            checkboxValue: portDefinition.loadBalanced,
            port: portDefinition.hostPort
          })}
        </FormGroupContainer>
      );
    });
  }

  getServiceEndpoints() {
    let {container, portDefinitions} = this.props.data;
    let network = findNestedPropertyInObject(container, 'docker.network');

    if (network === Networking.type.BRIDGE) {
      return this.getBridgeServiceEndpoints(portDefinitions);
    }

    if (network === Networking.type.USER) {
      return this.getVirtualNetworkServiceEndpoints(portDefinitions);
    }

    // Default to network type host.
    return this.getHostServiceEndpoints(portDefinitions);
  }

  getVirtualNetworks(disabledMap) {
    return VirtualNetworksStore.getOverlays().mapItems((overlay) => {
      let name = overlay.getName();

      return {
        text: `Virtual Network: ${name}`,
        value: `${Networking.type.USER}.${name}`
      };
    }).getItems().map((virtualNetwork) => {
      return (
        <option
          disabled={Boolean(disabledMap[Networking.type.USER])}
          value={virtualNetwork.value}>
        {virtualNetwork.text}
        </option>
      );
    });
  }

  getTypeSelections() {
    let {container} = this.props.data;
    let type = findNestedPropertyInObject(container, 'type');
    let network = findNestedPropertyInObject(this.props.data, 'networkType');
    let disabledMap = {};

    // Runtime is Mesos
    if (!type || type === NONE) {
      disabledMap[Networking.type.BRIDGE] = 'BRIDGE networking is not compatible with the Mesos runtime.';
      disabledMap[Networking.type.USER] = 'USER networking is not compatible with the Mesos runtime.';
    }

    // Runtime is Universal Container Runtime
    if (type === MESOS) {
      disabledMap[Networking.type.BRIDGE] = 'BRIDGE networking is not compatible with the Universal Container Runtime.';
    }

    let tooltipContent = Object.keys(disabledMap).filter(function (key) {
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
        content={tooltipContent}
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
    let {portDefinitions} = this.props.data;

    let tooltipContent = (
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
        <div className="flex row">
          <FormGroup className="column-6">
            <FieldLabel>
              {'Network Type '}
              <Tooltip
                content={tooltipContent}
                interactive={true}
                maxWidth={300}
                scrollContainer=".gm-scroll-view"
                wrapText={true}>
                <Icon color="grey" id="ring-question" size="mini" family="mini" />
              </Tooltip>
            </FieldLabel>
            {this.getTypeSelections()}
          </FormGroup>
        </div>
        <h3 className="flush-top short-bottom">
          Service Endpoints
        </h3>
        <p>
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.getServiceEndpoints()}
        <div>
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
            <Icon color="purple" id="plus" family="mini" size="tiny" /> Add Service Endpoint
          </button>
        </div>
      </div>
    );
  }
}

NetworkingFormSection.defaultProps = {
  data: {},
  errors: {
    env: []
  },
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
    let joinedPath = path.join('.');

    if (type === SET && joinedPath === 'container.docker.network') {
      return value;
    }

    return state;
  }
};

module.exports = NetworkingFormSection;
