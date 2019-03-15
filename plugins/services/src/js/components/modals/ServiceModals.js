import PropTypes from "prop-types";
import React from "react";

import ActionKeys from "../../constants/ActionKeys";
import ServiceTree from "../../structs/ServiceTree";

import ServiceActionItem from "../../constants/ServiceActionItem";
import ServiceDestroyModal from "./ServiceDestroyModal";
import ServiceGroupFormModal from "./ServiceGroupFormModal";
import ServiceRestartModal from "./ServiceRestartModal";
import ServiceResumeModal from "./ServiceResumeModal";
import ServiceScaleFormModal from "./ServiceScaleFormModal";
import ServiceSpecUtil from "../../utils/ServiceSpecUtil";
import ServiceStopModal from "./ServiceStopModal";
import DisabledGroupDestroyModal from "./DisabledGroupDestroyModal";

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

    if (modalProps.service == null) {
      return null;
    }

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

  getDisabledGroupDestroyModal() {
    const { onClose, modalProps } = this.props;
    const key = ActionKeys.GROUP_DELETE;

    return (
      <DisabledGroupDestroyModal
        onClose={() => onClose(key)}
        isOpen={modalProps.id === ServiceActionItem.DELETE}
      />
    );
  }

  getDestroyModal() {
    const { actionErrors, onClose, modalProps, pendingActions } = this.props;
    const { service } = modalProps;
    const isGroup = service instanceof ServiceTree;

    if (isGroup && service.getItems().length > 0) {
      return this.getDisabledGroupDestroyModal();
    }

    let deleteItem = force => this.props.actions.deleteService(service, force);
    let key = ActionKeys.SERVICE_DELETE;

    if (isGroup) {
      deleteItem = force => this.props.actions.deleteGroup(service, force);
      key = ActionKeys.GROUP_DELETE;
    }

    return (
      <ServiceDestroyModal
        deleteItem={deleteItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.DELETE}
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

  getStopModal() {
    const { actionErrors, onClose, modalProps, pendingActions } = this.props;

    const { service } = modalProps;
    const isGroup = service instanceof ServiceTree;

    let key = ActionKeys.SERVICE_EDIT;
    let stopItem = force =>
      this.props.actions.editService(
        service,
        ServiceSpecUtil.setServiceInstances(service.getSpec(), 0),
        force
      );

    if (isGroup) {
      key = ActionKeys.GROUP_EDIT;
      stopItem = force =>
        this.props.actions.editGroup(
          {
            id: service.getId(),
            scaleBy: 0
          },
          force
        );
    }

    return (
      <ServiceStopModal
        stopItem={stopItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.STOP}
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
        {this.getStopModal()}
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

export default ServiceModals;
