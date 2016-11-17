import PluginSDK from 'PluginSDK';

import ButtonCollectionsTabContent from '../pages/styles/components/ButtonCollectionsTabContent';
import ButtonGroupsTabContent from '../pages/styles/components/ButtonGroupsTabContent';
import ButtonsTabContent from '../pages/styles/components/ButtonsTabContent';
import DropdownsTabContent from '../pages/styles/components/DropdownsTabContent';
import FormsTabContent from '../pages/styles/components/FormsTabContent';
import IconsTabContent from '../pages/styles/components/IconsTabContent';
import ModalsTabContent from '../pages/styles/components/ModalsTabContent';
import PanelsTabContent from '../pages/styles/components/PanelsTabContent';

import ContainersTabContent from '../pages/styles/layout/ContainersTabContent';
import GridTabContent from '../pages/styles/layout/GridTabContent';
import PodsTabContent from '../pages/styles/layout/PodsTabContent';
import FlexTabContent from '../pages/styles/layout/FlexTabContent';
import DividersTabContent from '../pages/styles/layout/DividersTabContent';
import ResponsiveUtilitiesTabContent from '../pages/styles/layout/ResponsiveUtilitiesTabContent';

import TypographyTabContent from '../pages/styles/content/TypographyTabContent';
import TablesTabContent from '../pages/styles/content/TablesTabContent';
import ColorsTabContent from '../pages/styles/content/ColorsTabContent';
import CodeTabContent from '../pages/styles/content/CodeTabContent';
import ImagesTabContent from '../pages/styles/content/ImagesTabContent';

import StylesPage from '../pages/StylesPage';

const {RoutingService} = PluginSDK.get('routing');

RoutingService.registerRedirect('/styles', '/styles/layout');
RoutingService.registerRedirect('/styles/layout', '/styles/layout/containers');

RoutingService.registerTab('styles', 'layout/containers', ContainersTabContent);
RoutingService.registerTab('styles', 'layout/grid', GridTabContent);
RoutingService.registerTab('styles', 'layout/pods', PodsTabContent);
RoutingService.registerTab('styles', 'layout/flex', FlexTabContent);
RoutingService.registerTab('styles', 'layout/dividers', DividersTabContent);
RoutingService.registerTab('styles', 'layout/responsive-utilities', ResponsiveUtilitiesTabContent);

RoutingService.registerRedirect('/styles/content', '/styles/content/typography');
RoutingService.registerTab('styles', 'content/typography', TypographyTabContent);
RoutingService.registerTab('styles', 'content/tables', TablesTabContent);
RoutingService.registerTab('styles', 'content/colors', ColorsTabContent);
RoutingService.registerTab('styles', 'content/code', CodeTabContent);
RoutingService.registerTab('styles', 'content/images', ImagesTabContent);

RoutingService.registerRedirect('/styles/components', '/styles/components/buttons');
RoutingService.registerTab('styles', 'components/buttons', ButtonsTabContent);
RoutingService.registerTab('styles', 'components/button-collections', ButtonCollectionsTabContent);
RoutingService.registerTab('styles', 'components/button-groups', ButtonGroupsTabContent);
RoutingService.registerTab('styles', 'components/dropdowns', DropdownsTabContent);
RoutingService.registerTab('styles', 'components/forms', FormsTabContent);
RoutingService.registerTab('styles', 'components/icons', IconsTabContent);
RoutingService.registerTab('styles', 'components/modals', ModalsTabContent);
RoutingService.registerTab('styles', 'components/panels', PanelsTabContent);
RoutingService.registerPage('styles', StylesPage);
