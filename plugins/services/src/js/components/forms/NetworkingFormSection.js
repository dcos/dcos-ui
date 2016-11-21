import React, {Component} from 'react';

import FieldInput from '../../../../../../src/js/components/form/FieldInput';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import FieldSelect from '../../../../../../src/js/components/form/FieldSelect';
import FormGroup from '../../../../../../src/js/components/form/FormGroup';
import {FormReducer as networking} from '../../reducers/serviceForm/Networking';
import {FormReducer as serviceEndpoints} from '../../reducers/serviceForm/ServiceEndpoints';
import Icon from '../../../../../../src/js/components/Icon';

class NetworkingFormSection extends Component {
  getVirtualNetworkServiceEndpoints(serviceEndpoints) {
    return serviceEndpoints.map((serviceEndpoint, index) => {
      let portMappingFields = null;

      if (serviceEndpoint.portMapping) {
        portMappingFields = (
          <div className="flex row">
            <FormGroup className="column-3">
              <FieldLabel>
                Host Port
              </FieldLabel>
              <FieldInput name={`serviceEndpoints.${index}.hostPort`}
                type="number"
                value={serviceEndpoint.hostPort} />
            </FormGroup>
            <FormGroup className="column-3 flush-left">
              <FieldLabel>
                &nbsp;
              </FieldLabel>
              <label>
                <FieldInput name={`serviceEndpoints.${index}.hostPort`}
                  type="checkbox"
                  value={serviceEndpoint.hostPort} />
                Assign Automatically
              </label>
            </FormGroup>
            <FormGroup className="column-3">
              <FieldLabel>
                Protocol
              </FieldLabel>
              <FieldLabel>
                <FieldInput name={`serviceEndpoints.${index}.protocol`}
                  type="radio"
                  value={serviceEndpoint.hostPort} />
                TCP
              </FieldLabel>
              <FieldLabel>
                <FieldInput name={`serviceEndpoints.${index}.protocol`}
                  type="radio"
                  value={serviceEndpoint.hostPort} />
                UDP
              </FieldLabel>
            </FormGroup>
          </div>
        );
      }

      return (
        <div className="panel pod flush-top flush-right flush-left" key={index}>
          <div className="pod pod-narrow pod-short">
            <div className="flex row">
              <FormGroup className="column-3">
                <FieldLabel>
                  Container Port
                </FieldLabel>
                <FieldInput name={`serviceEndpoints.${index}.containerPort`}
                  type="number"
                  value={serviceEndpoint.containerPort} />
              </FormGroup>
              <FormGroup className="column-6">
                <FieldLabel>
                  Service Endpoint Name
                </FieldLabel>
                <FieldInput name={`serviceEndpoints.${index}.name`}
                  type="text"
                  value={serviceEndpoint.name} />
              </FormGroup>
              <FormGroup className="column-3">
                <FieldLabel>
                  Port Mapping
                </FieldLabel>
                <FieldInput name={`serviceEndpoints.${index}.portMapping`}
                  type="toggle"
                  value={serviceEndpoint.portMapping} />
              </FormGroup>
            </div>
            {portMappingFields}
          </div>
        </div>
      );
    });
  }

  getServiceEndpoints(serviceEndpoints) {
    return this.getVirtualNetworkServiceEndpoints(serviceEndpoints);
  }

  render() {
    let {networking = {}, serviceEndpoints} = this.props.data;

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
            <FieldSelect name="networking.type" value={networking.type}>
              <option value="host">Host</option>
              <option value="bridge">Bridge</option>
              <option value="virtual-network">Virtual Network</option>
            </FieldSelect>
          </FormGroup>
        </div>
        <h3 className="flush-top short-bottom">
          Service Endpoints
        </h3>
        <p>
          DC/OS can automatically generate a Service Address to connect to each of your load balanced endpoints.
        </p>
        {this.getServiceEndpoints(serviceEndpoints)}
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
  serviceEndpoints
};

module.exports = NetworkingFormSection;
