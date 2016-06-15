/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */

import ChronosStore from '../../stores/ChronosStore';
import DescriptionList from '../../components/DescriptionList';
import TaskDetailsTab from '../services/task-details/TaskDetailsTab';

class JobsTaskDetailsTab extends TaskDetailsTab {
  getDescriptionLists(task) {
    return [
      this.getMesosTaskDetailsDescriptionList(task),
      this.getMesosTaskLabelDescriptionList(task),
      this.getChronosTaskDescriptionList(task)
    ];
  }

  getChronosTaskDescriptionList() {
    let {id, taskID} = this.props.params
    let job = ChronosStore.getJob(id);
    let task = job.getTaskByID(taskID);
    delete task._itemData;

    return (
      <DescriptionList
        className="container container-fluid flush container-pod container-pod-super-short flush-top"
        hash={task} />
    );
  }
}

module.exports = JobsTaskDetailsTab;
