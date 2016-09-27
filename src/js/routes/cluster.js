import {Route, Redirect} from 'react-router';

import ClusterPage from '../pages/ClusterPage';
import OverviewDetailTab from '../pages/system/OverviewDetailTab';

let clusterRoutes = {
  type: Route,
  name: 'cluster',
  path: 'cluster/?',
  handler: ClusterPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: Route,
      handler: OverviewDetailTab,
      name: 'cluster-overview',
      path: 'overview/?'
    },
    {
      type: Redirect,
      from: '/cluster/?',
      to: 'cluster-overview'
    }
  ]
};

module.exports = clusterRoutes;
