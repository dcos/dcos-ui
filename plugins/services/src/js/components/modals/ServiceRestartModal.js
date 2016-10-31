import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import AppLockedMessage from './AppLockedMessage';
import ModalHeading from '../../../../../../src/js/components/modals/ModalHeading';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceRestartModal extends React.Component {
  constructor() {
    super(...arguments);

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

  shouldForceUpdate() {
    return this.props.errors && /force=true/.test(this.props.errors);
  }

  getErrorMessage() {
    let {errors} = this.props;

    if (!errors) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      return <AppLockedMessage />;
    }

    return (
      <p className="text-danger flush-top">{errors}</p>
    );
  }

  render() {
    const {
      isPending,
      onClose,
      open,
      service,
      restartService
    } = this.props;

    let heading = (
      <ModalHeading>
        Restart Service
      </ModalHeading>
    );
    let serviceName = '';

    if (service) {
      serviceName = service.getId();
    }

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonCallback={onClose}
        rightButtonText="Restart Service"
        rightButtonClassName="button button-danger"
        rightButtonCallback={() => restartService(service, this.shouldForceUpdate())}
        showHeader={true}>
        <p>
          Are you sure you want to restart <span className="emphasize">{serviceName}</span>?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceRestartModal.propTypes = {
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  restartService: PropTypes.func.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceRestartModal;
