import {Route, Redirect} from 'react-router';

import InstalledPackagesTab from '../pages/universe/InstalledPackagesTab';
import PackageDetailTab from '../pages/universe/PackageDetailTab';
import PackagesTab from '../pages/universe/PackagesTab';
import UniversePage from '../pages/UniversePage';

let universeRoutes = {
  type: Route,
  name: 'universe',
  path: 'universe/?',
  handler: UniversePage,
  children: [
    {
      type: Route,
      name: 'universe-packages',
      path: 'packages/?',
      handler: PackagesTab,
      buildBreadCrumb: function () {
        return {
          getCrumbs: function () {
            return [
              {
                label: 'Packages',
                route: {to: 'universe-packages'}
              }
            ];
          }
        }
      }
    },
    {
      type: Route,
      name: 'universe-packages-detail',
      path: 'packages/:packageName?:packageVersion?',
      handler: PackageDetailTab,
      hideHeaderNavigation: true,
      buildBreadCrumb: function () {
        return {
          parentCrumb: 'universe-packages',
          getCrumbs: function (router) {
            return [
              {
                label: router.getCurrentParams().packageName
              }
            ];
          }
        }
      }
    },
    {
      type: Route,
      name: 'universe-installed-packages',
      path: 'installed-packages/?',
      handler: InstalledPackagesTab
    },
    {
      type: Redirect,
      from: '/universe/?',
      to: 'universe-packages'
    }
  ]
};

module.exports = universeRoutes;
