import { Schedule as MetronomeSchedule } from "#SRC/js/events/MetronomeClient";
import { ConcurrentPolicy } from "#PLUGINS/jobs/src/js/components/form/helpers/JobFormData";

export interface JobSchedule {
  cron: string;
  enabled: boolean;
  id: string;
  startingDeadlineSeconds: number;
  timezone: string;
  concurrencyPolicy: ConcurrentPolicy;
}

export const ConcurrentPolicySchema = `
  enum ConcurrentPolicy {
    ALLOW
    FORBID
  }
  `;

export const JobScheduleSchema = `
${ConcurrentPolicySchema}
type Schedule {
  cron: String!
  enabled: Boolean!
  id: ID!
  startingDeadlineSeconds: Int!
  timezone: String!
  concurrencyPolicy: ConcurrentPolicy!
}
`;

export const JobScheduleTypeResolver = (
  schedule: MetronomeSchedule
): JobSchedule => ({
  cron: schedule.cron,
  enabled: schedule.enabled,
  id: schedule.id,
  startingDeadlineSeconds: schedule.startingDeadlineSeconds,
  timezone: schedule.timezone,
  concurrencyPolicy: schedule.concurrencyPolicy,
});
