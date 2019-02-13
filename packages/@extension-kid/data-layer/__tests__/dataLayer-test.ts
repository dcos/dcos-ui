import { Container } from "@extension-kid/core";
import dataLayerContainerModuleFactory, {
  getExtensionModule,
  DataLayerExtensionType,
  DataLayerExtensionInterface,
  DataLayerType,
  DataLayer
} from "@extension-kid/data-layer";
import { injectable } from "inversify";
import gql from "graphql-tag";
import { marbles } from "rxjs-marbles/jest";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";

function toPromise(observable: Observable<any>) {
  return new Promise((resolve, reject) =>
    observable.subscribe({ next: resolve, complete: resolve, error: reject })
  );
}

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

describe("DataLayer", () => {
  let container: Container;
  beforeEach(async () => {
    container = new Container();

    const dataLayerContainerModule = dataLayerContainerModuleFactory();

    container.load(dataLayerContainerModule);
  });

  // is this possible?
  it("does not error without an extension");

  it(
    "provides an extended schema",
    marbles(m => {
      container.load(getExtensionModule(JobsExtension));
      container.load(getExtensionModule(TasksExtension));

      const dl: DataLayer = container.get<DataLayer>(DataLayerType);
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

      m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
    })
  );

  it(
    "provides an extended schema with nested types",
    marbles(m => {
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

      container.load(getExtensionModule(JobsExtension));
      container.load(getExtensionModule(TasksExtension));

      const dl: DataLayer = container.get<DataLayer>(DataLayerType);

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

      m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
    })
  );

  it(
    "provides an extended schema with nested types independent of import order",
    marbles(m => {
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

      container.load(getExtensionModule(TasksExtension));
      container.load(getExtensionModule(JobsExtension));

      const dl: DataLayer = container.get<DataLayer>(DataLayerType);

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

      m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
    })
  );

  it("allows to conditionally extend the schema based on active extensions", async () => {
    jest.useRealTimers();
    await container.bindAsync(DataLayerExtensionType, bts => {
      bts.to(JobsExtension).inSingletonScope();
    });

    const dl: DataLayer = container.get<DataLayer>(DataLayerType);

    const query = gql`
      query {
        jobs {
          task {
            id
          }
        }
      }
    `;

    await expect(toPromise(dl.query(query).pipe(take(1)))).resolves.toEqual({
      data: {},
      errors: [
        {
          message:
            "There was a GraphQL error: Error: reactive-graphql: field 'task' was not found on type 'Job'. The only fields found in this Object are: id,docker."
        }
      ]
    });

    await container.bindAsync(DataLayerExtensionType, bts => {
      bts.to(TasksExtension).inSingletonScope();
    });

    await expect(toPromise(dl.query(query).pipe(take(1)))).resolves.toEqual({
      data: { jobs: [{ task: { id: "footask" } }] }
    });
  });

  it("extends a schema while a query is running", async () => {
    jest.useRealTimers();
    await container.bindAsync(DataLayerExtensionType, bts => {
      bts.to(JobsExtension).inSingletonScope();
    });
    const dl: DataLayer = container.get<DataLayer>(DataLayerType);

    const query = gql`
      query {
        jobs {
          task {
            id
          }
        }
      }
    `;

    const obs = dl.query(query).pipe(take(2));
    const mockNext = jest.fn();
    const subscriptionDone = new Promise(resolve =>
      obs.subscribe({ next: mockNext, complete: resolve })
    );
    await Promise.all([
      subscriptionDone,
      container.bindAsync(DataLayerExtensionType, bts => {
        bts.to(TasksExtension).inSingletonScope();
      })
    ]);

    expect(mockNext).toHaveBeenCalledTimes(2);
    expect(mockNext).toHaveBeenCalledWith({
      data: {},
      errors: [
        {
          message:
            "There was a GraphQL error: Error: reactive-graphql: field 'task' was not found on type 'Job'. The only fields found in this Object are: id,docker."
        }
      ]
    });
    expect(mockNext).toHaveBeenCalledWith({
      data: { jobs: [{ task: { id: "footask" } }] }
    });
  });
});
