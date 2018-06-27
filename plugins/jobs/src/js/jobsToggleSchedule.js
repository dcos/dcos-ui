import { updateSchedule } from "#SRC/js/events/MetronomeClient";

export default function jobsToggleSchedule(job) {
  const [schedule] = job.schedules;
  const isEnabled = schedule ? schedule.enabled : false;

  const label = isEnabled ? "Disable Schedule" : "Enable Schedule";

  const data = Object.assign({}, schedule, { enabled: !isEnabled });

  return {
    label,
    onItemSelect() {
      // TODO - use graphql here https://jira.mesosphere.com/browse/DCOS-37617
      // take(1) makes sure the observable is going to complete after finishing
      // the request, so we don't have to care about unsubscribing.
      updateSchedule(job.id, data)
        .take(1)
        .subscribe();
    }
  };
}
