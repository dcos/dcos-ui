import classNames from 'classnames';
import {Modal} from 'reactjs-components';
import React from 'react';

import ServicePlanProgressModalContents from './ServicePlanProgressModalContents';
import ServicePlan from '../../structs/ServicePlan';

class ServicePlanProgressModal extends React.Component {
  render() {
    let {props} = this;
    let modalSizeModifier;

    if (props.servicePlan) {
      modalSizeModifier = {
        'modal-narrow': props.servicePlan.hasError()
          || props.servicePlan.isComplete()
      };
    }

    let modalClasses = classNames('modal', modalSizeModifier);

    return (
      <Modal
        bodyClass="allow-overflow"
        dynamicHeight={false}
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass={modalClasses}
        onClose={props.onClose}
        open={props.isOpen}
        showCloseButton={false}
        useGemini={false}
        showFooter={false}>
        <ServicePlanProgressModalContents
          onClose={props.onClose}
          service={props.service}
          servicePlan={props.servicePlan} />
      </Modal>
    );
  }
}

ServicePlanProgressModal.defaultProps = {
  onClose: function () {},
  isOpen: false
};

ServicePlanProgressModal.propTypes = {
  servicePlan: React.PropTypes.instanceOf(ServicePlan),
  isOpen: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = ServicePlanProgressModal;
