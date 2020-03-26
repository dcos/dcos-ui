import { Schedule as MetronomeSchedule } from "#SRC/js/events/MetronomeClient";
import {
  JobSchedule,
  JobScheduleTypeResolver,
  JobScheduleSchema,
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

export const JobScheduleConnectionTypeResolver = (
  schedules: MetronomeSchedule[]
): JobScheduleConnection => ({ nodes: schedules.map(JobScheduleTypeResolver) });
