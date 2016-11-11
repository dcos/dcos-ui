import Pagination from '../../helpers/pagination/schema';
import Tasks from '../tasks/schema';

const Agents = `
  # An agent in the cluster
  type Agent {
    # The ID of an object
    id: String!

    # Hostname for the Agent
    hostname: String

    # Tasks associated with an Agent
    tasks(after: String, first: Int, before: String, last: Int): TaskConnection
  }

  # A connection to a list of Agents.
  type AgentConnection {
    # Information to aid in pagination.
    pageInfo: PageInfo!

    # A list of edges.
    edges: [AgentEdge]
  }

  # An edge in a connection.
  type AgentEdge {
    # The item at the end of the edge
    node: Agent

    # A cursor for use in pagination
    cursor: String!
  }
`;

export default () => [Agents, Tasks, Pagination];
