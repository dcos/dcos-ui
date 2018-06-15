import { Job } from "#PLUGINS/jobs/src/js/types/Job";

export interface JobConnection {
  filteredCount: number;
  totalCount: number;
  nodes: Job[];
}

export const JobConnectionSchema = `
type JobConnection {
  filteredCount: Int!
  totalCount: Int!
  nodes: [Job]!
}
`;

export function JobConnectionTypeResolver(response: any): any {
  return response;
}
