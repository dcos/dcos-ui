import RoutingService from './src/routing';
import NavigationService from './src/navigation';
import {MountService} from './src/mount';
import Mount from './src/mount/Mount';

module.exports = {
  MountService: {
    Mount,
    MountService
  },
  NavigationService,
  RoutingService
};
