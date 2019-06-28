import { Schedule as MetronomeSchedule } from "#SRC/js/events/MetronomeClient";
export interface JobSchedule {
  cron: string;
  enabled: boolean;
  id: string;
  startingDeadlineSeconds: number;
  timezone: string;
}

export const JobScheduleSchema = `
type Schedule {
  cron: String!
  enabled: Boolean!
  id: ID!
  startingDeadlineSeconds: Int!
  timezone: String!
}
`;

export const JobScheduleTypeResolver = (
  schedule: MetronomeSchedule
): JobSchedule => ({
  cron: schedule.cron,
  enabled: schedule.enabled,
  id: schedule.id,
  startingDeadlineSeconds: schedule.startingDeadlineSeconds,
  timezone: schedule.timezone
});
