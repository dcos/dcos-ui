import React, { PropTypes } from "react";

import ActionKeys from "../../constants/ActionKeys";
import KillPodInstanceModal from "./KillPodInstanceModal";
import KillTaskModal from "./KillTaskModal";
import ServiceActionItem from "../../constants/ServiceActionItem";

class TaskModals extends React.Component {
  getKillPodInstancesModal() {
    const {
      actions,
      actionErrors,
      clearError,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const key = ActionKeys.POD_INSTANCES_KILL;

    return (
      <KillPodInstanceModal
        killPodInstances={actions.killPodInstances}
        clearError={() => clearError(key)}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        open={modalProps.id === ServiceActionItem.KILL_POD_INSTANCES}
        onClose={() => onClose(key)}
        {...modalProps}
      />
    );
  }

  getKillTasksModal() {
    const {
      actions,
      actionErrors,
      clearError,
      onClose,
      modalProps,
      pendingActions
    } = this.props;

    const key = ActionKeys.TASK_KILL;

    return (
      <KillTaskModal
        killTasks={actions.killTasks}
        clearError={() => clearError(key)}
        isPending={!!pendingActions[key]}
        errors={actionErrors[key]}
        open={modalProps.id === ServiceActionItem.KILL_TASKS}
        onClose={() => onClose(key)}
        {...modalProps}
      />
    );
  }

  render() {
    return (
      <div>
        {this.getKillPodInstancesModal()}
        {this.getKillTasksModal()}
      </div>
    );
  }
}

const actionPropTypes = PropTypes.shape({
  killPodInstances: PropTypes.func,
  killTasks: PropTypes.func
}).isRequired;

TaskModals.propTypes = {
  actionErrors: PropTypes.object.isRequired,
  actions: actionPropTypes,
  clearError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  modalProps: PropTypes.object,
  pendingActions: PropTypes.object
};

module.exports = TaskModals;
