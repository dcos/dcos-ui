import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import ModalHeading from '../../../../../../src/js/components/modals/ModalHeading';
import Pod from '../../structs/Pod';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceDestroyModal extends React.Component {
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

  getErrorMessage() {
    let {errors} = this.props;

    if (!errors) {
      return null;
    }

    return (
      <p className="text-danger flush-top">{errors}</p>
    );
  }

  render() {
    const {
      deleteItem,
      isPending,
      onClose,
      open,
      service
    } = this.props;

    let itemText = 'Service';
    let serviceName = '';

    if (service instanceof Pod) {
      itemText = 'Pod';
    }

    if (service instanceof ServiceTree) {
      itemText = 'Group';
    }

    if (service) {
      serviceName = service.getId();
    }

    let heading = (
      <ModalHeading className="text-danger">
        Destroy {itemText}
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        rightButtonText={`Destroy ${itemText}`}
        rightButtonClassName="button button-danger"
        rightButtonCallback={deleteItem}
        showHeader={true}>
        <p>
          Destroying <span className="emphasize">{serviceName}</span> is irreversible. Are you sure you want to continue?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceDestroyModal.propTypes = {
  deleteItem: PropTypes.func.isRequired,
  errors: PropTypes.string,
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceDestroyModal;
