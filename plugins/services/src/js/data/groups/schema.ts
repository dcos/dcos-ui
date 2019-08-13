export const GroupTypes = `
  type QuotaResources {
    guarantee: Float
    limit: Float
    effectiveLimit: Float
    consumed: Float
  }
  
  type ServiceGroupQuotaRoles {
    count: Int!
    groupRoleCount: Int!
  }
  
  type ServiceGroupQuota {
    enforced: Boolean!    
    limitStatus: String!
    serviceRoles: ServiceGroupQuotaRoles
    cpus: QuotaResources
    memory: QuotaResources
    disk: QuotaResources
    gpus: QuotaResources
  }
  
  type ServiceGroup {
    id: String!
    name: String!
    quota: ServiceGroupQuota
  }
  
  type MesosResources {
    cpus: Float
    disk: Float
    gpus: Float
    mem: Float
    ports: String
  }
  
  type MesosQuota {
    role: String
    guarantee: MesosResources
    limit: MesosResources
    consumed: MesosResources
  }
  
  type MesosRole {
    name: String!
    weight: Float!
    frameworks: [String!]
    resources: MesosResources
    quota: MesosQuota
  }
  
  type GroupQuota {
    cpus: Float
    mem: Float
    disk: Float
    gpus: Float
  }
  
  type GroupWithQuota {
    id: String!
    enforceRole: Boolean!
    quota: GroupQuota
  }
  
  type QuotaOvercommitResource {
    resourceName: String!
    consumed: Float!
    requestedLimit: Float!
  }
  
  type GroupMutationResponse implements MutationResponse {
    code: Int!
    success: Boolean!
    message: String!
    partialSuccess: Boolean!
    data: [QuotaOvercommitResource]
  }
`;
