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
  path: 'styles',
  handler: StylesPage,
  children: [
    {
      type: Route,
      path: 'layout',
      children: [
        {
          type: Route,
          path: 'containers',
          handler: ContainersTabContent
        },
        {
          type: Route,
          path: 'grid',
          handler: GridTabContent
        },
        {
          type: Route,
          path: 'pods',
          handler: PodsTabContent
        },
        {
          type: Route,
          path: 'flex',
          handler: FlexTabContent
        },
        {
          type: Route,
          path: 'dividers',
          handler: DividersTabContent
        },
        {
          type: Route,
          path: 'responsive-utilities',
          handler: ResponsiveUtilitiesTabContent
        },
        {
          type: Redirect,
          from: '/styles/layout/?',
          to: '/styles/layout/containers'
        }
      ]
    },
    {
      type: Route,
      path: 'content',
      children: [
        {
          type: Route,
          path: 'typography',
          handler: TypographyTabContent
        },
        {
          type: Route,
          path: 'tables',
          handler: TablesTabContent
        },
        {
          type: Route,
          path: 'colors',
          handler: ColorsTabContent
        },
        {
          type: Route,
          path: 'code',
          handler: CodeTabContent
        },
        {
          type: Route,
          path: 'images',
          handler: ImagesTabContent
        },
        {
          type: Redirect,
          from: '/styles/content/?',
          to: '/styles/content/typography'
        }
      ]
    },
    {
      type: Route,
      path: 'components',
      children: [
        {
          type: Route,
          path: 'buttons',
          handler: ButtonsTabContent
        },
        {
          type: Route,
          path: 'button-collections',
          handler: ButtonCollectionsTabContent
        },
        {
          type: Route,
          path: 'button-groups',
          handler: ButtonGroupsTabContent
        },
        {
          type: Route,
          path: 'dropdowns',
          handler: DropdownsTabContent
        },
        {
          type: Route,
          path: 'forms',
          handler: FormsTabContent
        },
        {
          type: Route,
          path: 'icons',
          handler: IconsTabContent
        },
        {
          type: Route,
          path: 'modals',
          handler: ModalsTabContent
        },
        {
          type: Route,
          path: 'panels',
          handler: PanelsTabContent
        },
        {
          type: Redirect,
          from: '/styles/components/?',
          to: '/styles/components/buttons'
        }
      ]
    },
    {
      type: Redirect,
      from: '/styles/?',
      to: '/styles/layout'
    }
  ]
};

module.exports = stylesRoutes;
