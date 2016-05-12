import {Modal} from 'reactjs-components';
import React from 'react';

import PackageUpgradeDetail from '../PackageUpgradeDetail';
import ServicePlan from '../../structs/ServicePlan';

class ServicePlanProgressModal extends React.Component {
  render() {
    let {props} = this;

    return (
      <Modal
        bodyClass="modal-content allow-overflow"
        dynamicHeight={false}
        innerBodyClass="flush-top flush-bottom"
        maxHeightPercentage={1}
        modalClass="modal"
        onClose={props.onClose}
        open={props.open}
        showCloseButton={false}
        useGemini={false}>
        <PackageUpgradeDetail servicePlan={props.servicePlan}
          service={props.service} onClose={props.onClose} />
      </Modal>
    );
  }
}

ServicePlanProgressModal.defaultProps = {
  onClose: function () {},
  open: false
};

ServicePlanProgressModal.propTypes = {
  servicePlan: React.PropTypes.instanceOf(ServicePlan),
  open: React.PropTypes.bool,
  onClose: React.PropTypes.func
};

module.exports = ServicePlanProgressModal;
