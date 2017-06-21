import React, { PropTypes } from "react";

import ActionKeys from "../../constants/ActionKeys";
import ServiceTree from "../../structs/ServiceTree";

import ServiceActionItem from "../../constants/ServiceActionItem";
import ServiceDestroyModal from "./ServiceDestroyModal";
import ServiceGroupFormModal from "./ServiceGroupFormModal";
import ServiceRestartModal from "./ServiceRestartModal";
import ServiceResumeModal from "./ServiceResumeModal";
import ServiceScaleFormModal from "./ServiceScaleFormModal";
import ServiceSpecUtil from "../../utils/ServiceSpecUtil";
import ServiceSuspendModal from "./ServiceSuspendModal";

class ServiceModals extends React.Component {
  getGroupModal() {
    const {
      actions,
      actionErrors,
      clearError,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const key = ActionKeys.GROUP_CREATE;
    const { service } = modalProps;

    return (
      <ServiceGroupFormModal
        createGroup={actions.createGroup}
        clearError={() => clearError(key)}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        parentGroupId={service.getId()}
        open={modalProps.id === ServiceActionItem.CREATE_GROUP}
        onClose={() => onClose(key)}
      />
    );
  }

  getDestroyModal() {
    const { actionErrors, onClose, modalProps, pendingActions } = this.props;

    const { service } = modalProps;
    const isGroup = service instanceof ServiceTree;

    let deleteItem = force => this.props.actions.deleteService(service, force);
    let key = ActionKeys.SERVICE_DELETE;

    if (isGroup) {
      deleteItem = force =>
        this.props.actions.deleteGroup(service.getId(), force);
      key = ActionKeys.GROUP_DELETE;
    }

    return (
      <ServiceDestroyModal
        deleteItem={deleteItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.DESTROY}
        onClose={() => onClose(key)}
        service={service}
      />
    );
  }

  getRestartModal() {
    const {
      actions,
      actionErrors,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const key = ActionKeys.SERVICE_RESTART;
    const { service } = modalProps;

    return (
      <ServiceRestartModal
        restartService={actions.restartService}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        open={modalProps.id === ServiceActionItem.RESTART}
        onClose={() => onClose(key)}
        service={service}
      />
    );
  }

  getResumeModal() {
    const {
      actions,
      actionErrors,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const key = ActionKeys.SERVICE_EDIT;
    const { service } = modalProps;

    const resumeService = (instances, force) =>
      actions.editService(
        service,
        ServiceSpecUtil.setServiceInstances(
          service.getSpec(),
          parseInt(instances, 10)
        ),
        force
      );

    return (
      <ServiceResumeModal
        resumeService={resumeService}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        open={modalProps.id === ServiceActionItem.RESUME}
        onClose={() => onClose(key)}
        service={service}
      />
    );
  }

  getScaleModal() {
    const { actionErrors, onClose, modalProps, pendingActions } = this.props;

    const { service } = modalProps;
    const isGroup = service instanceof ServiceTree;

    let key = ActionKeys.SERVICE_EDIT;
    let scaleItem = (instances, force) =>
      this.props.actions.editService(
        service,
        ServiceSpecUtil.setServiceInstances(
          service.getSpec(),
          parseInt(instances, 10)
        ),
        force
      );

    if (isGroup) {
      key = ActionKeys.GROUP_EDIT;
      scaleItem = (instances, force) =>
        this.props.actions.editGroup(
          {
            id: service.id,
            scaleBy: parseInt(instances, 10)
          },
          force
        );
    }

    return (
      <ServiceScaleFormModal
        scaleItem={scaleItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.SCALE}
        onClose={() => onClose(key)}
        service={service}
      />
    );
  }

  getSuspendModal() {
    const { actionErrors, onClose, modalProps, pendingActions } = this.props;

    const { service } = modalProps;
    const isGroup = service instanceof ServiceTree;

    let key = ActionKeys.SERVICE_EDIT;
    let suspendItem = force =>
      this.props.actions.editService(
        service,
        ServiceSpecUtil.setServiceInstances(service.getSpec(), 0),
        force
      );

    if (isGroup) {
      key = ActionKeys.GROUP_EDIT;
      suspendItem = force =>
        this.props.actions.editGroup(
          {
            id: service.getId(),
            scaleBy: 0
          },
          force
        );
    }

    return (
      <ServiceSuspendModal
        suspendItem={suspendItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.SUSPEND}
        onClose={() => onClose(key)}
        service={service}
      />
    );
  }

  render() {
    return (
      <div>
        {this.getGroupModal()}
        {this.getDestroyModal()}
        {this.getRestartModal()}
        {this.getResumeModal()}
        {this.getScaleModal()}
        {this.getSuspendModal()}
      </div>
    );
  }
}

const actionPropTypes = PropTypes.shape({
  revertDeployment: PropTypes.func,
  createGroup: PropTypes.func,
  deleteGroup: PropTypes.func,
  editGroup: PropTypes.func,
  deleteService: PropTypes.func,
  restartService: PropTypes.func
}).isRequired;

ServiceModals.propTypes = {
  actionErrors: PropTypes.object.isRequired,
  actions: actionPropTypes,
  clearError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  modalProps: PropTypes.object,
  pendingActions: PropTypes.object
};

module.exports = ServiceModals;
