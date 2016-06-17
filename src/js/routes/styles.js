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
  path: 'styles/?',
  handler: StylesPage,
  children: [
    {
      type: Route,
      name: 'styles-layout-tab',
      path: 'layout/?',
      children: [
        {
          type: Route,
          name: 'styles-layout-containers',
          path: 'containers/?',
          handler: ContainersTabContent
        },
        {
          type: Route,
          name: 'styles-layout-grid',
          path: 'grid/?',
          handler: GridTabContent
        },
        {
          type: Route,
          name: 'styles-layout-pods',
          path: 'pods/?',
          handler: PodsTabContent
        },
        {
          type: Route,
          name: 'styles-layout-flex',
          path: 'flex/?',
          handler: FlexTabContent
        },
        {
          type: Route,
          name: 'styles-layout-dividers',
          path: 'dividers/?',
          handler: DividersTabContent
        },
        {
          type: Route,
          name: 'styles-layout-responsive-utilities',
          path: 'responsive-utilities/?',
          handler: ResponsiveUtilitiesTabContent
        },
        {
          type: Redirect,
          from: '/styles/layout/?',
          to: 'styles-layout-containers'
        }
      ]
    },
    {
      type: Route,
      name: 'styles-content-tab',
      path: 'content/?',
      children: [
        {
          type: Route,
          name: 'styles-content-typography',
          path: 'typography/?',
          handler: TypographyTabContent
        },
        {
          type: Route,
          name: 'styles-content-tables',
          path: 'tables/?',
          handler: TablesTabContent
        },
        {
          type: Route,
          name: 'styles-content-colors',
          path: 'colors/?',
          handler: ColorsTabContent
        },
        {
          type: Route,
          name: 'styles-content-code',
          path: 'code/?',
          handler: CodeTabContent
        },
        {
          type: Route,
          name: 'styles-content-images',
          path: 'images/?',
          handler: ImagesTabContent
        },
        {
          type: Redirect,
          from: '/styles/content/?',
          to: 'styles-content-typography'
        }
      ]
    },
    {
      type: Route,
      name: 'styles-components-tab',
      path: 'components/?',
      children: [
        {
          type: Route,
          name: 'styles-components-buttons',
          path: 'buttons/?',
          handler: ButtonsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-collections',
          path: 'button-collections/?',
          handler: ButtonCollectionsTabContent
        },
        {
          type: Route,
          name: 'styles-components-button-groups',
          path: 'button-groups/?',
          handler: ButtonGroupsTabContent
        },
        {
          type: Route,
          name: 'styles-components-dropdowns',
          path: 'dropdowns/?',
          handler: DropdownsTabContent
        },
        {
          type: Route,
          name: 'styles-components-forms',
          path: 'forms/?',
          handler: FormsTabContent
        },
        {
          type: Route,
          name: 'styles-components-icons',
          path: 'icons/?',
          handler: IconsTabContent
        },
        {
          type: Route,
          name: 'styles-components-modals',
          path: 'modals/?',
          handler: ModalsTabContent
        },
        {
          type: Route,
          name: 'styles-components-panels',
          path: 'panels/?',
          handler: PanelsTabContent
        },
        {
          type: Redirect,
          from: '/styles/components/?',
          to: 'styles-components-buttons'
        }
      ]
    },
    {
      type: Redirect,
      from: '/styles/?',
      to: 'styles-layout-tab'
    }
  ]
};

module.exports = stylesRoutes;
