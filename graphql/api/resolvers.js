import AgentsResolvers from './agents/resolvers';
import ApplicationResolvers from './applications/resolvers';
import ClusterResolvers from './cluster/resolvers';
import FrameworkResolvers from './frameworks/resolvers';
import GroupsResolvers from './groups/resolvers';
import TasksResolvers from './tasks/resolvers';

// Merge all resolvers
const resolvers = Object.assign(
  {},
  AgentsResolvers,
  ApplicationResolvers,
  ClusterResolvers,
  FrameworkResolvers,
  GroupsResolvers,
  TasksResolvers
);

export default resolvers;
