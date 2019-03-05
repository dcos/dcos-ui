import { ConcurrentPolicy, JobSchedule } from "../helpers/JobFormData";

/**
 * If a user has not filled out any schedule form fields, but has toggled the "Enabled"
 * checkbox to checked and unchecked, it looks to the user like the form is empty but
 * the form JSON will contain `schedule: { enabled: false }`. This will trigger validation
 * to show the user an error for a schedule's required fields, when the user may not actually
 * want to submit a schedule. This could cause confusion as the schedule section looks empty,
 * and it's not clear how to proceed without looking at the JSON editor.
 *
 * Instead, when these checkboxes are updated and they are in a toggled off state and are the
 * only properties in the schedule object, we can remove the schedule object entirely.
 */
export const schedulePropertiesCanBeDiscarded = (
  schedule: Partial<JobSchedule>
): boolean => {
  const numProps = Object.keys(schedule).length;
  if (
    numProps === 1 &&
    (schedule.enabled === false ||
      schedule.concurrentPolicy === ConcurrentPolicy.Forbid)
  ) {
    return true;
  }
  if (
    numProps === 2 &&
    (schedule.enabled === false &&
      schedule.concurrentPolicy === ConcurrentPolicy.Forbid)
  ) {
    return true;
  }
  return false;
};
