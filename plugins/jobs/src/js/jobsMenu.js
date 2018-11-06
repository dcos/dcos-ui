import { i18nMark } from "@lingui/react";

import jobsRunNow from "./jobsRunNow";
import jobsToggleSchedule from "./jobsToggleSchedule";

function jobsEdit(editAction) {
  return {
    label: i18nMark("Edit"),
    onItemSelect: editAction
  };
}

function jobsDelete(deleteHandler) {
  return {
    className: "text-danger",
    label: i18nMark("Delete"),
    onItemSelect: deleteHandler
  };
}

function optionalJobsScheduleMenu(job) {
  if (job.schedules.nodes.length === 0) {
    return null;
  }

  return jobsToggleSchedule(job);
}

export default function jobsMenu(job, customActionHandlers) {
  if (!job) {
    return [];
  }

  return [
    jobsEdit(customActionHandlers.edit),
    jobsRunNow(job.id),
    optionalJobsScheduleMenu(job),
    jobsDelete(customActionHandlers.delete)
  ].filter(menuItem => menuItem !== null);
}
