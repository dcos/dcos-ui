import { Schedule as MetronomeSchedule } from "#SRC/js/events/MetronomeClient";
import {
  JobSchedule,
  JobScheduleTypeResolver,
  JobScheduleSchema
} from "#PLUGINS/jobs/src/js/types/JobSchedule";

export interface JobScheduleConnection {
  nodes: JobSchedule[];
}

export const JobScheduleConnectionSchema = `
${JobScheduleSchema}
type ScheduleConnection {
  nodes: [Schedule]!
}
`;

export function JobScheduleConnectionTypeResolver(
  schedules: MetronomeSchedule[]
): JobScheduleConnection {
  return { nodes: JobScheduleConnectionFieldResolvers.nodes(schedules) };
}

export const JobScheduleConnectionFieldResolvers = {
  nodes(schedules: MetronomeSchedule[]): JobSchedule[] {
    return schedules.map(JobScheduleTypeResolver);
  }
};
