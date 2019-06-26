import {
  resolvers as GroupResolvers,
  ResolverArgs as GroupResolverArgs
} from "./resolvers";

export const resolvers = (args: GroupResolverArgs) => GroupResolvers(args);
