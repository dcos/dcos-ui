import Agents from '../agents/schema';
import Groups from '../groups/schema';

const Cluster = `
  type Cluster {
    agent(
      # The ID of the Agent
      id: String!
    ): Agent

    # Agents in the cluster
    agents(after: String, first: Int, before: String, last: Int): AgentConnection

    group(
      # The ID of the Group
      id: String
    ): Group
  }
`;

export default () => [Cluster, Agents, Groups];
