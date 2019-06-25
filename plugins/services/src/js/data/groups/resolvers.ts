import { IResolvers } from "graphql-tools";
import { of, throwError } from "rxjs";

export interface ServiceGroupQueryArgs {
  id: string;
}
const isGroupArgs = (
  args: Record<string, any>
): args is ServiceGroupQueryArgs => {
  return (args as ServiceGroupQueryArgs).id !== undefined;
};

export function resolvers(): IResolvers {
  return {
    ServiceGroup: {
      quota() {
        return of({ enforced: false });
      }
    },
    Query: {
      group(_parent = {}, args: Record<string, unknown> = {}) {
        if (!isGroupArgs(args)) {
          return throwError(
            "Group resolver arguments aren't valid for type ServiceGroupQueryArgs"
          );
        }

        return of({ id: args.id });
      },
      groups() {
        return of([]);
      }
    }
  };
}
