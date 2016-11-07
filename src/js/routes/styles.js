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

const {
  routingService: {
    registerTab,
    registerPage,
    registerRedirect
  }
} = PluginSDK;

registerPage('styles', StylesPage);

registerRedirect('/styles', '/styles/layout');
registerRedirect('/styles/layout', '/styles/layout/containers');

registerTab('styles', 'layout/containers', ContainersTabContent);
registerTab('styles', 'layout/grid', GridTabContent);
registerTab('styles', 'layout/pods', PodsTabContent);
registerTab('styles', 'layout/flex', FlexTabContent);
registerTab('styles', 'layout/dividers', DividersTabContent);
registerTab('styles', 'layout/responsive-utilities', ResponsiveUtilitiesTabContent);

registerRedirect('/styles/content', '/styles/content/typography');
registerTab('styles', 'content/typography', TypographyTabContent);
registerTab('styles', 'content/tables', TablesTabContent);
registerTab('styles', 'content/colors', ColorsTabContent);
registerTab('styles', 'content/code', CodeTabContent);
registerTab('styles', 'content/images', ImagesTabContent);

registerRedirect('/styles/components', '/styles/components/buttons');
registerTab('styles', 'components/buttons', ButtonsTabContent);
registerTab('styles', 'components/button-collections', ButtonCollectionsTabContent);
registerTab('styles', 'components/button-groups', ButtonGroupsTabContent);
registerTab('styles', 'components/dropdowns', DropdownsTabContent);
registerTab('styles', 'components/forms', FormsTabContent);
registerTab('styles', 'components/icons', IconsTabContent);
registerTab('styles', 'components/modals', ModalsTabContent);
registerTab('styles', 'components/panels', PanelsTabContent);
