import React, {PropTypes} from 'react';

import JSONEditor from '../../../../../../src/js/components/JSONEditor';

import AppValidators from '../../../../../../src/resources/raml/marathon/v2/types/app.raml';
import DataValidatorUtil from '../../../../../../src/js/utils/DataValidatorUtil';
import PodValidators from '../../../../../../src/resources/raml/marathon/v2/types/pod.raml';
import ServiceValidatorUtil from '../../utils/ServiceValidatorUtil';
import ServiceUtil from '../../utils/ServiceUtil';

const METHODS_TO_BIND = [
  'handleJSONChange',
  'handleJSONErrorStateChange'
];

const APP_ERROR_VALIDATORS = [
  AppValidators.App
];

const POD_ERROR_VALIDATORS = [
  PodValidators.Pod
];

class CreateServiceJsonOnly extends React.Component {

  constructor() {
    super(...arguments);

    this.state = Object.assign(
      {
        appConfig: {},
        errorList: [],
        jsonHasErrors: false
      },
      this.getNewStateForJSON(
        ServiceUtil.getServiceJSON(this.props.service)
      )
    );

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentDidUpdate(prevProps, prevState) {
    window.ReactDOM = ReactDOM;
    window.fiddle = this;
    let hasErrors = (this.state.errorList.length !== 0) || this.state.jsonHasErrors;
    let hadErrors = (prevState.errorList.length !== 0) || prevState.jsonHasErrors;

    // Notify parent component for our error state
    if (hasErrors !== hadErrors) {
      this.props.onErrorStateChange(hasErrors);
    }
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    this.setState(
      this.getNewStateForJSON(
        ServiceUtil.getServiceJSON(nextProps.service)
      )
    );
  }

  handleJSONChange(jsonObject) {
    this.props.onChange(jsonObject);
  }

  handleJSONErrorStateChange(errorState) {
    this.setState({
      jsonHasErrors: !!errorState
    });
  }

  getNewStateForJSON(appConfig) {
    let isPod = ServiceValidatorUtil.isPodSpecDefinition(appConfig);

    // Pick validators according to JSON specification type
    let validators = APP_ERROR_VALIDATORS;
    if (isPod) {
      validators = POD_ERROR_VALIDATORS;
    }

    // Compile the list of errors
    let errorList = DataValidatorUtil.validate(appConfig, validators);

    // Update the error display
    return {appConfig, errorList};
  }

  render() {
    let {appConfig, errorList} = this.state;

    // Note: The `transform` parameter is just a hack to properly align the
    //       error message.
    let editorStyles = {
      position: 'absolute',
      'transform': 'translateX(0)'
    };

    return (
      <JSONEditor
        errors={errorList}
        className="modal-full-screen-fill-body"
        onChange={this.handleJSONChange}
        onErrorStateChange={this.handleJSONErrorStateChange}
        showGutter={true}
        showPrintMargin={false}
        style={editorStyles}
        theme="monokai"
        height="100%"
        value={appConfig}
        width="100%" />
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
