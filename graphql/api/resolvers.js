import AgentsResolvers from './agents/AgentResolvers';
import ApplicationResolvers from './applications/ApplicationResolvers';
import ClusterResolvers from './cluster/ClusterResolvers';
import FrameworkResolvers from './frameworks/FrameworkResolvers';
import GroupsResolvers from './groups/GroupResolvers';
import TasksResolvers from './tasks/TaskResolvers';

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
