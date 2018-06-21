import { Job } from "#PLUGINS/jobs/src/js/types/Job";

export interface JobConnection {
  namespace: string[];
  filteredCount: number;
  totalCount: number;
  nodes: Job[];
}

export const JobConnectionSchema = `
type JobConnection {
  namespace: [String]!
  filteredCount: Int!
  totalCount: Int!
  nodes: [Job]!
}
`;

export function JobConnectionTypeResolver(response: any): any {
  return response;
}
