import {Route, IndexRoute} from 'react-router';

import ClusterPage from '../pages/ClusterPage';
import OverviewDetailTab from '../pages/system/OverviewDetailTab';

let clusterRoutes = {
  type: Route,
  name: 'cluster',
  path: 'cluster',
  component: ClusterPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: OverviewDetailTab,
      name: 'cluster-overview',
      path: 'overview'
    }
  ]
};

module.exports = clusterRoutes;
