import { GroupTypes } from "./groups/schema";
import { ServicesTypes } from "./services/schema";

export const typeDefs = `  
  ${GroupTypes}
  ${ServicesTypes}
  
  extend type Query {
    group(id: String!): ServiceGroup
    groups: [ServiceGroup!]!
    service(id: String!): Service
    roles: [MesosRole!]!
  }
  
  extend type Mutation {
    createGroup(data: GroupWithQuota!): GroupMutationResponse!
    editGroup(data: GroupWithQuota!): GroupMutationResponse!
  }
`;
