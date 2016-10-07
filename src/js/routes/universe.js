import {Route, Redirect} from 'react-router';

import InstalledPackagesTab from '../pages/universe/InstalledPackagesTab';
import PackageDetailTab from '../pages/universe/PackageDetailTab';
import PackagesTab from '../pages/universe/PackagesTab';
import UniversePage from '../pages/UniversePage';

let universeRoutes = {
  type: Route,
  name: 'universe',
  path: 'universe',
  component: UniversePage,
  category: 'root',
  isInSidebar: true,
  children: [
    {
      type: Route,
      name: 'universe-packages',
      path: 'packages',
      component: PackagesTab,
      isInSidebar: true,
      buildBreadCrumb() {
        return {
          getCrumbs() {
            return [
              {
                label: 'Packages',
                route: {to: 'universe-packages'}
              }
            ];
          }
        };
      }
    },
    {
      type: Route,
      name: 'universe-packages-detail',
      path: 'packages/:packageName?',
      component: PackageDetailTab,
      hideHeaderNavigation: true,
      buildBreadCrumb() {
        return {
          parentCrumb: 'universe-packages',
          getCrumbs(router) {
            let params = router.getCurrentParams();

            return [
              {
                label: params.packageName,
                route: {
                  to: 'universe-packages-detail',
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
      name: 'universe-installed-packages',
      path: 'installed-packages',
      component: InstalledPackagesTab,
      isInSidebar: true
    },
    {
      type: Redirect,
      from: '/universe',
      to: 'universe-packages'
    }
  ]
};

module.exports = universeRoutes;
