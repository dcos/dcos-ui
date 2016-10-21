import {Route, Redirect} from 'react-router';

import InstalledPackagesTab from '../pages/universe/InstalledPackagesTab';
import PackageDetailTab from '../pages/universe/PackageDetailTab';
import PackagesTab from '../pages/universe/PackagesTab';
import UniversePage from '../pages/UniversePage';

let universeRoutes = [
  {
    type: Redirect,
    from: '/universe',
    to: '/universe/packages'
  },
  {
    type: Route,
    path: 'universe',
    component: UniversePage,
    category: 'root',
    isInSidebar: true,
    children: [
      {
        type: Route,
        path: 'packages',
        component: PackagesTab,
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
        path: 'packages/:packageName',
        component: PackageDetailTab,
        hideHeaderNavigation: true,
        buildBreadCrumb() {
          return {
            parentCrumb: '/universe/packages',
            getCrumbs(params) {
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
        component: InstalledPackagesTab,
        isInSidebar: true
      }
    ]
  }
];

module.exports = universeRoutes;
