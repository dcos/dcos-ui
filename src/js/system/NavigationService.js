import React from 'react';
import {Link} from 'react-router';
import PrimarySidebarLink from '../components/PrimarySidebarLink';

const NavigationService = {

  /**
   * transformRoutesToData - transforms application routes to the NavigationService
   * format. This method will be gon after we migrate all the packages
   *
   * @param  {Array} routes Application routes
   * @return {Array} NavigationService elements
   */
  transformRoutesToData(routes) {
    const indexRoute = routes.find((route) => route.id === 'index');
    const groupIndexMap = {};

    return indexRoute.childRoutes
      .filter(({isInSidebar}) => isInSidebar)
      .reduce(function (topLevelRoutes, route) {
        let {category: label, childRoutes = []} = route;

        let icon = React.cloneElement(
          route.component.routeConfig.icon,
          {className: 'sidebar-menu-item-icon icon icon-small'}
        );

        // Assign an unused index to the new route category if we don't already
        // have an index assigned to that category.
        if (groupIndexMap[label] == null) {
          let newGroupIndex = topLevelRoutes.length;

          groupIndexMap[label] = newGroupIndex;
          topLevelRoutes[newGroupIndex] = {label, children: []};
        }

        // Append the route to the corresponding label's list of routes.
        const path = `/${route.path}`;
        const link = (
          <PrimarySidebarLink
            icon={icon}
            path={path}
            label={route.component.routeConfig.label} />
        );
        const children = childRoutes
          .filter(({isInSidebar}) => isInSidebar)
          .map((childRoute) => {
            const path = `/${route.path}/${childRoute.path}`;
            const label = childRoute.component.routeConfig.label;

            return {
              path,
              link: <Link to={path}>{label}</Link>
            };
          });

        topLevelRoutes[groupIndexMap[label]].children.push({
          children,
          link,
          path
        });

        return topLevelRoutes;
      }, []);
  }

};

export default NavigationService;
