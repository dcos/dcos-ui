import { Route, Redirect } from "react-router";
import { Hooks } from "PluginSDK";

import components from "./components";
import dashboard from "./dashboard";
import Index from "../pages/Index";
import jobs from "./jobs";
import Network from "./factories/network";
import nodes from "../../../plugins/nodes/src/js/routes/nodes";
import NotFoundPage from "../pages/NotFoundPage";
import Organization from "./factories/organization";
import services from "../../../plugins/services/src/js/routes/services";
import settings from "./settings";
import systemOverview from "./system-overview";
import RouterUtil from "../utils/RouterUtil";

// Modules that produce routes
const routeFactories = [Organization, Network];
let routes = null;

function getRoutes(routingService) {
  if (routes) {
    return routes;
  }

  // Statically defined routes
  routes = [].concat(
    {
      type: Redirect,
      path: "/",
      to: Hooks.applyFilter("applicationRedirectRoute", "/dashboard")
    },
    {
      type: Route,
      getChildRoutes(partialNextState, callback) {
        callback(null, routingService.getRoutes(partialNextState));
      }
    },
    dashboard,
    services,
    jobs,
    nodes,
    systemOverview,
    components,
    settings
    // Plugins routes will be appended to this array
  );

  routeFactories.forEach(function(routeFactory) {
    routes = routes.concat(routeFactory.getRoutes());
  });

  routes = [
    {
      type: Route,
      children: [
        {
          type: Route,
          id: "index",
          children: routes,
          component: Index
        },
        {
          // This is a bit tricky.
          //
          // `NotFoundPage` should not be among children of `id: index` route
          // because `path: '*'` is a glob and matches everything
          // so it will prevent all the routes that go after from being resolved
          // in our case these will be plugins routes
          //
          // Yet it expects Index to be its parent,
          // this is why we have `component: Index` twice
          // I decided not to add component Index inside NotFoundPage
          // to make it explicit
          // TODO: DCOS-11913 make it less tricky
          type: Route,
          component: Index,
          children: [
            {
              type: Route,
              path: "*",
              component: NotFoundPage
            }
          ]
        }
      ]
    }
  ];

  routes = Hooks.applyFilter("applicationRoutes", routes);
  routes = RouterUtil.buildRoutes(routes);

  return routes;
}

module.exports = {
  getRoutes
};
