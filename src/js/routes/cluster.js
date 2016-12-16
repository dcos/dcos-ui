import {Route, IndexRoute} from 'react-router';

import ClusterPage from '../pages/ClusterPage';
import OverviewDetailTab from '../pages/system/OverviewDetailTab';

const clusterRoutes = {
  type: Route,
  path: 'cluster',
  component: ClusterPage,
  category: 'system',
  isInSidebar: true,
  children: [
    {
      type: IndexRoute,
      component: OverviewDetailTab
    }
  ]
};

module.exports = clusterRoutes;
