import React, { PropTypes } from "react";
import deepEqual from "deep-equal";

import ApplicationSpec from "../../structs/ApplicationSpec";
import FieldHelp from "../../../../../../src/js/components/form/FieldHelp";
import FieldLabel from "../../../../../../src/js/components/form/FieldLabel";
import { SYNTAX_ERROR } from "../../constants/ServiceErrorTypes";
import JSONEditor from "../../../../../../src/js/components/JSONEditor";
import PodSpec from "../../structs/PodSpec";
import ServiceUtil from "../../utils/ServiceUtil";
import ServiceValidatorUtil from "../../utils/ServiceValidatorUtil";

const METHODS_TO_BIND = ["handleJSONChange", "handleJSONErrorStateChange"];

class CreateServiceJsonOnly extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      appConfig: ServiceUtil.getServiceJSON(this.props.service)
    };

    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  /**
   * @override
   */
  componentWillReceiveProps(nextProps) {
    const { service } = nextProps;
    const prevJSON = ServiceUtil.getServiceJSON(this.props.service);
    const nextJSON = ServiceUtil.getServiceJSON(service);
    // Make sure to not set state unless the service has actually changed
    if (deepEqual(prevJSON, nextJSON)) {
      return;
    }

    this.setState({
      appConfig: ServiceUtil.getServiceJSON(service)
    });
  }

  /**
   * Emmit the correct ServiceSpec on JSON change
   *
   * @param {Object} jsonObject - The JSON object from which to build the spec
   */
  handleJSONChange(jsonObject) {
    let newObject;
    if (ServiceValidatorUtil.isPodSpecDefinition(jsonObject)) {
      newObject = new PodSpec(jsonObject);
    } else {
      newObject = new ApplicationSpec(jsonObject);
    }

    this.props.onChange(newObject);
  }

  /**
   * Emmit JSON form errors if the syntax is invalid
   *
   * @param {Boolean} errorState - True if there are JSON syntax errors
   */
  handleJSONErrorStateChange(errorState) {
    const { errors, onErrorsChange } = this.props;
    const hasJsonError = errors.some(function(error) {
      return error.type === SYNTAX_ERROR;
    });

    // Produce a JSON error if we have errors
    if (errorState && !hasJsonError) {
      onErrorsChange([
        {
          path: [],
          type: SYNTAX_ERROR,
          variables: {},
          message: "The input entered is not a valid JSON string"
        }
      ]);
    }

    // Remove JSON error if we are back to normal
    if (!errorState && hasJsonError) {
      onErrorsChange([]);
    }
  }

  render() {
    const { appConfig } = this.state;
    const { errors, onPropertyChange } = this.props;

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
            errors={errors}
            onChange={this.handleJSONChange}
            onErrorStateChange={this.handleJSONErrorStateChange}
            onPropertyChange={onPropertyChange}
            showGutter={true}
            showPrintMargin={false}
            theme="monokai"
            value={appConfig}
          />
        </div>
      </div>
    );
  }
}

CreateServiceJsonOnly.defaultProps = {
  onChange() {},
  onErrorsChange() {},
  onPropertyChange() {}
};

CreateServiceJsonOnly.propTypes = {
  errors: PropTypes.array.isRequired,
  onChange: PropTypes.func,
  onErrorsChange: PropTypes.func,
  onPropertyChange: PropTypes.func,
  service: PropTypes.object
};

module.exports = CreateServiceJsonOnly;
