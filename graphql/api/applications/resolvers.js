import { toGlobalId } from '../../utils/globalId';
import { Paginate } from '../../utils/connections';

export default {
  Application: {
    id(service) {
      return toGlobalId('service', service.id);
    },

    tasks(service, args, ctx) {
      const tasks = ctx.models.Tasks.getByServiceId(service.id);

      return Paginate(tasks, args);
    }
  }
};
