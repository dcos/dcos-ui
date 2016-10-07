import {Route, Redirect} from 'react-router';

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

let stylesRoutes = {
  type: Route,
  name: 'styles',
  path: 'styles',
  component: StylesPage,
  children: [
    {
      type: Route,
      name: 'styles-layout-tab',
      path: 'layout',
      children: [
        {
          type: Route,
          name: 'styles-layout-containers',
          path: 'containers',
          component: ContainersTabContent
        },
        {
          type: Route,
          name: 'styles-layout-grid',
          path: 'grid',
          component: GridTabContent
        },
        {
          type: Route,
          name: 'styles-layout-pods',
          path: 'pods',
          component: PodsTabContent
        },
        {
          type: Route,
          name: 'styles-layout-flex',
          path: 'flex',
          component: FlexTabContent
        },
        {
          type: Route,
          name: 'styles-layout-dividers',
          path: 'dividers',
          component: DividersTabContent
        },
        {
          type: Route,
          name: 'styles-layout-responsive-utilities',
          path: 'responsive-utilities',
          component: ResponsiveUtilitiesTabContent
        },
        {
          type: Redirect,
          from: '/styles/layout',
          to: 'styles-layout-containers'
        }
      ]
    },
    {
      type: Route,
      name: 'styles-content-tab',
      path: 'content',
      children: [
        {
          type: Route,
          name: 'styles-content-typography',
          path: 'typography',
          component: TypographyTabContent
        },
        {
          type: Route,
          name: 'styles-content-tables',
          path: 'tables',
          component: TablesTabContent
        },
        {
          type: Route,
          name: 'styles-content-colors',
          path: 'colors',
          component: ColorsTabContent
        },
        {
          type: Route,
          name: 'styles-content-code',
          path: 'code',
          component: CodeTabContent
        },
        {
          type: Route,
          name: 'styles-content-images',
          path: 'images',
          component: ImagesTabContent
        },
        {
          type: Redirect,
          from: '/styles/content',
          to: 'styles-content-typography'
        }
      ]
    },
    {
      type: Route,
      name: 'styles-components-tab',
      path: 'components',
      children: [
        {
          type: Route,
          name: 'styles-components-buttons',
          path: 'buttons',
          component: ButtonsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-collections',
          path: 'button-collections',
          component: ButtonCollectionsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-groups',
          path: 'button-groups',
          component: ButtonGroupsTabContent
        },
        {
          type: Route,
          name: 'styles-components-dropdowns',
          path: 'dropdowns',
          component: DropdownsTabContent
        },
        {
          type: Route,
          name: 'styles-components-forms',
          path: 'forms',
          component: FormsTabContent
        },
        {
          type: Route,
          name: 'styles-components-icons',
          path: 'icons',
          component: IconsTabContent
        },
        {
          type: Route,
          name: 'styles-components-modals',
          path: 'modals',
          component: ModalsTabContent
        },
        {
          type: Route,
          name: 'styles-components-panels',
          path: 'panels',
          component: PanelsTabContent
        },
        {
          type: Redirect,
          from: '/styles/components',
          to: 'styles-components-buttons'
        }
      ]
    },
    {
      type: Redirect,
      from: '/styles',
      to: 'styles-layout-tab'
    }
  ]
};

module.exports = stylesRoutes;
