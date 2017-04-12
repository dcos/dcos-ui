import { Paginate } from '../../utils/connections';
import { toGlobalId } from '../../utils/globalId';

export default {
  GroupContent: {
    /*
      Resolve the GraphQL type for the GroupContent union
     */
    __resolveType(obj) {
      return obj.__graphQLType__;
    }
  },

  Group: {
    id(group) {
      return toGlobalId('group', group.id);
    },

    contents(group, args, ctx) {
      const mergedContents = Promise.all([

        ctx.models.Groups.getContents(group.id),
        ctx.models.Frameworks.getAllByName()

      ]).then(([groupContents, frameworksByName]) => {

        groupContents.forEach((item) => {
          // Check for Framework name
          const frameworkName = item.labels &&
            item.labels.DCOS_PACKAGE_FRAMEWORK_NAME;

          if (frameworkName && frameworksByName.has(frameworkName)) {
            // Change to Framework
            Object.defineProperty(item, '__graphQLType__', {
              value: 'Framework'
            });
            // Attach framework data from mesos
            item.mesosInfo = frameworksByName.get(frameworkName);
          }
        });

        return groupContents;
      });

      return Paginate(mergedContents, args);
    }
  }
};
