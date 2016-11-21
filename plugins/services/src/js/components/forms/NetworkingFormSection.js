import React, {Component} from 'react';

import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import FormGroupContainer from '../../../../../../src/js/components/form/FormGroupContainer';
import {FormReducer as networking} from '../../reducers/serviceForm/Networking';
import {FormReducer as portDefinitions} from '../../reducers/serviceForm/PortDefinitions';
import HostUtil from '../../utils/HostUtil';
import Icon from '../../../../../../src/js/components/Icon';
import Networking from '../../../../../../src/js/constants/Networking';

class NetworkingFormSection extends Component {
  getHostPortFields(portDefinition, index) {
    return [
      <FormGroup className="column-3" key="host-port">
        <FieldLabel>
          Host Port
        </FieldLabel>
        <FieldInput name={`portDefinitions.${index}.hostPort`}
          type="number"
          value={portDefinition.hostPort} />
      </FormGroup>,
      <FormGroup className="column-auto flush-left" key="assign-automatically">
        <FieldLabel>
          &nbsp;
        </FieldLabel>
        <FieldLabel matchInputHeight={true}>
          <FieldInput name={`portDefinitions.${index}.automaticPort`}
            type="checkbox"
            value={portDefinition.automaticPort} />
          Assign Automatically
        </FieldLabel>
      </FormGroup>
    ];
  }

  getLoadBalancedServiceAddressField({checkboxName, checkboxValue, port}) {
    let hostname = HostUtil.stringToHostname(this.props.data.id);

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
            <FieldInput name={checkboxName}
              type="checkbox"
              value={checkboxValue} />
            Enabled
          </FieldLabel>
        </FormGroup>
        <FormGroup className="column-auto flush-left">
          <span>
            {hostname}{Networking.L4LB_ADDRESS}:{port}
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
              <FieldInput checked={portDefinition.protocol === 'tcp'}
                name={`portDefinitions.${index}.protocol`}
                type="radio"
                value="tcp" />
              TCP
            </FieldLabel>
          </FormGroup>
          <FormGroup className="column-auto">
            <FieldLabel matchInputHeight={true}>
              <FieldInput checked={portDefinition.protocol === 'udp'}
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
              <FieldInput name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
            </FormGroup>
            <FormGroup className="column-6">
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput name={`portDefinitions.${index}.name`}
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
              <FieldInput name={`portDefinitions.${index}.name`}
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
              <FieldInput name={`portDefinitions.${index}.containerPort`}
                type="number"
                value={portDefinition.containerPort} />
            </FormGroup>
            <FormGroup className="column-6">
              <FieldLabel>
                Service Endpoint Name
              </FieldLabel>
              <FieldInput name={`portDefinitions.${index}.name`}
                type="text"
                value={portDefinition.name} />
            </FormGroup>
            <FormGroup className="column-3">
              <FieldLabel>
                Port Mapping
              </FieldLabel>
              <FieldLabel matchInputHeight={true}>
                <FieldInput name={`portDefinitions.${index}.portMapping`}
                  type="checkbox"
                  value={portDefinition.portMapping} />
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
    let {networking, portDefinitions} = this.props.data;

    if (networking.type === Networking.type.BRIDGE) {
      return this.getBridgeServiceEndpoints(portDefinitions);
    }

    if (networking.type === Networking.type.USER) {
      return this.getVirtualNetworkServiceEndpoints(portDefinitions);
    }

    // Default to network type host.
    return this.getHostServiceEndpoints(portDefinitions);
  }

  render() {
    let {container, networking = {}} = this.props.data;

    let isNetworkTypeDisabled = container == null
      || container.docker.image == null;

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
              Network Type
            </FieldLabel>
            <FieldSelect disabled={isNetworkTypeDisabled}
              name="networking.type"
              value={networking.type}>
              <option value={Networking.type.HOST}>Host</option>
              <option value={Networking.type.BRIDGE}>Bridge</option>
              <option value={Networking.type.USER}>Virtual Network</option>
            </FieldSelect>
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
            className="button button-primary-link button-flush"
            onClick={this.props.onAddItem.bind(
              this,
              {
                value: serviceEndpoints.length,
                path: 'serviceEndpoints'
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
  networking,
  portDefinitions
};

module.exports = NetworkingFormSection;
