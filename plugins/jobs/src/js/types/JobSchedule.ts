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

export function JobScheduleTypeResolver(
  schedule: MetronomeSchedule
): JobSchedule {
  return {
    cron: JobScheduleFieldResolvers.cron(schedule),
    enabled: JobScheduleFieldResolvers.enabled(schedule),
    id: JobScheduleFieldResolvers.id(schedule),
    startingDeadlineSeconds: JobScheduleFieldResolvers.startingDeadlineSeconds(
      schedule
    ),
    timezone: JobScheduleFieldResolvers.timezone(schedule)
  };
}
export const JobScheduleFieldResolvers = {
  cron(schedule: MetronomeSchedule): string {
    return schedule.cron;
  },
  enabled(schedule: MetronomeSchedule): boolean {
    return schedule.enabled;
  },
  id(schedule: MetronomeSchedule): string {
    return schedule.id;
  },
  startingDeadlineSeconds(schedule: MetronomeSchedule): number {
    return schedule.startingDeadlineSeconds;
  },
  timezone(schedule: MetronomeSchedule): string {
    return schedule.timezone;
  }
};
