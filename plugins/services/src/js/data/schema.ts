import { GroupTypes } from "./groups/schema";

export const typeDefs = `  
  ${GroupTypes}
  
  extend type Query {
    group(id: String!): ServiceGroup
    groups(filter: String): [ServiceGroup!]!
  }
`;
