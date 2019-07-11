export const GroupTypes = `
  type QuotaResources {
    guarantee: Float
    limit: Float
    effectiveLimit: Float
    consumed: Float
  }
  
  type ServiceGroupQuota {
    enforced: Boolean!    
    cpus: QuotaResources
    memory: QuotaResources
    disk: QuotaResources
    gpus: QuotaResources
  }
  
  type ServiceGroup {
    id: String!
    name: String!
    quota: ServiceGroupQuota
    rolesLength: Int!
    groupRolesLength: Int!
  }
`;
