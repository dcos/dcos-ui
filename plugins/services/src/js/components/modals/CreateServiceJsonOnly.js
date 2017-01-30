import React, {PropTypes} from 'react';
import deepEqual from 'deep-equal';

import Application from '../../structs/Application';
import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';
import FieldHelp from '../../../../../../src/js/components/form/FieldHelp';
import FieldLabel from '../../../../../../src/js/components/form/FieldLabel';
import JSONEditor from '../../../../../../src/js/components/JSONEditor';
import MarathonAppValidators from '../../validators/MarathonAppValidators';
import PodSpec from '../../structs/PodSpec';
import PodValidators from '../../../../../../src/resources/raml/marathon/v2/types/pod.raml';
import ServiceUtil from '../../utils/ServiceUtil';
import ServiceValidatorUtil from '../../utils/ServiceValidatorUtil';

const METHODS_TO_BIND = [
  'handleJSONChange',
  'handleJSONErrorStateChange'
];

const APP_ERROR_VALIDATORS = [
  AppValidators.App,
  MarathonAppValidators.containsCmdArgsOrContainer,
  MarathonAppValidators.complyWithResidencyRules,
  MarathonAppValidators.complyWithIpAddressRules
];

const POD_ERROR_VALIDATORS = [
  PodValidators.Pod
];

class CreateServiceJsonOnly extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      appConfig: ServiceUtil.getServiceJSON(this.props.service),
      errorList: [],
      jsonHasErrors: false
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentDidUpdate(prevProps, prevState) {
    const hasErrors = (this.state.errorList.length !== 0) || this.state.jsonHasErrors;
    const hadErrors = (prevState.errorList.length !== 0) || prevState.jsonHasErrors;

    // Notify parent component for our error state
    if (hasErrors !== hadErrors) {
      this.props.onErrorStateChange(hasErrors);
    }
  }

  /**
   * @override
   */
  componentWillReceiveProps({service}) {
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(service);
    // Make sure to not set state unless the service has actually changed
    if (deepEqual(prevJSON, nextJSON)) {
      return;
    }

    this.setState(this.getNewStateForJSON(ServiceUtil.getServiceJSON(service)));
  }

  handleJSONChange(jsonObject) {
    let newObject;
    if (ServiceValidatorUtil.isPodSpecDefinition(jsonObject)) {
      newObject = new PodSpec(jsonObject);
    } else {
      newObject = new Application(jsonObject);
    }

    this.props.onChange(newObject);
  }

  handleJSONErrorStateChange(errorState) {
    this.setState({jsonHasErrors: !!errorState});
  }

  validateCurrentState() {
    const {appConfig} = this.state;
    const {errorList} = this.getNewStateForJSON(appConfig);

    this.setState({errorList});

    return Boolean(errorList.length);
  }

  getNewStateForJSON(appConfig) {
    const isPod = ServiceValidatorUtil.isPodSpecDefinition(appConfig);

    // Pick validators according to JSON specification type
    let validators = APP_ERROR_VALIDATORS;
    if (isPod) {
      validators = POD_ERROR_VALIDATORS;
    }

    // Compile the list of errors
    const errorList = DataValidatorUtil.validate(appConfig, validators);

    // Update the error display
    return {appConfig, errorList};
  }

  render() {
    let {appConfig, errorList} = this.state;

    return (
      <div className="create-service-modal-json-only container container-wide">
        <div className="create-service-modal-json-only-introduction">
          <FieldLabel>JSON Configuration</FieldLabel>
          <FieldHelp>
            Use this text area to customize your configuration via JSON.
          </FieldHelp>
        </div>
        <div className="create-service-modal-json-only-editor-container">
          <JSONEditor
            className="create-service-modal-json-only-editor"
            errors={errorList}
            onChange={this.handleJSONChange}
            onErrorStateChange={this.handleJSONErrorStateChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            value={appConfig} />
        </div>
      </div>
    );
  }
}

CreateServiceJsonOnly.defaultProps = {
  onChange() {},
  onErrorStateChange() {}
};

CreateServiceJsonOnly.propTypes = {
  onChange: PropTypes.func,
  onErrorStateChange: PropTypes.func,
  service: PropTypes.object
};

module.exports = CreateServiceJsonOnly;
