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

  it(
    "does not error without an extension",
    marbles(m => {
      const dl = container.get<DataLayer>(DataLayerType);

      const query = gql`
        query {
          isPresent
        }
      `;

      const expected$ = m.cold("(a|)", {
        a: {
          data: {
            isPresent: true
          }
        }
      });

      m.expect(dl.query(query, null).pipe(take(1))).toBeObservable(expected$);
    })
  );

  it(
    "provides an extended schema",
    marbles(m => {
      const jobModuleExtension = getExtensionModule(JobsExtension);
      if (!jobModuleExtension) {
        throw new Error("Could not get extension module for jobs extension");
      }
      container.load(jobModuleExtension);

      const tasksModuleExtension = getExtensionModule(TasksExtension);
      if (!tasksModuleExtension) {
        throw new Error("Could not get extension module for tasks extension");
      }
      container.load(tasksModuleExtension);

      const dl = container.get<DataLayer>(DataLayerType);
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

      const jobModuleExtension = getExtensionModule(JobsExtension);
      if (!jobModuleExtension) {
        throw new Error("Could not get extension module for jobs extension");
      }
      container.load(jobModuleExtension);

      const tasksModuleExtension = getExtensionModule(TasksExtension);
      if (!tasksModuleExtension) {
        throw new Error("Could not get extension module for tasks extension");
      }
      container.load(tasksModuleExtension);

      const dl = container.get<DataLayer>(DataLayerType);

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

      const jobModuleExtension = getExtensionModule(JobsExtension);
      if (!jobModuleExtension) {
        throw new Error("Could not get extension module for jobs extension");
      }
      container.load(jobModuleExtension);

      const tasksModuleExtension = getExtensionModule(TasksExtension);
      if (!tasksModuleExtension) {
        throw new Error("Could not get extension module for tasks extension");
      }
      container.load(tasksModuleExtension);

      const dl = container.get<DataLayer>(DataLayerType);

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

    const dl = container.get<DataLayer>(DataLayerType);

    const query = gql`
      query {
        jobs {
          task {
            id
          }
        }
      }
    `;

    await expect(toPromise(dl.query(query).pipe(take(1)))).rejects.toEqual(
      new Error(
        "reactive-graphql: field 'task' was not found on type 'Job'. The only fields found in this Object are: id,docker."
      )
    );

    await container.bindAsync(DataLayerExtensionType, bts => {
      bts.to(TasksExtension).inSingletonScope();
    });

    await expect(toPromise(dl.query(query).pipe(take(1)))).resolves.toEqual({
      data: { jobs: [{ task: { id: "footask" } }] }
    });
  });

  // This can currently not be done, because reactive-graphql completes the observable as an error
  // It relates to this issue: https://github.com/mesosphere/reactive-graphql/issues/13
  it("extends a schema while a query is running");
});
