import Tasks from '../tasks/schema';

const Application = `
  # An Application
  type Application {
    # The ID of an object
    id: String!

    # The ID of parent group
    parentId: String

    # Summary of Tasks contained in Application
    taskStatus: TaskStatus!

    # Tasks associated with a Service
    tasks(after: String, first: Int, before: String, last: Int): TaskConnection

  }
`;

export default () => [Application, Tasks];
