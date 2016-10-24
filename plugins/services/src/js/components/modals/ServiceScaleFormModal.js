import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import FormModal from '../../../../../../src/js/components/FormModal';
import Pod from '../../structs/Pod';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceScaleFormModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null
    };

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending
      && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    let {errors} = nextProps;
    if (!errors) {
      this.setState({errorMsg: null});

      return;
    }

    let {message: errorMsg = '', details} = errors;
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function (memo, error) {
        return `${memo} ${error.errors.join(' ')}`;
      }, '');
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({errorMsg});
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  getErrorMessage() {
    const {errorMsg = null} = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return (
        <h4 className="text-align-center text-danger flush-top">
            App is currently locked by one or more deployments. Press the button
            again to forcefully change and deploy the new configuration.
        </h4>
      );
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  getScaleFormDefinition() {
    let {service} = this.props;
    let instancesCount = service.getInstancesCount();

    if (service instanceof ServiceTree) {
      instancesCount = '1.0';
    }

    return [
      {
        fieldType: 'number',
        formGroupClass: 'column-2',
        formElementClass: 'horizontal-center',
        min: 0,
        name: 'instances',
        placeholder: instancesCount,
        value: instancesCount.toString(),
        required: true,
        showLabel: false,
        writeType: 'input'
      }
    ];
  }

  getHeader() {
    let headerText = 'Service';

    if (this.props.service instanceof Pod) {
      headerText = 'Pod';
    }

    if (this.props.service instanceof ServiceTree) {
      headerText = 'Group';
    }

    return (
      <h2 className="modal-header-title text-align-center flush-top">
        Scale {headerText}
      </h2>
    );
  }

  getBodyText() {
    let bodyText = 'How many instances would you like to scale to?';

    if (this.props.service instanceof ServiceTree) {
      bodyText = 'By which factor would you like to scale all applications within this group?';
    }

    return (
      <p className="text-align-center flush-top">
        {bodyText}
      </p>
    );
  }

  render() {
    const {
      clearError,
      isPending,
      onClose,
      open
    } = this.props;

    const buttonDefinition = [
      {
        text: 'Cancel',
        className: 'button button-medium',
        isClose: true
      },
      {
        text: 'Scale Service',
        className: 'button button-primary button-medium',
        isSubmit: true
      }
    ];

    const onSubmit = (model) => {
      this.props.scaleItem(model.instances, this.shouldForceUpdate());
    };

    return (
      <FormModal
        buttonDefinition={buttonDefinition}
        definition={this.getScaleFormDefinition()}
        disabled={isPending}
        onClose={onClose}
        onSubmit={onSubmit}
        onChange={clearError}
        open={open} >
        {this.getHeader()}
        {this.getBodyText()}
        {this.getErrorMessage()}
      </FormModal>
    );
  }
}

ServiceScaleFormModal.propTypes = {
  scaleItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceScaleFormModal;
