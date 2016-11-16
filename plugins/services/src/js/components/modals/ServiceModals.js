import React, {PropTypes} from 'react';

import ActionKeys from '../../constants/ActionKeys';
import Application from '../../structs/Application';
import ServiceTree from '../../structs/ServiceTree';

import ServiceActionItem from '../../constants/ServiceActionItem';
import ServiceDestroyModal from './ServiceDestroyModal';
import NewCreateServiceModal from './NewCreateServiceModal';
import ServiceGroupFormModal from './ServiceGroupFormModal';
import ServiceRestartModal from './ServiceRestartModal';
import ServiceScaleFormModal from './ServiceScaleFormModal';
import ServiceSpecUtil from '../../utils/ServiceSpecUtil';
import ServiceSuspendModal from './ServiceSuspendModal';

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
    const {service} = modalProps;

    return (
      <ServiceGroupFormModal
        createGroup={actions.createGroup}
        clearError={() => clearError(key)}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        parentGroupId={service.getId()}
        open={modalProps.id === ServiceActionItem.CREATE_GROUP}
        onClose={() => onClose(key)} />
    );
  }

  getCreateModal() {
    const {
      actionErrors,
      clearError,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    // The regular expression `/^(\/.+)$/` is looking for the beginning of the
    // string and matches if the string starts with a `/` and does contain more
    // characters after the slash. This is combined into a group and then
    // replaced with the first group which is the complete string and a `/` is
    // appended. This is needed because in most case a path like
    // `/group/another-group` will be given by `getId` except on root then the
    // return value of `getId` would be `/` so in most cases we want to append a
    // `/` so that the user can begin typing the `id` of their application.
    const {service} = modalProps;
    const baseId = service.getId().replace(/^(\/.+)$/, '$1/');
    const key = ActionKeys.SERVICE_CREATE;
    const createService = (_, serviceSpec, force) => {
      this.props.actions.createService(serviceSpec, force);
    };

    return (
      <NewCreateServiceModal
        clearError={() => clearError(key)}
        errors={actionErrors[key]}
        isEdit={false}
        isPending={!!pendingActions[key]}
        marathonAction={createService}
        open={modalProps.id === ServiceActionItem.CREATE}
        service={new Application({id: baseId})}
        onClose={() => onClose(key)} />
    );
  }

  getEditModal() {
    const {
      actionErrors,
      clearError,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const {service} = modalProps;
    const isGroup = service instanceof ServiceTree;
    const key = ActionKeys.SERVICE_EDIT;
    const editService = (updatedService, serviceSpec, force) => {
      this.props.actions.editService(updatedService, serviceSpec, force);
    };

    let serviceToEdit = service;

    // Pass in a fake Application to keep the PropTypes happy when
    // this modal isn't active.
    if (isGroup && modalProps.id !== ServiceActionItem.EDIT) {
      serviceToEdit = new Application({id: '/'});
    }

    return (
      <NewCreateServiceModal
        clearError={() => clearError(key)}
        errors={actionErrors[key]}
        isEdit={true}
        isPending={!!pendingActions[key]}
        marathonAction={editService}
        open={modalProps.id === ServiceActionItem.EDIT}
        service={serviceToEdit}
        onClose={() => onClose(key)} />
    );
  }

  getDestroyModal() {
    const {
      actionErrors,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const {service} = modalProps;
    const isGroup = service instanceof ServiceTree;

    let deleteItem = () => this.props.actions.deleteService(service);
    let key = ActionKeys.SERVICE_DELETE;

    if (isGroup) {
      deleteItem = () => this.props.actions.deleteGroup(service.getId());
      key = ActionKeys.GROUP_DELETE;
    }

    return (
      <ServiceDestroyModal
        deleteItem={deleteItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.DESTROY}
        onClose={() => onClose(key)}
        service={service} />
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
    const {service} = modalProps;

    return (
      <ServiceRestartModal
        restartService={actions.restartService}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        open={modalProps.id === ServiceActionItem.RESTART}
        onClose={() => onClose(key)}
        service={service} />
    );
  }

  getScaleModal() {
    const {
      actionErrors,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const {service} = modalProps;
    const isGroup = service instanceof ServiceTree;

    let key = ActionKeys.SERVICE_EDIT;
    let scaleItem = (instances, force) => this.props.actions.editService(
      service,
      ServiceSpecUtil.setServiceInstances(
        service.getSpec(),
        parseInt(instances, 10)
      ), force);

    if (isGroup) {
      key = ActionKeys.GROUP_EDIT;
      scaleItem = (instances, force) => this.props.actions.editGroup({
        id: service.id,
        scaleBy: parseInt(instances, 10)
      }, force);
    }

    return (
      <ServiceScaleFormModal
        scaleItem={scaleItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.SCALE}
        onClose={() => onClose(key)}
        service={service} />
    );
  }

  getSuspendModal() {
    const {
      actionErrors,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const {service} = modalProps;
    const isGroup = service instanceof ServiceTree;

    let key = ActionKeys.SERVICE_EDIT;
    let suspendItem = (force) => this.props.actions.editService(
      service,
      ServiceSpecUtil.setServiceInstances(service.getSpec(), 0),
      force
    );

    if (isGroup) {
      key = ActionKeys.GROUP_EDIT;
      suspendItem = (force) => this.props.actions.editGroup({
        id: service.getId(),
        scaleBy: 0
      }, force);
    }

    return (
      <ServiceSuspendModal
        suspendItem={suspendItem}
        errors={actionErrors[key]}
        isPending={!!pendingActions[key]}
        open={modalProps.id === ServiceActionItem.SUSPEND}
        onClose={() => onClose(key)}
        service={service} />
    );
  }

  render() {
    return (
      <div>
        {this.getGroupModal()}
        {this.getCreateModal()}
        {this.getEditModal()}
        {this.getDestroyModal()}
        {this.getRestartModal()}
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
  createService: PropTypes.func,
  deleteService: PropTypes.func,
  editService: PropTypes.func,
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
