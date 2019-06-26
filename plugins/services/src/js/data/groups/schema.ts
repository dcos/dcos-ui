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
    gpu: QuotaResources
  }
  
  type ServiceGroup {
    id: String!
    quota: ServiceGroupQuota
  }
`;