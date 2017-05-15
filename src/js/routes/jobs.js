import { Redirect, IndexRoute, Route } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import JobDetailPage from "../pages/jobs/JobDetailPage";
import JobsPage from "../pages/JobsPage";
import JobsTab from "../pages/jobs/JobsTab";
import JobsTaskDetailPage from "../pages/jobs/JobTaskDetailPage";
import TaskDetailsTab
  from "../../../plugins/services/src/js/pages/task-details/TaskDetailsTab";
import TaskFileBrowser
  from "../../../plugins/services/src/js/pages/task-details/TaskFileBrowser";
import TaskFilesTab
  from "../../../plugins/services/src/js/pages/task-details/TaskFilesTab";
import TaskFileViewer
  from "../../../plugins/services/src/js/pages/task-details/TaskFileViewer";
import TaskLogsContainer
  from "../../../plugins/services/src/js/pages/task-details/TaskLogsContainer";

const jobsRoutes = {
  type: Route,
  component: JobsPage,
  path: "jobs",
  category: "root",
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: JobsTab
    },
    {
      type: Route,
      component: JobsTab,
      children: [
        {
          type: Route,
          component: JobDetailPage,
          path: ":id",
          children: [
            {
              type: Redirect,
              path: "/jobs/:id/tasks/:taskID",
              to: "/jobs/:id/tasks/:taskID/details"
            },
            {
              type: Route,
              path: "tasks/:taskID",
              component: JobsTaskDetailPage,
              hideHeaderNavigation: true,
              children: [
                {
                  component: TaskDetailsTab,
                  isTab: true,
                  path: "details",
                  title: "Details",
                  type: Route
                },
                {
                  hideHeaderNavigation: true,
                  component: TaskFilesTab,
                  isTab: true,
                  path: "files",
                  title: "Files",
                  type: Route,
                  children: [
                    {
                      component: TaskFileBrowser,
                      fileViewerRoutePath: "/jobs/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
                      hideHeaderNavigation: true,
                      type: IndexRoute
                    },
                    {
                      component: TaskFileViewer,
                      hideHeaderNavigation: true,
                      path: "view(/:filePath(/:innerPath))",
                      type: Route
                    }
                  ]
                },
                {
                  component: TaskLogsContainer,
                  hideHeaderNavigation: true,
                  isTab: true,
                  path: "logs",
                  title: "Logs",
                  type: Route,
                  children: [
                    {
                      path: ":filePath",
                      type: Route
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

module.exports = jobsRoutes;
