import { Trans, t } from "@lingui/macro";
import { withI18n } from "@lingui/react";
import PropTypes from "prop-types";
import React from "react";
import isEqual from "lodash.isequal";

import FieldHelp from "#SRC/js/components/form/FieldHelp";
import FieldLabel from "#SRC/js/components/form/FieldLabel";
import JSONEditor from "#SRC/js/components/JSONEditor";

import { SYNTAX_ERROR } from "../../constants/ServiceErrorTypes";
import ApplicationSpec from "../../structs/ApplicationSpec";
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
    if (isEqual(prevJSON, nextJSON)) {
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
    const { errors, onErrorsChange, i18n } = this.props;
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
          message: i18n._(t`The input entered is not a valid JSON string`)
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
      <div className="create-service-modal-json-only">
        <div className="create-service-modal-json-only-introduction">
          <FieldLabel>
            <Trans render="span">JSON Configuration</Trans>
          </FieldLabel>
          <FieldHelp>
            <Trans render="span">
              Use this text area to customize your configuration via JSON.
            </Trans>
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

module.exports = withI18n()(CreateServiceJsonOnly);
