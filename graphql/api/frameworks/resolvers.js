import { toGlobalId } from '../../utils/globalId';
import { Paginate } from '../../utils/connections';

export default {
  Framework: {
    id(service) {
      return toGlobalId('service', service.id);
    },

    name(service) {
      return service.mesosInfo.name;
    },

    tasks(service, args, ctx) {
      const tasks = ctx.models.Tasks.getByServiceId(service.id);

      return Paginate(tasks, args);
    }
  }
};
