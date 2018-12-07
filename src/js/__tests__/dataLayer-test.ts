import { Container, bindExtensionProvider } from "extension-kid";
import DataLayer, {
  DataLayerExtension,
  DataLayerExtensionInterface
} from "../dataLayer";
import { injectable, ContainerModule } from "inversify";
import gql from "graphql-tag";
import { marbles } from "rxjs-marbles/jest";

@injectable()
class JobsExtension implements DataLayerExtensionInterface {
  id = Symbol("Jobs");

  getMutationTypeDefinitions() {
    return ``;
  }
  getQueryTypeDefinitions() {
    return `jobs: Job`;
  }

  getResolvers() {
    return {
      Query: {
        jobs() {
          return [{ id: "foo", docker: "nginx" }];
        }
      }
    };
  }

  getTypeDefinitions() {
    return `
    type Job {
      id: String!
      docker: String!
    }
    `;
  }
}

// tslint:disable-next-line
@injectable()
class TasksExtension implements DataLayerExtensionInterface {
  id = Symbol("Tasks");

  getMutationTypeDefinitions() {
    return `
    deleteTask(id: String): Boolean
    `;
  }
  getQueryTypeDefinitions() {
    return `
    task(id: String): Task
    `;
  }

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
      }
    };
  }

  getTypeDefinitions() {
    return `
    type Task {
      id: String!
      log: String!
    }
    `;
  }
}

const DataLayerSymbol = Symbol("DataLayer");
describe("DataLayer", () => {
  let container: Container;
  beforeEach(() => {
    container = new Container();
    const dataLayerModule = new ContainerModule(bind => {
      bindExtensionProvider(bind, DataLayerExtension);
    });

    container.load(dataLayerModule);

    container
      .bind(DataLayerSymbol)
      .to(DataLayer)
      .inSingletonScope();
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

  it("allows to extend the schema based on active extensions");
  it("provides an extended schema with nested types");
  it("extends a schema while a query is running");
});
