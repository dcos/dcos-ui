import {Route, Redirect} from 'react-router';

import InstalledPackagesTab from '../pages/universe/InstalledPackagesTab';
import PackageDetailTab from '../pages/universe/PackageDetailTab';
import PackagesTab from '../pages/universe/PackagesTab';
import UniversePage from '../pages/UniversePage';

let universeRoutes = {
  type: Route,
  path: 'universe',
  handler: UniversePage,
  category: 'root',
  isInSidebar: true,
  children: [
    {
      type: Route,
      path: 'packages',
      handler: PackagesTab,
      isInSidebar: true,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'Packages',
                route: {to: '/universe/packages'}
              }
            ];
          }
        };
      }
    },
    {
      type: Route,
      path: 'packages/:packageName?',
      handler: PackageDetailTab,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: '/universe/packages',
          getCrumbs(router) {
            let params = router.getCurrentParams();

            return [
              {
                label: params.packageName,
                route: {
                  to: '/universe/packages/:packageName',
                  params,
                  query: router.getCurrentQuery()
                }
              }
            ];
          }
        };
      }
    },
    {
      type: Route,
      path: 'installed-packages',
      handler: InstalledPackagesTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/universe',
      to: '/universe/packages'
    }
  ]
};

module.exports = universeRoutes;
