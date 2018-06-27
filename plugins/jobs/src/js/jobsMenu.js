import StringUtil from "#SRC/js/utils/StringUtil";
import UserActions from "#SRC/js/constants/UserActions";
import jobsRunNow from "./jobsRunNow";
import jobsToggleSchedule from "./jobsToggleSchedule";

export default function jobsMenu(job, customActionHandlers) {
  if (!job) {
    return [];
  }

  const actions = [];

  actions.push({
    label: "Edit",
    onItemSelect: customActionHandlers.edit
  });

  actions.push(jobsRunNow(job.getId()));

  if (job.schedules.length !== 0) {
    actions.push(jobsToggleSchedule(job));
  }

  // TODO - use delete mediator https://jira.mesosphere.com/browse/DCOS-38492
  actions.push({
    className: "text-danger",
    label: StringUtil.capitalize(UserActions.DELETE),
    onItemSelect: customActionHandlers.delete
  });

  return actions;
}
