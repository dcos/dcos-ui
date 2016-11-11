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

PluginSDK.routingService.registerRedirect('/styles', '/styles/layout');
PluginSDK.routingService.registerRedirect('/styles/layout', '/styles/layout/containers');

PluginSDK.routingService.registerTab('styles', 'layout/containers', ContainersTabContent);
PluginSDK.routingService.registerTab('styles', 'layout/grid', GridTabContent);
PluginSDK.routingService.registerTab('styles', 'layout/pods', PodsTabContent);
PluginSDK.routingService.registerTab('styles', 'layout/flex', FlexTabContent);
PluginSDK.routingService.registerTab('styles', 'layout/dividers', DividersTabContent);
PluginSDK.routingService.registerTab('styles', 'layout/responsive-utilities', ResponsiveUtilitiesTabContent);

PluginSDK.routingService.registerRedirect('/styles/content', '/styles/content/typography');
PluginSDK.routingService.registerTab('styles', 'content/typography', TypographyTabContent);
PluginSDK.routingService.registerTab('styles', 'content/tables', TablesTabContent);
PluginSDK.routingService.registerTab('styles', 'content/colors', ColorsTabContent);
PluginSDK.routingService.registerTab('styles', 'content/code', CodeTabContent);
PluginSDK.routingService.registerTab('styles', 'content/images', ImagesTabContent);

PluginSDK.routingService.registerRedirect('/styles/components', '/styles/components/buttons');
PluginSDK.routingService.registerTab('styles', 'components/buttons', ButtonsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/button-collections', ButtonCollectionsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/button-groups', ButtonGroupsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/dropdowns', DropdownsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/forms', FormsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/icons', IconsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/modals', ModalsTabContent);
PluginSDK.routingService.registerTab('styles', 'components/panels', PanelsTabContent);
PluginSDK.routingService.registerPage('styles', StylesPage);
