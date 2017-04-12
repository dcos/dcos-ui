import { toGlobalId } from '../../utils/globalId';
import { Paginate } from '../../utils/connections';

export default {
  Agent: {
    id(agent) {
      return toGlobalId('agent', agent.id);
    },

    tasks(agent, args, ctx) {
      const tasks = ctx.models.Tasks.getByAgentId(agent.id);

      return Paginate(tasks, args);
    }
  }
};
