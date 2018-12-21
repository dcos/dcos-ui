import { Container, bindExtensionProvider } from "extension-kid";
import DataLayer, {
  DataLayerExtension,
  DataLayerExtensionInterface
} from "../dataLayer";
import { injectable, ContainerModule } from "inversify";
import gql from "graphql-tag";
import { marbles } from "rxjs-marbles/jest";

const JobsSymbol = Symbol("Jobs");
@injectable()
class JobsExtension implements DataLayerExtensionInterface {
  id = JobsSymbol;

  getResolvers(activeExtensions: symbol[]) {
    const hasJobs = activeExtensions.includes(TasksSymbol);

    const additionalJobData = hasJobs ? { taskId: "foo-task" } : {};

    return {
      Query: {
        jobs() {
          return [{ id: "foo", docker: "nginx", ...additionalJobData }];
        }
      }
    };
  }

  getTypeDefinitions(activeExtensions: symbol[]) {
    const hasJobs = activeExtensions.includes(TasksSymbol);

    return `
    extend type Mutation {
      deleteJob(id: String): Boolean
    }

    extend type Query {
      jobs: Job
    }

    type Job {
      id: String!
      docker: String!
      ${hasJobs ? "taskId: String!" : ""}
    }
    `;
  }
}

const TasksSymbol = Symbol("Tasks");
// tslint:disable-next-line
@injectable()
class TasksExtension implements DataLayerExtensionInterface {
  id = TasksSymbol;

  getResolvers() {
    return {
      Query: {
        task(_: any, args: { id?: string }) {
          const id = args.id || "unknown";
          return {
            id,
            log: id + "log"
          };
        }
      },
      Mutation: {
        deleteTask(id: string) {
          return id === "deletable-task";
        }
      },
      Job: {
        task(parent: { id: string }) {
          return {
            id: parent.id + "task",
            log: parent.id + "tasklog"
          };
        }
      }
    };
  }

  getTypeDefinitions(activeExtensions: symbol[]) {
    const hasJobs = activeExtensions.includes(TasksSymbol);

    const jobTypeExtension = `
    extend type Job {
      task: Task
    }
    `;

    return `
    extend type Query {
      task(id: String): Task
    }

    extend type Mutation {
      deleteTask(id: String): Boolean
    }

    type Task {
      id: String!
      log: String!
    }

    ${hasJobs ? jobTypeExtension : ""}
    `;
  }
}

const DataLayerSymbol = Symbol("DataLayer");
describe("DataLayer", () => {
  let container: Container;
  beforeEach(async () => {
    container = new Container();
    const dataLayerModule = new ContainerModule(bind => {
      bindExtensionProvider(bind, DataLayerExtension);
    });

    container.load(dataLayerModule);

    await container.bindAsync(DataLayerSymbol, bts => {
      bts.to(DataLayer).inSingletonScope();
    });
  });

  // is this possible?
  it("does not error without an extension");

  it(
    "provides an extended schema",
    marbles(m => {
      m.bind();

      container
        .bind(DataLayerExtension)
        .to(JobsExtension)
        .inSingletonScope();

      container
        .bind(DataLayerExtension)
        .to(TasksExtension)
        .inSingletonScope();
      const dl: DataLayer = container.get<DataLayer>(DataLayerSymbol);
      const query = gql`
        query {
          jobs {
            id
            docker
          }
          task(id: "foo") {
            id
            log
          }
        }
      `;

      const expected$ = m.cold("(a|)", {
        a: {
          data: {
            jobs: [{ id: "foo", docker: "nginx" }],
            task: { id: "foo", log: "foolog" }
          }
        }
      });

      m.expect(dl.query(query, null).take(1)).toBeObservable(expected$);
    })
  );

  it(
    "provides an extended schema with nested types",
    marbles(m => {
      m.bind();
      const query = gql`
        query {
          jobs {
            id
            docker
            task {
              id
              log
            }
          }
          task(id: "foo") {
            id
            log
          }
        }
      `;

      container
        .bind(DataLayerExtension)
        .to(JobsExtension)
        .inSingletonScope();
      container
        .bind(DataLayerExtension)
        .to(TasksExtension)
        .inSingletonScope();
      const dl: DataLayer = container.get<DataLayer>(DataLayerSymbol);

      const expected$ = m.cold("(a|)", {
        a: {
          data: {
            jobs: [
              {
                id: "foo",
                docker: "nginx",
                task: { id: "footask", log: "footasklog" }
              }
            ],
            task: { id: "foo", log: "foolog" }
          }
        }
      });

      m.expect(dl.query(query, null).take(1)).toBeObservable(expected$);
    })
  );

  it(
    "provides an extended schema with nested types independent of import order",
    marbles(m => {
      m.bind();
      const query = gql`
        query {
          jobs {
            id
            docker
            task {
              id
              log
            }
          }
          task(id: "foo") {
            id
            log
          }
        }
      `;

      container
        .bind(DataLayerExtension)
        .to(TasksExtension)
        .inSingletonScope();
      container
        .bind(DataLayerExtension)
        .to(JobsExtension)
        .inSingletonScope();

      const dl: DataLayer = container.get<DataLayer>(DataLayerSymbol);

      const expected$ = m.cold("(a|)", {
        a: {
          data: {
            jobs: [
              {
                id: "foo",
                docker: "nginx",
                task: { id: "footask", log: "footasklog" }
              }
            ],
            task: { id: "foo", log: "foolog" }
          }
        }
      });

      m.expect(dl.query(query, null).take(1)).toBeObservable(expected$);
    })
  );

  it("allows to conditionally extend the schema based on active extensions", async () => {
    jest.useRealTimers();
    await container.bindAsync(DataLayerExtension, bts => {
      bts.to(JobsExtension).inSingletonScope();
    });

    const dl: DataLayer = container.get<DataLayer>(DataLayerSymbol);

    const query = gql`
      query {
        jobs {
          task {
            id
          }
        }
      }
    `;

    await expect(dl.query(query).toPromise()).resolves.toEqual({
      data: {},
      errors: [{ message: "There was a GraphQL error" }]
    });

    await container.bindAsync(DataLayerExtension, bts => {
      bts.to(TasksExtension).inSingletonScope();
    });

    await expect(dl.query(query).toPromise()).resolves.toEqual({
      data: { jobs: [{ task: { id: "footask" } }] }
    });
  });
  it("extends a schema while a query is running");
});
