import { toGlobalId } from '../../utils/globalId';
import getTaskHealth from '../../utils/TaskHealth';

export default {
  Task: {
    id(task) {
      return toGlobalId('task', task.mesos.id);
    },

    name(task) {
      return task.mesos.name;
    },

    health(task) {
      return getTaskHealth(task);
    },

    agent(task, args, ctx) {
      const slaveId = task.mesos.slave_id;

      if (!slaveId) {
        return null;
      }

      return ctx.models.Agents.getById(slaveId);
    }
  }
};
