import { Job, JobTypeResolver } from "#PLUGINS/jobs/src/js/types/Job";
import { JobResponse as MetronomeJobResponse } from "src/js/events/MetronomeClient";

import JobStates from "#PLUGINS/jobs/src/js/constants/JobStates";
import JobStatus from "#PLUGINS/jobs/src/js/constants/JobStatus";
export interface JobConnection {
  path: string[];
  filteredCount: number;
  totalCount: number;
  nodes: Job[];
}

export const JobConnectionSchema = `
type JobConnection {
  path: [String]!
  filteredCount: Int!
  totalCount: Int!
  nodes: [Job]!
}
`;

export interface JobsQueryArgs {
  path: string[];
  filter?: string;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
}

export type SortOption = "ID" | "STATUS" | "LAST_RUN";

export type SortDirection = "ASC" | "DESC";

export function JobConnectionTypeResolver(
  response: MetronomeJobResponse[],
  args: JobsQueryArgs
): JobConnection {
  const { sortBy = "ID", sortDirection = "ASC", filter = "", path = [] } = args;

  const namespacedResponse: MetronomeJobResponse[] =
    path.length > 0
      ? response.filter(({ id }) => id.startsWith(path.join(".")))
      : response;

  const filteredResponse: MetronomeJobResponse[] =
    filter !== ""
      ? namespacedResponse.filter(({ id }) => id.includes(filter))
      : namespacedResponse;

  const resolvedJobs = filteredResponse.map(JobTypeResolver);

  const sortedJobs: Job[] = resolvedJobs.sort((a, b) =>
    compareJobs(a, b, sortBy, sortDirection)
  );

  // I decided not to go with fieldresolvers here, because the logic is a
  // bit more complex and we need to find a better solution first
  // JIRA: https://jira.mesosphere.com/browse/DCOS-38201
  return {
    path,
    filteredCount: sortedJobs.length,
    totalCount: namespacedResponse.length,
    nodes: sortedJobs
  };
}

// Sort and filtering
function compareJobs(
  a: Job,
  b: Job,
  sortBy: SortOption = "ID",
  sortDirection: SortDirection = "ASC"
): number {
  let result;

  switch (sortBy) {
    case "ID":
      result = compareJobById(a, b);
      break;
    case "STATUS":
      result = compareJobByStatus(a, b);
      break;
    case "LAST_RUN":
      result = compareJobByLastRun(a, b);
      break;
    default:
      result = 0;
  }

  const direction = sortDirection === "ASC" ? 1 : -1;
  return result * direction;
}

function compareJobById(a: Job, b: Job): number {
  return a.id.localeCompare(b.id);
}

function compareJobByStatus(a: Job, b: Job): number {
  return (
    JobStates[a.scheduleStatus].sortOrder -
    JobStates[b.scheduleStatus].sortOrder
  );
}

function compareJobByLastRun(a: Job, b: Job): number {
  const statusA = a.lastRunStatus ? a.lastRunStatus.status : "N/A";
  const statusB = b.lastRunStatus ? b.lastRunStatus.status : "N/A";

  return JobStatus[statusA].sortOrder - JobStatus[statusB].sortOrder;
}
