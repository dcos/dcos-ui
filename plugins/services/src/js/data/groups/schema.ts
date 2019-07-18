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
`;
