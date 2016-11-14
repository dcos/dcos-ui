import Applications from '../applications/ApplicationSchema';
import Frameworks from '../frameworks/FrameworkSchema';
import Tasks from '../tasks/TaskSchema';

const Groups = `
  # Union which resolves to one of Group, Application or Framework
  union GroupContent = Group | Application | Framework

  # A Group
  type Group {
    # The ID of an object
    id: String!

    # The ID of parent group
    parentId: String

    # Summary of Tasks contained in Group
    taskStatus: TaskStatus!

    # Flat list of nested group contents
    contents(groupId: String, after: String, first: Int, before: String, last: Int): GroupContentConnection

  }

  # A connection to a list of nested Groups.
  type GroupContentConnection {
    # Information to aid in pagination.
    pageInfo: PageInfo!

    # A list of edges.
    edges: [GroupContentEdge]
  }

  # An edge in a connection.
  type GroupContentEdge {
    # The item at the end of the edge
    node: GroupContent

    # A cursor for use in pagination
    cursor: String!
  }
`;

export default () => [Groups, Applications, Frameworks, Tasks];
