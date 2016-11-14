import { Paginate } from '../../utils/connections';

export default {
  Cluster: {
    agent(_, { id }, ctx) {
      return ctx.models.Agents.getById(id);
    },

    agents(_, args, ctx) {
      const agents = ctx.models.Agents.getAll();

      return Paginate(agents, args);
    },

    group(_, { id = '/' }, ctx) {
      return ctx.models.Groups.getById(id);
    }

  }
};
