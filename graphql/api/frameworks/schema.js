import Tasks from '../tasks/schema';

const Framework = `
  # A Framework
  type Framework {
    # The ID of an object
    id: String!

    # Name of Framework
    name: String!

    # The ID of parent group
    parentId: String

    # Summary of Tasks contained in Framework
    taskStatus: TaskStatus!

    # Tasks associated with a Framework
    tasks(after: String, first: Int, before: String, last: Int): TaskConnection
  }
`;

export default () => [Framework, Tasks];
