import {Route, Redirect} from 'react-router';

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

const existingStylesPage = PluginSDK.routingService.findPage('/styles');
existingStylesPage.addTab('content/typography', TypographyTabContent);
existingStylesPage.addTab('content/tables', TablesTabContent);

const stylesPage = PluginSDK.routingService.registerPage('/styles', StylesPage);
stylesPage.addTab('layout/containers', ContainersTabContent);
stylesPage.addTab('layout/grid', GridTabContent);

let stylesRoutes = [
  {
    type: Redirect,
    from: '/styles',
    to: '/styles/layout'
  },
  {
    type: Route,
    path: 'styles',
    component: StylesPage,
    children: [
      {
        type: Redirect,
        from: '/styles/layout',
        to: '/styles/layout/containers'
      },
      {
        type: Route,
        path: 'layout',
        children: [
          {
            type: Route,
            path: 'containers',
            component: ContainersTabContent
          },
          {
            type: Route,
            path: 'grid',
            component: GridTabContent
          },
          {
            type: Route,
            path: 'pods',
            component: PodsTabContent
          },
          {
            type: Route,
            path: 'flex',
            component: FlexTabContent
          },
          {
            type: Route,
            path: 'dividers',
            component: DividersTabContent
          },
          {
            type: Route,
            path: 'responsive-utilities',
            component: ResponsiveUtilitiesTabContent
          }
        ]
      },
      {
        type: Redirect,
        from: '/styles/content',
        to: '/styles/content/typography'
      },
      {
        type: Route,
        path: 'content',
        children: [
          {
            type: Route,
            path: 'typography',
            component: TypographyTabContent
          },
          {
            type: Route,
            path: 'tables',
            component: TablesTabContent
          },
          {
            type: Route,
            path: 'colors',
            component: ColorsTabContent
          },
          {
            type: Route,
            path: 'code',
            component: CodeTabContent
          },
          {
            type: Route,
            path: 'images',
            component: ImagesTabContent
          }
        ]
      },
      {
        type: Redirect,
        from: '/styles/components',
        to: '/styles/components/buttons'
      },
      {
        type: Route,
        path: 'components',
        children: [
          {
            type: Route,
            path: 'buttons',
            component: ButtonsTabContent
          },
          {
            type: Route,
            path: 'button-collections',
            component: ButtonCollectionsTabContent
          },
          {
            type: Route,
            path: 'button-groups',
            component: ButtonGroupsTabContent
          },
          {
            type: Route,
            path: 'dropdowns',
            component: DropdownsTabContent
          },
          {
            type: Route,
            path: 'forms',
            component: FormsTabContent
          },
          {
            type: Route,
            path: 'icons',
            component: IconsTabContent
          },
          {
            type: Route,
            path: 'modals',
            component: ModalsTabContent
          },
          {
            type: Route,
            path: 'panels',
            component: PanelsTabContent
          }
        ]
      }
    ]
  }
];

module.exports = stylesRoutes;
