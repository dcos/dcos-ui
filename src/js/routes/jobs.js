import { Redirect, IndexRoute, Route } from "react-router";
/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import JobsList from "#PLUGINS/jobs-queues/src/js/jobs/JobsList";
import JobDetailPage from "../pages/jobs/JobDetailPage";
import JobsPage from "../pages/JobsPage";
import JobsTaskDetailPage from "../pages/jobs/JobTaskDetailPage";
import TaskDetailsTab from "../../../plugins/services/src/js/pages/task-details/TaskDetailsTab";
import TaskFileBrowser from "../../../plugins/services/src/js/pages/task-details/TaskFileBrowser";
import TaskFilesTab from "../../../plugins/services/src/js/pages/task-details/TaskFilesTab";
import TaskFileViewer from "../../../plugins/services/src/js/pages/task-details/TaskFileViewer";
import TaskLogsContainer from "../../../plugins/services/src/js/pages/task-details/TaskLogsContainer";

const jobsRoutes = [
  {
    type: Redirect,
    from: "/jobs",
    to: "/jobs/overview"
  },
  {
    type: Route,
    component: JobsPage,
    path: "jobs",
    category: "root",
    isInSidebar: true,
    children: [
      {
        type: Route,
        component: JobsList,
        path: "overview",
        children: [
          {
            type: Route,
            path: ":id"
          }
        ]
      },
      {
        type: Redirect,
        from: "/job/detail/:id",
        to: "/job/detail/:id/tasks"
      },
      {
        type: Route,
        component: JobDetailPage,
        path: "detail/:id",
        children: [
          {
            type: Redirect,
            path: "/jobs/detail/:id/tasks/:taskID",
            to: "/jobs/detail/:id/tasks/:taskID/details"
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
                    fileViewerRoutePath:
                      "/jobs/detail/:id/tasks/:taskID/files/view(/:filePath(/:innerPath))",
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
];

module.exports = jobsRoutes;
