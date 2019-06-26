import { resolvers as GroupResolvers } from "./groups";

export interface ResolverArgs {
  pollingInterval: number;
}

export const resolvers = (args: ResolverArgs) => {
  const groupResolvers = GroupResolvers({
    pollingInterval: args.pollingInterval
  });
  return { ...groupResolvers };
};
